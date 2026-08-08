import { describe, it, expect, vi, beforeEach } from "vitest";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("fails open (allows) when Supabase is not configured", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    const result = await checkRateLimit("test:no-config", 3, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("allows the request when the RPC count is within the limit", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const rpc = vi.fn(() => Promise.resolve({ data: 2, error: null }));
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({ rpc })),
    }));

    const { checkRateLimit } = await import("./rate-limit");
    const result = await checkRateLimit("test:under-limit", 5, 60000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
    expect(rpc).toHaveBeenCalledWith(
      "upsert_rate_limit",
      expect.objectContaining({ p_key: "test:under-limit", p_max: 5 })
    );
  });

  it("blocks the request when the RPC count exceeds the limit", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const rpc = vi.fn(() => Promise.resolve({ data: 6, error: null }));
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({ rpc })),
    }));

    const { checkRateLimit } = await import("./rate-limit");
    const result = await checkRateLimit("test:over-limit", 5, 60000);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("fails open when the RPC errors, so an outage doesn't lock out real users", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const rpc = vi.fn(() => Promise.resolve({ data: null, error: { message: "connection refused" } }));
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({ rpc })),
    }));

    const { checkRateLimit } = await import("./rate-limit");
    const result = await checkRateLimit("test:db-error", 5, 60000);

    expect(result.allowed).toBe(true);
  });
});
