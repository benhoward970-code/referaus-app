import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isConfigured = () => !!supabaseUrl && !!supabaseAnonKey;

export const supabase = isConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helpers
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  return supabase.auth.signUp({ email, password, options: { data: metadata } });
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// DB helpers
export async function submitEnquiry(data: {
  provider_slug: string;
  provider_name: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
}) {
  if (!supabase) {
    console.log("[Demo] Enquiry submitted:", data);
    return { success: true, demo: true };
  }
  // Map v2 frontend fields to actual DB schema
  const row = {
    participant_name: data.name,
    provider_name: data.provider_name,
    subject: data.service || "General Enquiry",
    messages: JSON.stringify([{
      from: "participant",
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      text: data.message,
      sent_at: new Date().toISOString(),
    }]),
    status: "open",
  };
  const { error } = await supabase.from("enquiries").insert(row);
  return { success: !error, error };
}

export async function submitContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!supabase) {
    console.log("[Demo] Contact submitted:", data);
    return { success: true, demo: true };
  }
  const { error } = await supabase.from("contacts").insert(data);
  return { success: !error, error };
}

export async function subscribeNewsletter(email: string) {
  if (!supabase) {
    console.log("[Demo] Newsletter signup:", email);
    return { success: true, demo: true };
  }
  const { error } = await supabase.from("newsletter").insert({ email });
  return { success: !error, error };
}

export async function submitWaitlist(email: string, role: string) {
  if (!supabase) {
    console.log("[Demo] Waitlist signup:", email, role);
    return { success: true, demo: true };
  }
  const { error } = await supabase.from("waitlist").insert({ email, role });
  return { success: !error, error };
}