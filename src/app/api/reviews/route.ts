import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
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
  if (!client) return NextResponse.json({ reviews: [] });

  const { data, error } = await client
    .from("reviews")
    .select("id, rating, text, reviewer_name, service_type, created_at, response, response_date")
    .eq("provider_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ reviews: [] });
  }

  return NextResponse.json({ reviews: data || [] });
}

// GET /api/reviews/check?slug=xxx  — returns whether the authed user already reviewed
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
  const { provider_slug, reviewer_name, rating, text, service_type } = body;

  if (!provider_slug || !reviewer_name || !rating || !text) {
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
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  // Get provider (need id and user_id to prevent self-review)
  const { data: provider } = await client
    .from("providers")
    .select("id, user_id")
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

  const { data, error } = await client.from("reviews").insert({
    provider_id: provider.id,
    provider_slug,
    user_id: user.id,
    participant_id: user.id,
    reviewer_name: reviewer_name.trim().slice(0, 80),
    reviewer_email: user.email,
    rating: Math.round(rating),
    text: text.trim().slice(0, 1000),
    service_type: service_type?.trim().slice(0, 80) || null,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error("Review insert error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }

  // Recalculate and store provider's average rating
  const { data: allReviews } = await client
    .from("reviews")
    .select("rating")
    .eq("provider_slug", provider_slug);

  if (allReviews && allReviews.length > 0) {
    const avg = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length;
    await client.from("providers").update({ rating: Math.round(avg * 10) / 10 }).eq("id", provider.id);
  }

  return NextResponse.json({ success: true, review: data });
}
