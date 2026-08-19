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

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const admin = getAdmin();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// POST /api/requests/:id/respond - a provider responds to an open request
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { provider_slug, message, price, availability } = body;
  if (!provider_slug || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = getAdmin();

  const { data: provider } = await admin
    .from("providers")
    .select("id, name, user_id")
    .eq("slug", provider_slug)
    .maybeSingle();

  if (!provider || provider.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: reqRow } = await admin
    .from("participant_requests")
    .select("id, email, participant_name, status")
    .eq("id", id)
    .maybeSingle();

  if (!reqRow || reqRow.status !== "open") {
    return NextResponse.json({ error: "Request not found or closed" }, { status: 404 });
  }

  const { data, error } = await admin
    .from("request_responses")
    .insert({
      request_id: id,
      provider_id: provider.id,
      provider_slug,
      message: String(message).trim().substring(0, 1000),
      price: price ? String(price).trim().substring(0, 60) : null,
      availability: availability ? String(availability).trim().substring(0, 60) : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to send response" }, { status: 500 });
  }

  try {
    await sendEmail({
      to: reqRow.email,
      subject: `${provider.name} responded to your request — ReferAus`,
      transactional: true,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1d4ed8;padding:24px 32px;">
            <span style="font-size:22px;font-weight:900;color:#fff;">REFER<span style="color:#f97316;">AUS</span></span>
          </div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#111827;">${provider.name} replied to your request</h2>
            <div style="background:#f9fafb;border-left:4px solid #2563eb;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">${String(message).replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>
            </div>
            <a href="https://referaus.com/requests" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">View all responses →</a>
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error("[requests/respond] email failed:", e);
  }

  return NextResponse.json({ success: true, response: data });
}
