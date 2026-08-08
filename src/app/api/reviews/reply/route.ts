import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

// PATCH /api/reviews/reply — provider saves a reply to a review they own
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { review_id, response } = await request.json();
  if (!review_id) {
    return NextResponse.json({ error: "Missing review_id" }, { status: 400 });
  }

  const trimmedResponse = (response || "").trim().slice(0, 1000);

  const client = getClient();
  if (!client) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

  // Fetch the review and check the provider is owned by this user
  const { data: review } = await client
    .from("reviews")
    .select("id, provider_slug")
    .eq("id", review_id)
    .maybeSingle();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Verify this user owns the provider the review is for
  const { data: provider } = await client
    .from("providers")
    .select("id")
    .eq("slug", review.provider_slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!provider) {
    return NextResponse.json({ error: "You can only reply to reviews on your own listing" }, { status: 403 });
  }

  const { error } = await client
    .from("reviews")
    .update({
      response: trimmedResponse || null,
      response_date: trimmedResponse ? new Date().toISOString() : null,
    })
    .eq("id", review_id);

  if (error) {
    console.error("[reviews/reply] Update error:", error);
    return NextResponse.json({ error: "Failed to save reply" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
