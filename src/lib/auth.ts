/**
 * Auth helpers -- thin wrappers around supabase.ts.
 * Gracefully handles Demo mode (env vars not configured).
 */
import { supabase, isConfigured } from "./supabase";

export { isConfigured };

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
) {
  if (!supabase) return { data: null, error: { message: "Demo mode -- Supabase not configured" } };
  return supabase.auth.signUp({ email, password, options: { data: metadata } });
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { data: null, error: { message: "Demo mode -- Supabase not configured" } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}