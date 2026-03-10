import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";

export interface Review {
  id?: string;
  provider_slug: string;
  author_name: string;
  rating: number;
  text: string;
  service_type?: string;
  created_at?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  if (!supabase) {
    return NextResponse.json({ reviews: [] });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ reviews: [] });
  }

  return NextResponse.json({ reviews: data || [] });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit("reviews:" + ip, 5, 3600000);
  if (!allowed) return NextResponse.json({ error: "Too many reviews. Please try again later." }, { status: 429 });

  const body: Review = await request.json();
  const { provider_slug, author_name, rating, text, service_type } = body;

  if (!provider_slug || !author_name || !rating || !text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }
  if (text.trim().length < 10) {
    return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
  }

  const review: Review = {
    provider_slug,
    author_name: author_name.trim().substring(0, 80),
    rating,
    text: text.trim().substring(0, 1000),
    service_type: service_type?.trim().substring(0, 80),
    created_at: new Date().toISOString(),
  };

  if (!supabase) {
    return NextResponse.json({ success: true, review: { ...review, id: "demo-" + Date.now() }, demo: true });
  }

  const { data, error } = await supabase.from("reviews").insert(review).select().single();
  if (error) {
    console.error("Review insert error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }

  return NextResponse.json({ success: true, review: data });
}
