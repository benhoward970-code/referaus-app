import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/enquiries?slug=xxx - get enquiries for a provider
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const admin = getAdmin();
  const { data, error } = await admin
    .from("enquiries")
    .select("*")
    .eq("provider_slug", slug)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ enquiries: [] });
  }

  return NextResponse.json({ enquiries: data || [] });
}

// PATCH /api/enquiries - mark enquiry as read
export async function PATCH(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = getAdmin();
  const { error } = await admin
    .from("enquiries")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
