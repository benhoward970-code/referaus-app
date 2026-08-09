"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase, isConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";

// Admin emails are managed server-side via ADMIN_EMAILS env var (src/lib/admin.ts)
// The client-side check here is a UX convenience only — real enforcement is on the API
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "benhoward970@gmail.com,hello@referaus.com")
  .split(",").map((e) => e.trim().toLowerCase());

// Admin access is controlled server-side via ADMIN_EMAILS env var in src/lib/admin.ts

interface OverviewData {
  totalUsers: number;
  totalProviders: number;
  totalEnquiries: number;
  totalContacts: number;
  newUsersToday: number;
}

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  confirmed: boolean;
  last_sign_in: string | null;
}

interface ProviderRow {
  id: number;
  name: string;
  email: string;
  plan: string;
  category: string;
  location: string | null;
  created_at: string;
  phone: string | null;
  abn: string | null;
}

interface EnquiryRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  service: string | null;
  provider_id: number | null;
  created_at: string;
}

interface ContactRow {
  id: number;
  name: string;
  email: string;
  message: string;
  type: string | null;
  created_at: string;
}

interface ReviewRow {
  id: string;
  provider_slug: string;
  reviewer_name: string;
  rating: number;
  text: string;
  service_type: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface NewsletterRow {
  id: string;
  email: string;
  created_at: string;
  unsubscribed: boolean;
}

interface ReviewFlagRow {
  id: string;
  review_id: string;
  reason: string;
  details: string | null;
  reporter_email: string | null;
  status: string;
  created_at: string;
  review: { id: string; reviewer_name: string; text: string; rating: number; provider_slug: string } | null;
}

type Section = "overview" | "users" | "providers" | "enquiries" | "contacts" | "reviews" | "newsletter" | "reviewFlags";

const NAV_ITEMS: { key: Section; label: string; icon: IconName }[] = [
  { key: "overview", label: "Overview", icon: "chart" },
  { key: "users", label: "Users", icon: "users" },
  { key: "providers", label: "Providers", icon: "building" },
  { key: "enquiries", label: "Enquiries", icon: "inbox" },
  { key: "reviews", label: "Reviews", icon: "star" },
  { key: "reviewFlags", label: "Flagged Reviews", icon: "warning" },
  { key: "contacts", label: "Contacts", icon: "mail" },
  { key: "newsletter", label: "Newsletter", icon: "mail" },
];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [newsletter, setNewsletter] = useState<NewsletterRow[]>([]);
  const [reviewFlags, setReviewFlags] = useState<ReviewFlagRow[]>([]);

