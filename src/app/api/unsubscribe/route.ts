import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/unsubscribe?token=<uuid> — one-click unsubscribe
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/unsubscribe?error=missing", request.url));
  }

  const admin = getAdmin();
  const { data, error } = await admin
    .from("newsletter")
    .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .eq("unsubscribed", false) // idempotent
    .select("email")
    .maybeSingle();

  if (error || !data) {
    // Could be already unsubscribed or invalid token — redirect to success anyway
    return NextResponse.redirect(new URL("/unsubscribe?status=done", request.url));
  }

  return NextResponse.redirect(new URL("/unsubscribe?status=done", request.url));
}
