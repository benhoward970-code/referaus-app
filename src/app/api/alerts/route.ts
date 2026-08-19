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

// POST /api/alerts - subscribe to be notified when a provider/service opens up
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit("alerts-post:" + ip, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { email, service, region, provider_slug } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!service && !region && !provider_slug) {
    return NextResponse.json({ error: "Specify a service, region, or provider" }, { status: 400 });
  }

  const admin = getAdmin();

  let provider_id: string | null = null;
  if (provider_slug) {
    const { data: p } = await admin.from("providers").select("id").eq("slug", provider_slug).maybeSingle();
    provider_id = p?.id ?? null;
  }

  const { error } = await admin.from("availability_alerts").insert({
    email: String(email).trim().substring(0, 120),
    service: service ? String(service).trim().substring(0, 80) : null,
    region: region ? String(region).trim().substring(0, 80) : null,
    provider_id,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
