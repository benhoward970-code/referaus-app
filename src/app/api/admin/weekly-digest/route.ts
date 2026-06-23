import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "../verify-admin";
import { sendEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://referaus.com";

/**
 * POST /api/admin/weekly-digest
 * Sends each active provider a weekly summary of their views, enquiries, and new reviews
 * for the past 7 days.
 *
 * Can be triggered manually from the admin panel or by a cron job.
 * Protected by admin auth.
 */
export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdmin(request.headers.get("authorization"));
  if (!adminCheck.ok) return adminCheck.response;
  const { admin } = adminCheck;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all providers with an email address
  const { data: providers, error: provErr } = await admin
    .from("providers")
    .select("id, name, email, slug, email_notifications")
    .not("email", "is", null);

  if (provErr || !providers) {
    return NextResponse.json({ error: provErr?.message || "Failed to fetch providers" }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const provider of providers) {
    // Skip providers who have opted out of email notifications
    if (provider.email_notifications === false) {
      skipped++;
      continue;
    }

    // Enquiries in last 7 days
    const { count: enquiryCount } = await admin
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("provider_slug", provider.slug)
      .gte("created_at", sevenDaysAgo);

    // Reviews in last 7 days
    const { data: newReviews } = await admin
      .from("reviews")
      .select("rating, reviewer_name, text")
      .eq("provider_id", provider.id)
      .gte("created_at", sevenDaysAgo)
      .limit(5);

    // All-time average rating + total reviews
    const { data: allReviews } = await admin
      .from("reviews")
      .select("rating")
      .eq("provider_id", provider.id);

    const avgRating = allReviews && allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
      : null;

    const weeklyEnquiries = enquiryCount ?? 0;
    const weeklyReviews = (newReviews || []).length;

    // Skip digest if nothing happened this week (optional — remove to always send)
    if (weeklyEnquiries === 0 && weeklyReviews === 0) {
      skipped++;
      continue;
    }

    const reviewsSection = weeklyReviews > 0 ? `
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:4px;padding:16px 20px;margin-top:16px;">
        <p style="margin:0 0 8px;font-weight:700;color:#15803d;font-size:14px;">⭐ ${weeklyReviews} new review${weeklyReviews !== 1 ? "s" : ""} this week</p>
        ${(newReviews || []).map((r) => `
          <div style="padding:8px 0;border-top:1px solid #dcfce7;">
            <p style="margin:0;font-size:13px;color:#374151;"><strong>${r.reviewer_name || "Anonymous"}</strong> — ${"★".repeat(r.rating || 0)}${"☆".repeat(5 - (r.rating || 0))}</p>
            ${r.text ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;font-style:italic;">&ldquo;${r.text}&rdquo;</p>` : ""}
          </div>
        `).join("")}
      </div>
    ` : "";

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f3f4f6;">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 32px 24px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Your Weekly Summary</h1>
          <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">${provider.name} &middot; ReferAus</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 20px;color:#374151;font-size:15px;">Here&apos;s what happened on your listing this week:</p>

          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
            <div style="flex:1;min-width:140px;background:#eff6ff;border-radius:8px;padding:16px 20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#2563eb;">${weeklyEnquiries}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">New enquiries</p>
            </div>
            <div style="flex:1;min-width:140px;background:#f0fdf4;border-radius:8px;padding:16px 20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#16a34a;">${weeklyReviews}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">New reviews</p>
            </div>
            ${avgRating ? `
            <div style="flex:1;min-width:140px;background:#fff7ed;border-radius:8px;padding:16px 20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#ea580c;">${avgRating} ★</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Overall rating</p>
            </div>` : ""}
          </div>

          ${reviewsSection}

          <div style="margin-top:24px;text-align:center;">
            <a href="${APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
              View Your Dashboard →
            </a>
          </div>

          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
            You&apos;re receiving this because you have a listing on ReferAus. &middot;
            <a href="${APP_URL}/dashboard/notifications" style="color:#9ca3af;">Manage notifications</a>
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: provider.email,
        subject: `Your ReferAus weekly summary — ${weeklyEnquiries} enquiries, ${weeklyReviews} reviews`,
        html,
        transactional: true,
      });
      sent++;
    } catch (err) {
      errors.push(`${provider.name}: ${err}`);
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  });
}
