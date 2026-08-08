import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = "test:" + Math.random();
    const first = checkRateLimit(key, 3, 60000);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
  });

  it("blocks requests once the limit is hit", () => {
    const key = "test:" + Math.random();
    checkRateLimit(key, 2, 60000);
    checkRateLimit(key, 2, 60000);
    const third = checkRateLimit(key, 2, 60000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets once the window passes", () => {
    const key = "test:" + Math.random();
    checkRateLimit(key, 1, 60000);
    const blocked = checkRateLimit(key, 1, 60000);
    expect(blocked.allowed).toBe(false);

    vi.setSystemTime(60001);
    const afterWindow = checkRateLimit(key, 1, 60000);
    expect(afterWindow.allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const keyA = "a:" + Math.random();
    const keyB = "b:" + Math.random();
    checkRateLimit(keyA, 1, 60000);
    const blockedA = checkRateLimit(keyA, 1, 60000);
    const allowedB = checkRateLimit(keyB, 1, 60000);
    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});
