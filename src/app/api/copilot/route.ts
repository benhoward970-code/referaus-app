import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAnthropic, AI_MODEL } from "@/lib/ai";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const admin = getAdmin();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

const SYSTEM_PROMPT = `You are the ReferAus Copilot — an in-app advisor for NDIS providers using the ReferAus directory (Newcastle / Hunter Region, NSW, Australia).

You give general guidance only (not legal advice) on:
- Privacy Act 1988 & Australian Privacy Principles (APPs)
- NDIS Practice Standards & Code of Conduct, NDIS Commission requirements
- NDIS Worker Screening Check, Working With Children Check (WWCC)
- Fair Work Act, SCHADS Award (for support worker employment)
- Work Health & Safety (WHS)
- Australian Consumer Law (ACL)
- Spam Act 2003 (marketing consent, unsubscribe)
- ABN/GST obligations for sole traders and small businesses
- Using the ReferAus platform itself (listings, enquiries, reviews, dashboard)

Be concise, practical, and specific to a small NDIS provider business. Always end your answer with:
"This is general guidance only — confirm specifics with the NDIS Commission or a qualified solicitor/accountant."`;

// POST /api/copilot - AI advisor for provider dashboard (authenticated providers only)
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit("copilot-post:" + ip, 20, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anthropic = getAnthropic();
  if (!anthropic) {
    return NextResponse.json(
      { error: "Copilot isn't configured yet — an ANTHROPIC_API_KEY is needed on the server." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { message, history } = body as { message: string; history?: { role: "user" | "assistant"; content: string }[] };

  if (!message || String(message).trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (String(message).length > 2000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const messages = [
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: "user" as const, content: String(message).trim() },
  ];

  try {
    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[copilot] Claude call failed:", e);
    return NextResponse.json({ error: "Copilot is temporarily unavailable" }, { status: 502 });
  }
}
