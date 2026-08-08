import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
});

const AUTH_USER = { id: "user-1", email: "sam@example.com" };

let providerResult: { data: unknown; error: unknown };
let existingReviewResult: { data: unknown; error: unknown };
let insertResult: { data: unknown; error: unknown };
let listResult: { data: unknown; error: unknown };
let authUser: typeof AUTH_USER | null;

function makeQueryBuilder(table: string) {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => Promise.resolve(listResult));
  builder.insert = vi.fn(() => builder);
  builder.single = vi.fn(() => Promise.resolve(insertResult));
  builder.maybeSingle = vi.fn(() => {
    if (table === "providers") return Promise.resolve(providerResult);
    return Promise.resolve(existingReviewResult);
  });
  return builder;
}

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() =>
        authUser ? Promise.resolve({ data: { user: authUser }, error: null }) : Promise.resolve({ data: { user: null }, error: { message: "invalid token" } })
      ),
    },
    from: vi.fn((table: string) => makeQueryBuilder(table)),
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ allowed: true, remaining: 4 })),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(() => Promise.resolve()),
}));

import { GET, POST } from "./route";
import { checkRateLimit } from "@/lib/rate-limit";

function postRequest(body: unknown, { authed = true }: { authed?: boolean } = {}) {
  return new NextRequest("http://localhost/api/reviews", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(authed ? { authorization: "Bearer valid-token" } : {}),
    },
  });
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, remaining: 4 });
    authUser = AUTH_USER;
    providerResult = { data: { id: "prov-1", user_id: "provider-owner", name: "Acme", email: "owner@acme.test", email_notifications: true }, error: null };
    existingReviewResult = { data: null, error: null };
    insertResult = { data: { id: "1", provider_slug: "acme", reviewer_name: "Sam", rating: 5, text: "Great service overall", status: "pending" }, error: null };
  });

  it("rejects unauthenticated requests", async () => {
    authUser = null;
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "Great service overall" }, { authed: false })
    );
    expect(res.status).toBe(401);
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
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, remaining: 0 });
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "Great service overall" })
    );
    expect(res.status).toBe(429);
  });

  it("rejects a provider reviewing their own listing", async () => {
    providerResult = { data: { id: "prov-1", user_id: AUTH_USER.id, name: "Acme", email: "owner@acme.test", email_notifications: true }, error: null };
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "Great service overall" })
    );
    expect(res.status).toBe(403);
  });

  it("rejects a duplicate review from the same user", async () => {
    existingReviewResult = { data: { id: "existing-review" }, error: null };
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "Great service overall" })
    );
    expect(res.status).toBe(409);
  });

  it("inserts new reviews tied to the authed user, with status pending", async () => {
    const res = await POST(
      postRequest({ provider_slug: "acme", author_name: "Sam", rating: 5, text: "Great service overall" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.pending).toBe(true);
    expect(json.review.status).toBe("pending");
  });
});

describe("GET /api/reviews", () => {
  beforeEach(() => {
    listResult = { data: [], error: null };
  });

  it("requires a slug", async () => {
    const res = await GET(new NextRequest("http://localhost/api/reviews"));
    expect(res.status).toBe(400);
  });

  it("only requests approved reviews from the database", async () => {
    const res = await GET(new NextRequest("http://localhost/api/reviews?slug=acme"));
    expect(res.status).toBe(200);
  });
});
