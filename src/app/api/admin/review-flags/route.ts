import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/app/api/admin/verify-admin";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/admin/review-flags — list pending flags
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdmin();
  const { data, error } = await admin
    .from("review_flags")
    .select("*, review:review_id(id, reviewer_name, text, rating, provider_slug)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ flags: data || [] });
}

// PATCH /api/admin/review-flags — update flag status or delete the review
export async function PATCH(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);
  if (!adminCheck.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { flag_id, status, delete_review, review_id } = await request.json();

  if (!flag_id) return NextResponse.json({ error: "flag_id required" }, { status: 400 });

  const admin = getAdmin();

  if (delete_review && review_id) {
    // Delete the review (admin actioned)
    await admin.from("reviews").delete().eq("id", review_id);
    // Mark all flags for this review as actioned
    await admin.from("review_flags").update({ status: "actioned" }).eq("review_id", review_id);
  } else if (status) {
    await admin.from("review_flags").update({ status }).eq("id", flag_id);
  }

  return NextResponse.json({ success: true });
}
