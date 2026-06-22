"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase, isConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "benhoward970@gmail.com,hello@referaus.com")
  .split(",").map((e) => e.trim().toLowerCase());

interface OverviewData {
  totalUsers: number;
  totalProviders: number;
  totalEnquiries: number;
  totalContacts: number;
  newUsersToday: number;
}

interface ProviderRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  verified: boolean;
  created_at: string;
  phone: string | null;
  suburb: string | null;
  state: string | null;
  slug: string | null;
  enquiry_count: number;
  bio: string | null;
  website: string | null;
}

interface EnquiryRow {
  id: string;
  name: string | null;
  participant_name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  messages: { role: string; content: string; created_at: string }[];
  service: string | null;
  provider_name: string | null;
  provider_slug: string | null;
  status: string | null;
  read: boolean;
  created_at: string;
}

interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

interface NewsletterRow {
  id: string;
  email: string;
  created_at: string;
}

type Section = "overview" | "providers" | "enquiries" | "contacts" | "newsletter";

const NAV_ITEMS: { key: Section; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "providers", label: "Providers", icon: "🏢" },
  { key: "enquiries", label: "Enquiries", icon: "📩" },
  { key: "contacts", label: "Contacts", icon: "📬" },
  { key: "newsletter", label: "Newsletter", icon: "✉️" },
];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [newsletter, setNewsletter] = useState<NewsletterRow[]>([]);

  useEffect(() => {
    if (!isConfigured() || !supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login?redirect=/admin"); return; }
      if (!ADMIN_EMAILS.includes(session.user.email?.toLowerCase() ?? "")) {
        setError("Access denied. This area is restricted to ReferAus administrators.");
        setLoading(false);
        return;
      }
      setToken(session.access_token);
      setAuthed(true);
    });
  }, [router]);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  const fetchSection = useCallback(async (s: Section) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      if (s === "overview") {
        const res = await fetch("/api/admin?section=overview", { headers: authHeaders() });
        if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
        setOverview(await res.json());
      } else if (s === "providers") {
        const res = await fetch("/api/admin/providers", { headers: authHeaders() });
        if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
        const data = await res.json();
        setProviders(data.providers || []);
      } else if (s === "enquiries") {
        const res = await fetch("/api/admin/enquiries", { headers: authHeaders() });
        if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      } else if (s === "contacts") {
        const res = await fetch("/api/admin/contacts", { headers: authHeaders() });
        if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
        const data = await res.json();
        setContacts(data.contacts || []);
      } else if (s === "newsletter") {
        const res = await fetch("/api/admin/newsletter", { headers: authHeaders() });
        if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
        const data = await res.json();
        setNewsletter(data.signups || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
    setLoading(false);
  }, [token, authHeaders]);

  useEffect(() => {
    if (authed && token) fetchSection(section);
  }, [authed, token, section, fetchSection]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        {error ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-sm text-gray-500 max-w-xs">{error}</p>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Checking access...</div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">Admin</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === item.key ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                section === item.key ? "text-blue-600 bg-blue-50" : "text-gray-500"
              }`}
            >
              <span className="block text-lg mb-0.5">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
            )}
            {section === "overview" && <OverviewSection data={overview} loading={loading} />}
            {section === "providers" && (
              <ProvidersSection
                data={providers}
                loading={loading}
                token={token}
                onRefresh={() => fetchSection("providers")}
              />
            )}
            {section === "enquiries" && (
              <EnquiriesSection
                data={enquiries}
                loading={loading}
                token={token}
                onRefresh={() => fetchSection("enquiries")}
              />
            )}
            {section === "contacts" && (
              <ContactsSection
                data={contacts}
                loading={loading}
                token={token}
                onRefresh={() => fetchSection("contacts")}
              />
            )}
            {section === "newsletter" && (
              <NewsletterSection
                data={newsletter}
                loading={loading}
                token={token}
                onRefresh={() => fetchSection("newsletter")}
              />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-black ${accent || "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function OverviewSection({ data, loading }: { data: OverviewData | null; loading: boolean }) {
  if (loading || !data) return <LoadingSkeleton count={5} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={data.totalUsers} accent="text-blue-600" />
        <StatCard label="Providers" value={data.totalProviders} accent="text-orange-500" />
        <StatCard label="Enquiries" value={data.totalEnquiries} />
        <StatCard label="Contacts" value={data.totalContacts} />
        <StatCard label="New Today" value={data.newUsersToday} accent="text-green-600" />
      </div>
    </div>
  );
}

function ProvidersSection({
  data, loading, token, onRefresh,
}: { data: ProviderRow[]; loading: boolean; token: string; onRefresh: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleVerified(p: ProviderRow) {
    setBusy(p.id);
    await fetch("/api/admin/providers", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, verified: !p.verified }),
    });
    setBusy(null);
    onRefresh();
  }

  async function deleteProv(id: string) {
    if (!confirm("Delete this provider? This cannot be undone.")) return;
    setBusy(id);
    await fetch("/api/admin/providers", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(null);
    onRefresh();
  }

  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Providers ({data.length})</h1>
      <div className="space-y-3">
        {data.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    p.plan === "free" ? "bg-gray-100 text-gray-500"
                    : p.plan === "starter" ? "bg-blue-50 text-blue-600"
                    : p.plan === "pro" ? "bg-orange-50 text-orange-600"
                    : "bg-purple-50 text-purple-600"
                  }`}>{p.plan}</span>
                  {p.verified && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">✓ Verified</span>}
                  {p.enquiry_count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">{p.enquiry_count} enquiries</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{p.email}</p>
                {p.suburb && <p className="text-xs text-gray-400 mt-0.5">📍 {p.suburb}{p.state ? `, ${p.state}` : ""}</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {p.slug && (
                  <a
                    href={`https://referaus.com/providers/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    View ↗
                  </a>
                )}
                <button
                  onClick={() => toggleVerified(p)}
                  disabled={busy === p.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    p.verified
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p.verified ? "✓ Verified" : "Mark verified"}
                </button>
                <a
                  href={`mailto:${p.email}`}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Reply
                </a>
                <button
                  onClick={() => deleteProv(p.id)}
                  disabled={busy === p.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Joined: {formatDate(p.created_at)}</p>
          </div>
        ))}
        {data.length === 0 && <EmptyState text="No providers yet" />}
      </div>
    </div>
  );
}

function EnquiriesSection({
  data, loading, token, onRefresh,
}: { data: EnquiryRow[]; loading: boolean; token: string; onRefresh: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleRead(e: EnquiryRow) {
    setBusy(e.id);
    await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id, read: !e.read }),
    });
    setBusy(null);
    onRefresh();
  }

  async function deleteEnquiry(id: string) {
    if (!confirm("Delete this enquiry?")) return;
    setBusy(id);
    await fetch("/api/admin/enquiries", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(null);
    onRefresh();
  }

  if (loading) return <LoadingSkeleton count={3} />;

  const unread = data.filter((e) => !e.read);
  const read = data.filter((e) => e.read);
  const sorted = [...unread, ...read];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Enquiries ({data.length})</h1>
        {unread.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">{unread.length} unread</span>
        )}
      </div>
      <div className="space-y-3">
        {sorted.map((e) => {
          const displayName = e.participant_name || e.name || "Unknown";
          const displayEmail = e.email || "";
          const displayMessage = e.message || (e.messages?.[0]?.content ?? "");
          return (
            <div
              key={e.id}
              className={`bg-white rounded-2xl border p-5 transition-all ${e.read ? "border-gray-100 opacity-70" : "border-gray-200"}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {!e.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    <h3 className="font-bold text-gray-900">{displayName}</h3>
                    {e.provider_name && (
                      <span className="text-xs text-gray-400">→ {e.provider_name}</span>
                    )}
                  </div>
                  {displayEmail && <p className="text-sm text-gray-500">{displayEmail}</p>}
                  {e.phone && <p className="text-xs text-gray-400 mt-0.5">📞 {e.phone}</p>}
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(e.created_at)}</span>
              </div>
              {e.service && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">{e.service}</span>
              )}
              {displayMessage && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{displayMessage}</p>}
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleRead(e)}
                  disabled={busy === e.id}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {e.read ? "Mark unread" : "Mark read"}
                </button>
                {displayEmail && (
                  <a
                    href={`mailto:${displayEmail}`}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Reply
                  </a>
                )}
                {e.provider_slug && (
                  <a
                    href={`https://referaus.com/providers/${e.provider_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Provider ↗
                  </a>
                )}
                <button
                  onClick={() => deleteEnquiry(e.id)}
                  disabled={busy === e.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {data.length === 0 && <EmptyState text="No enquiries yet" />}
      </div>
    </div>
  );
}

function ContactsSection({
  data, loading, token, onRefresh,
}: { data: ContactRow[]; loading: boolean; token: string; onRefresh: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleRead(c: ContactRow) {
    setBusy(c.id);
    await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, read: !c.read }),
    });
    setBusy(null);
    onRefresh();
  }

  async function deleteContact(id: string) {
    if (!confirm("Delete this contact message?")) return;
    setBusy(id);
    await fetch("/api/admin/contacts", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(null);
    onRefresh();
  }

  if (loading) return <LoadingSkeleton count={3} />;

  const unread = data.filter((c) => !c.read);
  const read = data.filter((c) => c.read);
  const sorted = [...unread, ...read];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Contacts ({data.length})</h1>
        {unread.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">{unread.length} unread</span>
        )}
      </div>
      <div className="space-y-3">
        {sorted.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border p-5 transition-all ${c.read ? "border-gray-100 opacity-70" : "border-gray-200"}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!c.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  {c.subject && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">{c.subject}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{c.email}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(c.created_at)}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{c.message}</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button
                onClick={() => toggleRead(c)}
                disabled={busy === c.id}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {c.read ? "Mark unread" : "Mark read"}
              </button>
              <a
                href={`mailto:${c.email}`}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Reply
              </a>
              <button
                onClick={() => deleteContact(c.id)}
                disabled={busy === c.id}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {data.length === 0 && <EmptyState text="No contacts yet" />}
      </div>
    </div>
  );
}

function NewsletterSection({
  data, loading, token, onRefresh,
}: { data: NewsletterRow[]; loading: boolean; token: string; onRefresh: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function removeSignup(id: string) {
    if (!confirm("Remove this email from the newsletter list?")) return;
    setBusy(id);
    await fetch("/api/admin/newsletter", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(null);
    onRefresh();
  }

  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Newsletter ({data.length} signups)</h1>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {data.length === 0 ? (
          <EmptyState text="No signups yet" />
        ) : (
          <div className="divide-y divide-gray-50">
            {data.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.email}</p>
                  <p className="text-xs text-gray-400">{formatDate(s.created_at)}</p>
                </div>
                <button
                  onClick={() => removeSignup(s.id)}
                  disabled={busy === s.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-gray-400 text-sm text-center py-12">{text}</p>;
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
