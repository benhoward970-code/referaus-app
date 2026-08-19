"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Send, Loader2, MapPin, DollarSign, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getProviderByUserId, supabase } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestRecord = Record<string, any>;

function RequestCard({ req, providerSlug }: { req: RequestRecord; providerSlug: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const respond = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const res = await fetch(`/api/requests/${req.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ provider_slug: providerSlug, message, price, availability }),
      });
      if (res.ok) setSent(true);
    } finally {
      setSending(false);
    }
  };

  const responseCount = req.request_responses?.[0]?.count ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-flat p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-bold text-ink-900 text-sm">{req.participant_name}</h3>
          <p className="text-[11px] text-ink-400 flex items-center gap-1 mt-0.5">
            {req.region && (
              <>
                <MapPin className="w-3 h-3" /> {req.region}
                {req.postcode ? ` (${req.postcode})` : ""}
              </>
            )}
            {req.budget && (
              <>
                <span className="mx-1">·</span>
                <DollarSign className="w-3 h-3" /> up to ${req.budget}
              </>
            )}
          </p>
        </div>
        {responseCount > 0 && (
          <span className="text-[10px] font-semibold text-ink-400 bg-gray-100 px-2 py-1 rounded-lg shrink-0">
            {responseCount} response{responseCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {req.services_needed?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {req.services_needed.map((s: string) => (
            <span key={s} className="pill-neutral">{s}</span>
          ))}
        </div>
      )}

      <p className="text-sm text-ink-700 leading-relaxed mb-3">{req.details}</p>

      {sent ? (
        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
          <CheckCircle2 className="w-4 h-4" /> Response sent
        </div>
      ) : open ? (
        <div className="space-y-2 pt-2 border-t border-line-100">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Introduce yourself and how you can help…"
            className="w-full text-sm px-3 py-2 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (optional)"
              className="text-sm px-3 py-2 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Availability (optional)"
              className="text-sm px-3 py-2 rounded-lg border border-line-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button onClick={respond} disabled={sending || !message.trim()} className="btn-primary w-full justify-center gap-2 text-sm">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending…" : "Send response"}
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-secondary text-sm">Respond</button>
      )}
    </motion.div>
  );
}

export default function DashboardRequestsPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<any>(null);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await getProviderByUserId(user.id);
      setProvider(p);
      const data = await fetch("/api/requests").then((r) => r.json()).catch(() => ({ requests: [] }));
      setRequests(data.requests || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="py-20 text-center text-ink-400 text-sm">Loading open requests…</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-ink-900">Open requests</h1>
          <p className="text-sm text-ink-500">Participants looking for support like yours — respond directly.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="card-flat p-10 text-center">
          <p className="text-sm text-ink-500">No open requests right now — check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <RequestCard key={r.id} req={r} providerSlug={provider?.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
