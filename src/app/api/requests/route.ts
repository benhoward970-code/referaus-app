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

// GET /api/requests - list open participant requests (public, for providers to browse)
export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get("region");
  const admin = getAdmin();

  let query = admin
    .from("participant_requests")
    .select("*, request_responses(count)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  if (region && region !== "all") query = query.eq("region", region);

  const { data, error } = await query;
  if (error) return NextResponse.json({ requests: [] });

  return NextResponse.json({ requests: data || [] });
}

// POST /api/requests - post a new request (public, participant)
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit("requests-post:" + ip, 5, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { participant_name, email, services_needed, region, postcode, budget, preferences, details } = body;

  if (!participant_name || !email || !details) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (String(details).trim().length < 10 || String(details).trim().length > 1500) {
    return NextResponse.json({ error: "Details must be between 10 and 1500 characters" }, { status: 400 });
  }

  const admin = getAdmin();
  const { data, error } = await admin
    .from("participant_requests")
    .insert({
      participant_name: String(participant_name).trim().substring(0, 80),
      email: String(email).trim().substring(0, 120),
      services_needed: Array.isArray(services_needed) ? services_needed.slice(0, 10) : [],
      region: region ? String(region).trim().substring(0, 80) : null,
      postcode: postcode ? String(postcode).trim().substring(0, 10) : null,
      budget: budget ? Number(budget) : null,
      preferences: Array.isArray(preferences) ? preferences.slice(0, 10) : [],
      details: String(details).trim().substring(0, 1500),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to post request" }, { status: 500 });
  }

  return NextResponse.json({ success: true, request: data });
}