  // Auth check
  useEffect(() => {
    if (!isConfigured() || !supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !ADMIN_EMAILS.includes(session.user.email?.toLowerCase() ?? "")) {
        router.push("/login?redirect=/admin");
        return;
      }
      setToken(session.access_token);
      setAuthed(true);
    });
  }, [router]);

  const fetchSection = useCallback(
    async (s: Section) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const endpoint =
          s === "reviews" ? "/api/admin/reviews" :
          s === "newsletter" ? "/api/admin/newsletter" :
          s === "reviewFlags" ? "/api/admin/review-flags" :
          `/api/admin?section=${s}`;
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (s === "overview") setOverview(data);
        if (s === "users") setUsers(data);
        if (s === "providers") setProviders(data);
        if (s === "enquiries") setEnquiries(data);
        if (s === "contacts") setContacts(data);
        if (s === "reviews") setReviews(data.reviews || []);
        if (s === "newsletter") setNewsletter(data.signups || []);
        if (s === "reviewFlags") setReviewFlags(data.flags || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
      setLoading(false);
    },
    [token]
  );

  useEffect(() => {
    if (authed && token) fetchSection(section);
  }, [authed, token, section, fetchSection]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-ink-400 text-sm">Checking access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 card-flat p-3">
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wider px-3 mb-3">
              Admin
            </p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === item.key
                    ? "bg-blue-50 text-blue-700"
                    : "text-ink-700 hover:bg-gray-50 hover:text-ink-900"
                }`}
              >
                <Icon name={item.icon} size={16} />
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
                section === item.key
                  ? "text-blue-600 bg-blue-50"
                  : "text-ink-500"
              }`}
            >
              <Icon name={item.icon} size={18} className="mx-auto mb-0.5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {section === "overview" && (
              <OverviewSection data={overview} loading={loading} />
            )}
            {section === "users" && (
              <UsersSection data={users} loading={loading} />
            )}
            {section === "providers" && (
              <ProvidersSection data={providers} loading={loading} />
            )}
            {section === "enquiries" && (
              <EnquiriesSection data={enquiries} loading={loading} />
            )}
            {section === "reviews" && (
              <ReviewsSection data={reviews} loading={loading} token={token} onChange={() => fetchSection("reviews")} />
            )}
            {section === "contacts" && (
              <ContactsSection data={contacts} loading={loading} />
            )}
            {section === "newsletter" && (
              <NewsletterSection data={newsletter} loading={loading} token={token} onChange={() => fetchSection("newsletter")} />
            )}
            {section === "reviewFlags" && (
              <ReviewFlagsSection data={reviewFlags} loading={loading} token={token} onChange={() => fetchSection("reviewFlags")} />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="card-flat p-6">
      <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-3xl font-black ${accent || "text-ink-900"}`}>
        {value}
      </p>
    </div>
  );
}

function OverviewSection({
  data,
  loading,
}: {
  data: OverviewData | null;
  loading: boolean;
}) {
  if (loading || !data)
    return <LoadingSkeleton count={5} />;
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

function UsersSection({ data, loading }: { data: UserRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Users ({data.length})</h1>
      <div className="card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-semibold text-ink-500 text-xs uppercase">Email</th>
                <th className="px-4 py-3 font-semibold text-ink-500 text-xs uppercase">Signed Up</th>
                <th className="px-4 py-3 font-semibold text-ink-500 text-xs uppercase">Confirmed</th>
                <th className="px-4 py-3 font-semibold text-ink-500 text-xs uppercase">Last Sign In</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-ink-900">{u.email}</td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.confirmed
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {u.confirmed ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(u.last_sign_in)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProvidersSection({ data, loading }: { data: ProviderRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Providers ({data.length})</h1>
      <div className="space-y-3">
        {data.map((p) => (
          <div
            key={p.id}
            className="card-flat p-5"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold text-ink-900">{p.name}</h3>
                <p className="text-sm text-ink-500">{p.email}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  p.plan === "free"
                    ? "bg-gray-100 text-ink-500"
                    : p.plan === "starter"
                    ? "bg-blue-50 text-blue-600"
                    : p.plan === "pro"
                    ? "bg-orange-50 text-orange-600"
                    : "bg-purple-50 text-purple-600"
                }`}
              >
                {p.plan}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-400">
              {p.category && <span>{p.category}</span>}
              {p.location && <span>{p.location}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.abn && <span>ABN: {p.abn}</span>}
              <span>Joined: {formatDate(p.created_at)}</span>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">No providers yet</p>
        )}
      </div>
    </div>
  );
}

function EnquiriesSection({ data, loading }: { data: EnquiryRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Enquiries ({data.length})</h1>
      <div className="space-y-3">
        {data.map((e) => (
          <div
            key={e.id}
            className="card-flat p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-ink-900">{e.name}</h3>
                <p className="text-sm text-ink-500">{e.email}</p>
              </div>
              <span className="text-xs text-ink-400">{formatDate(e.created_at)}</span>
            </div>
            {e.service && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
                {e.service}
              </span>
            )}
            <p className="mt-2 text-sm text-ink-700">{e.message}</p>
            {e.phone && <p className="mt-1 text-xs text-ink-400">{e.phone}</p>}
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">No enquiries yet</p>
        )}
      </div>
    </div>
  );
}

