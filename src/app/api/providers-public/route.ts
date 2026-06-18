import { NextResponse } from "next/server";

// ISR: cache for 5 minutes, revalidate in background
export const revalidate = 300;

export async function GET() {
  try {
    // Fetch all providers ordered by verified first, then by rating
    // Unverified providers are shown with a flag so new signups appear immediately
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/providers?select=*&order=verified.desc,rating.desc&limit=200`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      // Fallback: return empty so client uses hardcoded demo data
      return NextResponse.json([]);
    }

    const providers = await res.json();
    return NextResponse.json(providers);
  } catch {
    return NextResponse.json([]);
  }
}
