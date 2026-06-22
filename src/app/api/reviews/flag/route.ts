import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const VALID_REASONS = [
  "Fake review",
  "Conflict of interest",
  "Inappropriate content",
  "Spam",
  "Other",
] as const;

// POST /api/reviews/flag — report a review
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit("review-flag:" + ip, 5, 3600000); // 5 per hour per IP
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { review_id, reason, details, reporter_email } = body;

  if (!review_id || typeof review_id !== "string") {
    return NextResponse.json({ error: "review_id required" }, { status: 400 });
  }
  if (!reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Valid reason required" }, { status: 400 });
  }
  if (details && typeof details === "string" && details.length > 500) {
    return NextResponse.json({ error: "Details too long" }, { status: 400 });
  }
  if (reporter_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporter_email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const admin = getAdmin();

  // Verify the review exists
  const { data: review } = await admin
    .from("reviews")
    .select("id")
    .eq("id", review_id)
    .maybeSingle();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Prevent duplicate flags from the same IP+review in the last 24h
  const { data: existing } = await admin
    .from("review_flags")
    .select("id")
    .eq("review_id", review_id)
    .gte("created_at", new Date(Date.now() - 86400000).toISOString())
    .limit(1);

  // We allow but don't block — multiple reporters can flag the same review

  const { error } = await admin.from("review_flags").insert({
    review_id,
    reason,
    details: details?.trim().substring(0, 500) || null,
    reporter_email: reporter_email?.trim().toLowerCase() || null,
    status: "pending",
  });

  if (error) {
    console.error("[review-flag]", error.message);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
