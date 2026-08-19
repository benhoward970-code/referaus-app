import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/** Returns a shared Anthropic client, or null if no API key is configured. */
export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const AI_MODEL = "claude-sonnet-5";
