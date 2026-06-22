import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cache stats for 10 minutes so this isn't hammered on every homepage load
let cache: { data: Record<string, number>; at: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60" },
    });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [provRes, enqRes, revRes] = await Promise.all([
    admin.from("providers").select("id", { count: "exact", head: true }),
    admin.from("enquiries").select("id", { count: "exact", head: true }),
    admin.from("reviews").select("id", { count: "exact", head: true }),
  ]);

  const data = {
    providers: provRes.count || 0,
    enquiries: enqRes.count || 0,
    reviews: revRes.count || 0,
  };

  cache = { data, at: Date.now() };

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60" },
  });
}
