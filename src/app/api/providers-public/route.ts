import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // cache for 5 min

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/providers?select=*&order=rating.desc`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      // Fallback: return empty so client uses hardcoded
      return NextResponse.json([]);
    }

    const providers = await res.json();
    return NextResponse.json(providers);
  } catch {
    return NextResponse.json([]);
  }
}