function ReviewsSection({
  data,
  loading,
  token,
  onChange,
}: {
  data: ReviewRow[];
  loading: boolean;
  token: string;
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const pending = data.filter((r) => r.status === "pending");
  const decided = data.filter((r) => r.status !== "pending");

  async function setStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      onChange();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingSkeleton count={3} />;

  const Row = ({ r }: { r: ReviewRow }) => (
    <div key={r.id} className="card-flat p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-ink-900">{r.reviewer_name}</h3>
            <span className="text-xs text-ink-400">→ {r.provider_slug}</span>
          </div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= r.rating ? "#F97316" : "#e5e7eb"}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            r.status === "approved"
              ? "bg-green-50 text-green-600"
              : r.status === "rejected"
              ? "bg-red-50 text-red-600"
              : "bg-yellow-50 text-yellow-600"
          }`}
        >
          {r.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-700">{r.text}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-ink-400">{formatDate(r.created_at)}</span>
        {r.status === "pending" && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setStatus(r.id, "approved")}
              disabled={busyId === r.id}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => setStatus(r.id, "rejected")}
              disabled={busyId === r.id}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Reviews ({data.length})</h1>
      {pending.length > 0 && (
        <>
          <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-3">
            Pending moderation ({pending.length})
          </p>
          <div className="space-y-3 mb-8">
            {pending.map((r) => <Row key={r.id} r={r} />)}
          </div>
        </>
      )}
      <p className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">
        Decided
      </p>
      <div className="space-y-3">
        {decided.map((r) => <Row key={r.id} r={r} />)}
        {data.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">No reviews yet</p>
        )}
      </div>
    </div>
  );
}

function ContactsSection({ data, loading }: { data: ContactRow[]; loading: boolean }) {
  if (loading) return <LoadingSkeleton count={3} />;
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Contacts ({data.length})</h1>
      <div className="space-y-3">
        {data.map((c) => (
          <div
            key={c.id}
            className="card-flat p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-ink-900">{c.name}</h3>
                <p className="text-sm text-ink-500">{c.email}</p>
              </div>
              <span className="text-xs text-ink-400">{formatDate(c.created_at)}</span>
            </div>
            {c.type && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-ink-500">
                {c.type}
              </span>
            )}
            <p className="mt-2 text-sm text-ink-700">{c.message}</p>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">No contacts yet</p>
        )}
      </div>
    </div>
  );
}

function NewsletterSection({
  data,
  loading,
  token,
  onChange,
}: {
  data: NewsletterRow[];
  loading: boolean;
  token: string;
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const active = data.filter((n) => !n.unsubscribed);

  async function removeSignup(id: string) {
    setBusyId(id);
    try {
      await fetch("/api/admin/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      onChange();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Newsletter ({active.length} active)</h1>
      <div className="space-y-2">
        {data.map((n) => (
          <div key={n.id} className="card-flat p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">{n.email}</p>
              <p className="text-xs text-ink-400">{formatDate(n.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              {n.unsubscribed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-ink-500">Unsubscribed</span>
              )}
              <button
                onClick={() => removeSignup(n.id)}
                disabled={busyId === n.id}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">No newsletter signups yet</p>
        )}
      </div>
    </div>
  );
}

function ReviewFlagsSection({
  data,
  loading,
  token,
  onChange,
}: {
  data: ReviewFlagRow[];
  loading: boolean;
  token: string;
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const pending = data.filter((f) => f.status === "pending");
  const actioned = data.filter((f) => f.status !== "pending");

  async function dismiss(flagId: string) {
    setBusyId(flagId);
    try {
      await fetch("/api/admin/review-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ flag_id: flagId, status: "dismissed" }),
      });
      onChange();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReview(flagId: string, reviewId: string) {
    setBusyId(flagId);
    try {
      await fetch("/api/admin/review-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ flag_id: flagId, delete_review: true, review_id: reviewId }),
      });
      onChange();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingSkeleton count={3} />;

  const Row = ({ f }: { f: ReviewFlagRow }) => (
    <div key={f.id} className="card-flat p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-ink-900">{f.reason}</h3>
            {f.review && <span className="text-xs text-ink-400">→ {f.review.provider_slug}</span>}
          </div>
          {f.reporter_email && <p className="text-xs text-ink-400 mt-0.5">Reported by {f.reporter_email}</p>}
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            f.status === "pending" ? "bg-yellow-50 text-yellow-600" : "bg-gray-100 text-ink-500"
          }`}
        >
          {f.status}
        </span>
      </div>
      {f.details && <p className="mt-2 text-sm text-ink-700">{f.details}</p>}
      {f.review && (
        <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-line-100">
          <p className="text-xs font-semibold text-ink-500 mb-1">Flagged review — {f.review.reviewer_name}, {f.review.rating}★</p>
          <p className="text-sm text-ink-700">&ldquo;{f.review.text}&rdquo;</p>
        </div>
      )}
      {f.status === "pending" && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => dismiss(f.id)}
            disabled={busyId === f.id}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-ink-700 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50"
          >
            Dismiss
          </button>
          {f.review && (
            <button
              onClick={() => deleteReview(f.id, f.review!.id)}
              disabled={busyId === f.id}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
            >
              Delete Review
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Flagged Reviews ({pending.length} pending)</h1>
      <div className="space-y-3">
        {pending.map((f) => <Row key={f.id} f={f} />)}
        {actioned.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-ink-500 mt-6 mb-2">Actioned</h2>
            {actioned.map((f) => <Row key={f.id} f={f} />)}
          </>
        )}
        {data.length === 0 && (
          <p className="text-ink-400 text-sm text-center py-8">No flagged reviews</p>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card-flat p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
