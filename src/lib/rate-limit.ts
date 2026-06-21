import { createClient } from "@supabase/supabase-js";

/**
 * Persistent rate limiter backed by Supabase.
 * Works correctly across Vercel serverless invocations (unlike in-memory Maps).
 *
 * Falls back to allowing the request if Supabase is unreachable,
 * so a DB outage doesn't lock out real users.
 */
export async function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // No DB configured — allow through (dev/demo mode)
    return { allowed: true, remaining: maxRequests - 1 };
  }

  try {
    const db = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);

    // Upsert: if key exists and not expired → increment count
    //         if key doesn't exist or is expired → reset to 1
    const { data, error } = await db.rpc("upsert_rate_limit", {
      p_key: key,
      p_reset_at: resetAt.toISOString(),
      p_max: maxRequests,
    });

    if (error || data === null) {
      // DB error — fail open so real users aren't blocked
      console.warn("[rate-limit] DB error, failing open:", error?.message);
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const count = data as number;
    const allowed = count <= maxRequests;
    return { allowed, remaining: Math.max(0, maxRequests - count) };
  } catch (err) {
    console.warn("[rate-limit] Unexpected error, failing open:", err);
    return { allowed: true, remaining: maxRequests - 1 };
  }
}
