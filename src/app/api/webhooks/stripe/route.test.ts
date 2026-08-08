import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/stripe", () => ({
  stripe: { webhooks: { constructEvent: vi.fn() } },
}));

vi.mock("@/lib/supabase", () => ({
  updateProviderPlan: vi.fn(async () => ({ success: true })),
  downgradeProviderByCustomerId: vi.fn(async () => ({ success: true })),
}));

import { POST } from "./route";
import { stripe } from "@/lib/stripe";
import { updateProviderPlan, downgradeProviderByCustomerId } from "@/lib/supabase";

function webhookRequest(body: string, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers,
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.mocked(stripe!.webhooks.constructEvent).mockReset();
    vi.mocked(updateProviderPlan).mockClear();
    vi.mocked(downgradeProviderByCustomerId).mockClear();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("rejects requests with no stripe-signature header", async () => {
    const res = await POST(webhookRequest("{}"));
    expect(res.status).toBe(400);
  });

  it("rejects requests when STRIPE_WEBHOOK_SECRET isn't configured", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = await POST(webhookRequest("{}", { "stripe-signature": "sig" }));
    expect(res.status).toBe(400);
  });

  it("rejects a payload with an invalid signature", async () => {
    vi.mocked(stripe!.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("signature verification failed");
    });
    const res = await POST(webhookRequest("{}", { "stripe-signature": "bad-sig" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/signature/i);
  });

  it("upgrades the provider's plan on checkout.session.completed", async () => {
    vi.mocked(stripe!.webhooks.constructEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_email: "provider@example.com",
          customer: "cus_123",
          subscription: "sub_123",
          metadata: { planId: "pro" },
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await POST(webhookRequest("{}", { "stripe-signature": "good-sig" }));
    expect(res.status).toBe(200);
    expect(updateProviderPlan).toHaveBeenCalledWith("provider@example.com", "pro", "cus_123", "sub_123");
  });

  it("downgrades the provider to free on customer.subscription.deleted", async () => {
    vi.mocked(stripe!.webhooks.constructEvent).mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { id: "sub_123", customer: "cus_123" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await POST(webhookRequest("{}", { "stripe-signature": "good-sig" }));
    expect(res.status).toBe(200);
    expect(downgradeProviderByCustomerId).toHaveBeenCalledWith("cus_123");
  });
});
