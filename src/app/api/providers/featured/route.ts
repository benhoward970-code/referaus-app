import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cache for 5 minutes — featured providers don't change often
export const revalidate = 300;

export async function GET() {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await admin
      .from("providers")
      .select("id, name, slug, category, location, rating, review_count, verified, logo_url")
      .eq("featured", true)
      .order("rating", { ascending: false })
      .limit(8);

    if (error) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data || [], {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
