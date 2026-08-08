import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
});

function makeBuilder({ listResult, singleResult }: { listResult?: unknown; singleResult?: unknown }) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => Promise.resolve(listResult));
  builder.insert = vi.fn(() => builder);
  builder.single = vi.fn(() => Promise.resolve(singleResult));
  return builder;
}

let currentBuilder: ReturnType<typeof makeBuilder>;

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => currentBuilder),
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 4 })),
}));

import { GET, POST } from "./route";
import { checkRateLimit } from "@/lib/rate-limit";

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/reviews", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 4 });
    currentBuilder = makeBuilder({});
  });

  it("rejects missing required fields", async () => {
    const res = await POST(postRequest({ provider_slug: "acme" }));
    expect(res.status).toBe(400);
  });

  it("rejects an out-of-range rating", async () => {
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 6, text: "Great service overall" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects review text shorter than 10 characters", async () => {
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "short" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 });
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "Great service overall" })
    );
    expect(res.status).toBe(429);
  });

  it("inserts new reviews with status pending, not immediately live", async () => {
    currentBuilder = makeBuilder({
      singleResult: {
        data: { id: "1", provider_slug: "acme", reviewer_name: "Sam", rating: 5, text: "Great service overall", status: "pending" },
        error: null,
      },
    });

    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "Great service overall" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.pending).toBe(true);
    expect(json.review.status).toBe("pending");
    expect(currentBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending" })
    );
  });
});

describe("GET /api/reviews", () => {
  beforeEach(() => {
    currentBuilder = makeBuilder({ listResult: { data: [], error: null } });
  });

  it("requires a slug", async () => {
    const res = await GET(new NextRequest("http://localhost/api/reviews"));
    expect(res.status).toBe(400);
  });

  it("only requests approved reviews from the database", async () => {
    const res = await GET(new NextRequest("http://localhost/api/reviews?slug=acme"));
    expect(res.status).toBe(200);
    expect(currentBuilder.eq).toHaveBeenCalledWith("provider_slug", "acme");
    expect(currentBuilder.eq).toHaveBeenCalledWith("status", "approved");
  });
});
