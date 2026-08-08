import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/enquiries/reply
 * Lets a provider reply to an enquiry directly from their dashboard.
 * Sends the reply email to the enquirer and marks replied_at in DB.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  const admin = getAdmin();

  // Verify the user token
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { enquiry_id, message } = body as { enquiry_id?: string; message?: string };

  if (!enquiry_id || !message?.trim()) {
    return NextResponse.json({ error: "enquiry_id and message are required" }, { status: 400 });
  }

  if (message.trim().length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000 characters)" }, { status: 400 });
  }

  // Get the provider for this user
  const { data: provider } = await admin
    .from("providers")
    .select("id, slug, name, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider) {
    return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
  }

  // Fetch the enquiry — must belong to this provider
  const { data: enquiry } = await admin
    .from("enquiries")
    .select("id, name, email, message, provider_slug, replied_at")
    .eq("id", enquiry_id)
    .eq("provider_slug", provider.slug)
    .maybeSingle();

  const row = enquiry as {
    id: string;
    name: string | null;
    email: string | null;
    message: string | null;
    provider_slug: string | null;
    replied_at: string | null;
  } | null;

  if (!row) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  if (!row.email) {
    return NextResponse.json({ error: "Enquiry has no reply email address" }, { status: 400 });
  }

  // Send reply email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://referaus.com";
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f3f4f6;">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 32px 24px;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Reply from ${provider.name}</h1>
        <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">via ReferAus NDIS Provider Directory</p>
      </div>
      <div style="padding:28px 32px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;">Hi ${row.name || "there"},</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;">
          ${provider.name} has replied to your enquiry:
        </p>
        <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:4px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;white-space:pre-wrap;">${message.trim()}</p>
        </div>
        ${row.message ? `
        <details style="margin-bottom:20px;">
          <summary style="color:#6b7280;font-size:13px;cursor:pointer;">Your original message</summary>
          <p style="margin:8px 0 0;color:#9ca3af;font-size:13px;white-space:pre-wrap;">${row.message}</p>
        </details>` : ""}
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
          You can reply directly to this email to continue the conversation, or visit their profile on ReferAus.
        </p>
        <a href="${appUrl}/providers/${provider.slug}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
          View ${provider.name}&apos;s Profile →
        </a>
      </div>
    </div>
  `;

  await sendEmail({
    to: row.email,
    subject: `Reply from ${provider.name} — ReferAus`,
    html,
    from: `${provider.name} via ReferAus <hello@referaus.com>`,
    transactional: true,
  });

  // Mark replied_at and mark as read
  await admin
    .from("enquiries")
    .update({ replied_at: new Date().toISOString(), read: true })
    .eq("id", enquiry_id);

  return NextResponse.json({ success: true });
}
