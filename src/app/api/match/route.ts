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

type Need = {
  servicesNeeded?: string[];
  region?: string;
  postcode?: string;
  budget?: number;
  preferences?: string[];
};

type ProviderRow = {
  id: string;
  slug: string;
  name: string;
  services: string[] | null;
  categories: string[] | null;
  suburb: string | null;
  state: string | null;
  rating: number | null;
  review_count: number | null;
  response_rate: number | null;
  verified: boolean | null;
  features: string[] | null;
  bio: string | null;
  description: string | null;
};

/** Deterministic heuristic score (0-100) — always available, no AI key required. */
function heuristicScore(p: ProviderRow, needs: Need): { score: number; reasons: string[] } {
  let score = 40;
  const reasons: string[] = [];
  const services = [...(p.services || []), ...(p.categories || [])].map((s) => s.toLowerCase());

  const wantedServices = (needs.servicesNeeded || []).map((s) => s.toLowerCase());
  const serviceMatches = wantedServices.filter((s) => services.some((x) => x.includes(s) || s.includes(x)));
  if (wantedServices.length) {
    const ratio = serviceMatches.length / wantedServices.length;
    score += ratio * 30;
    if (ratio > 0) reasons.push(`Offers ${serviceMatches.length}/${wantedServices.length} of the services you need`);
  }

  if (needs.region && p.suburb) {
    if (p.suburb.toLowerCase().includes(needs.region.toLowerCase()) || needs.region.toLowerCase().includes(p.suburb.toLowerCase())) {
      score += 12;
      reasons.push(`Based in your area (${p.suburb})`);
    }
  }

  if (p.rating) {
    score += Math.min(p.rating, 5) * 2.4; // up to +12
    if (p.rating >= 4.5) reasons.push(`Highly rated (${p.rating.toFixed(1)}★, ${p.review_count || 0} reviews)`);
  }

  if (p.verified) {
    score += 6;
    reasons.push("NDIS registered & verified on ReferAus");
  }

  if (p.response_rate) {
    score += Math.min(p.response_rate, 100) * 0.06; // up to +6
    if (p.response_rate >= 80) reasons.push(`Responds to ${p.response_rate}% of enquiries`);
  }

  if (needs.preferences?.length && p.features?.length) {
    const featureMatches = needs.preferences.filter((pref) =>
      p.features!.some((f) => f.toLowerCase().includes(pref.toLowerCase()))
    );
    if (featureMatches.length) {
      score += featureMatches.length * 3;
      reasons.push(`Matches your preferences: ${featureMatches.join(", ")}`);
    }
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

// POST /api/match - AI-assisted provider matching (heuristic always runs; Claude
// enhances the top candidates with plain-English reasoning when a key is configured)
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await checkRateLimit("match-post:" + ip, 15, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const needs: Need = await request.json();
  const admin = getAdmin();

  const { data: providers, error } = await admin
    .from("providers")
    .select("id, slug, name, services, categories, suburb, state, rating, review_count, response_rate, verified, features, bio, description")
    .eq("registration_ready", true)
    .limit(200);

  if (error || !providers) {
    return NextResponse.json({ results: [], usedAI: false });
  }

  const ranked = (providers as ProviderRow[])
    .map((p) => ({ provider: p, ...heuristicScore(p, needs) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked.slice(0, 10);
  const anthropic = getAnthropic();

  if (!anthropic || top.length === 0) {
    return NextResponse.json({
      results: top.map((r) => ({ slug: r.provider.slug, score: r.score, reasoning: r.reasons.join(". ") || "Good general fit based on your search.", factors: r.reasons })),
      usedAI: false,
    });
  }

  try {
    const prompt = `You are matching an NDIS participant to support providers in the Hunter Region, NSW, Australia.

Participant needs:
${JSON.stringify(needs, null, 2)}

Candidate providers (pre-ranked by a heuristic, already sorted best-first):
${top.map((r, i) => `${i + 1}. ${r.provider.name} (slug: ${r.provider.slug}) — services: ${(r.provider.services || r.provider.categories || []).join(", ")}; suburb: ${r.provider.suburb}; rating: ${r.provider.rating}/5 (${r.provider.review_count} reviews); verified: ${r.provider.verified}; heuristic score: ${r.score}; bio: ${(r.provider.bio || r.provider.description || "").slice(0, 200)}`).join("\n")}

For each provider, return a JSON array (no markdown fences, no prose outside the array) of objects:
{"slug": string, "score": number (0-100), "reasoning": string (1-2 plain-English sentences, warm and specific, mentioning why this provider fits), "factors": string[] (2-4 short bullet phrases)}

Keep the heuristic score as a strong prior — only adjust by up to ±15 points based on qualitative fit from the bio/services text. Return exactly ${top.length} objects, one per candidate, in best-first order.`;

    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    if (Array.isArray(parsed) && parsed.length > 0) {
      return NextResponse.json({ results: parsed, usedAI: true });
    }
  } catch (e) {
    console.error("[match] Claude scoring failed, falling back to heuristic:", e);
  }

  return NextResponse.json({
    results: top.map((r) => ({ slug: r.provider.slug, score: r.score, reasoning: r.reasons.join(". ") || "Good general fit based on your search.", factors: r.reasons })),
    usedAI: false,
  });
}
