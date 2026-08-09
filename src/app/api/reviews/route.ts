import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const client = getClient();
  if (!client) return null;
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export interface Review {
  id?: string;
  provider_slug: string;
  reviewer_name: string;
  rating: number;
  text: string;
  service_type?: string;
  created_at?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const client = getClient();
  if (!client) {
    return NextResponse.json({ reviews: [] });
  }

  const { data, error } = await client
    .from("reviews")
    .select("*")
    .eq("provider_slug", slug)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ reviews: [] });
  }

  return NextResponse.json({ reviews: data || [] });
}

// HEAD /api/reviews?slug=xxx — returns whether the authed user already reviewed this provider
export async function HEAD(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const user = await getAuthUser(request);
  if (!user || !slug) return new NextResponse(null, { status: 400 });

  const client = getClient();
  if (!client) return new NextResponse(null, { status: 200 });

  const { data } = await client
    .from("reviews")
    .select("id")
    .eq("provider_slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  return new NextResponse(null, { status: data ? 409 : 200 });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to leave a review." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit("reviews:" + ip, 5, 3600000);
  if (!allowed) return NextResponse.json({ error: "Too many reviews. Please try again later." }, { status: 429 });

  const body = await request.json();
  const { provider_slug, author_name, reviewer_name, rating, text, service_type } = body;
  const name = reviewer_name || author_name;

  if (!provider_slug || !name || !rating || !text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }
  if (text.trim().length < 10) {
    return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
  }
  if (text.trim().length > 1000) {
    return NextResponse.json({ error: "Review must be under 1000 characters" }, { status: 400 });
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json({
      success: true,
      pending: true,
      review: { provider_slug, reviewer_name: name, rating, text, status: "pending", id: "demo-" + Date.now() },
      demo: true,
    });
  }

  // Get provider (need id and user_id to prevent self-review)
  const { data: provider } = await client
    .from("providers")
    .select("id, user_id, name, email, email_notifications")
    .eq("slug", provider_slug)
    .maybeSingle();

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // Prevent providers from reviewing their own listing
  if (provider.user_id === user.id) {
    return NextResponse.json({ error: "You cannot review your own listing." }, { status: 403 });
  }

  // One review per user per provider
  const { data: existing } = await client
    .from("reviews")
    .select("id")
    .eq("provider_slug", provider_slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this provider." }, { status: 409 });
  }

  const { data, error } = await client
    .from("reviews")
    .insert({
      provider_id: provider.id,
      provider_slug,
      user_id: user.id,
      participant_id: user.id,
      reviewer_name: name.trim().slice(0, 80),
      reviewer_email: user.email,
      rating: Math.round(rating),
      text: text.trim().slice(0, 1000),
      service_type: service_type?.trim().slice(0, 80) || null,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Review insert error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }

  // Notify the provider — the review is pending approval, not live yet
  try {
    if (provider.email && provider.email_notifications !== false) {
      const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
      await sendEmail({
        to: provider.email,
        subject: `New ${rating}-star review awaiting approval`,
        transactional: true,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
            <h2 style="font-size:20px;font-weight:800;margin-bottom:4px;">You have a new review!</h2>
            <p style="color:#666;margin-top:0;">Someone left a review on your <strong>${provider.name || "ReferAus"}</strong> listing. It's awaiting moderation approval before it goes live.</p>
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin:20px 0;">
              <p style="font-size:22px;margin:0 0 4px;">${stars}</p>
              <p style="font-weight:700;margin:0 0 4px;">${name.trim()}</p>
              ${service_type ? `<p style="font-size:12px;color:#888;margin:0 0 12px;">Service: ${service_type}</p>` : ""}
              <p style="font-style:italic;color:#333;margin:0;">&ldquo;${text.trim()}&rdquo;</p>
            </div>
            <p style="color:#666;font-size:14px;">Once approved, you'll be able to reply from your dashboard.</p>
            <a href="https://referaus.com/dashboard/reviews" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#f97316;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;">View Reviews →</a>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#aaa;font-size:12px;">ReferAus — Hunter Region NDIS Marketplace</p>
          </div>
        `,
      });
    }
  } catch (emailErr) {
    console.error("[reviews] Provider notification email failed:", emailErr);
    // Non-blocking
  }

  return NextResponse.json({ success: true, pending: true, review: data });
}
