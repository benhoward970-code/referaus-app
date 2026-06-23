'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare, Phone, Mail, Calendar, Check, Loader2, AlertCircle, Eye, Download, Clipboard,
  Archive, Inbox, Send, X, Reply,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import {
  getProviderByUserId,
  getProviderEnquiries,
  markEnquiryRead,
  supabase,
} from '@/lib/supabase';

const REPLY_TEMPLATES = [
  "Thanks for reaching out! I'll get back to you within 24 hours.",
  "I'd love to help. What times work for a phone call?",
  "Thanks for your enquiry. Unfortunately we're fully booked at the moment.",
];

function ReplyTemplates() {
  const [toast, setToast] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied to clipboard!');
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast('Copy failed — please copy manually.');
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="relative">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Reply Templates</p>
      <div className="flex flex-wrap gap-2">
        {REPLY_TEMPLATES.map((template) => (
          <button
            key={template}
            onClick={() => handleCopy(template)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors max-w-[280px] text-left"
          >
            <Clipboard className="w-3 h-3 shrink-0" />
            <span className="truncate">{template}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function exportEnquiriesToCSV(enquiries: EnquiryRecord[]) {
  const headers = ['Name', 'Email', 'Phone', 'Service', 'Message', 'Date'];
  const rows = enquiries.map((e) => [
    e.name || '',
    e.email || '',
    e.phone || '',
    e.service || 'General',
    (e.message || '').replace(/"/g, '""'),
    e.created_at ? new Date(e.created_at).toLocaleDateString() : '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnquiryRecord = Record<string, any>;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function InlineReply({ enquiryId, enquiryEmail, token, onSent }: {
  enquiryId: string;
  enquiryEmail: string;
  token: string;
  onSent: (id: string) => void;
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/enquiries/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enquiry_id: enquiryId, message: message.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to send reply');
      } else {
        onSent(enquiryId);
      }
    } catch {
      setError('Network error — please try again');
    }
    setSending(false);
  };

  return (
    <div className="mt-3 border-t border-blue-100 pt-3">
      <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
        <Reply className="w-3 h-3" /> Replying to {enquiryEmail}
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your reply..."
        rows={3}
        maxLength={2000}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{message.length}/2000</span>
        <div className="flex gap-2">
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            {sending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EnquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<Record<string, any> | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [tab, setTab] = useState<'open' | 'archived'>('open');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    if (p?.slug) {
      const enq = await getProviderEnquiries(p.slug);
      setEnquiries(enq);
    }
    // Cache auth token for reply API calls
    const { data: { session } } = await supabase!.auth.getSession();
    if (session?.access_token) setAuthToken(session.access_token);
    setLoading(false);
  }, [user]);

  const handleReplySent = (enquiryId: string) => {
    setEnquiries((prev) =>
      prev.map((e) => e.id === enquiryId ? { ...e, replied_at: new Date().toISOString(), read: true } : e)
    );
    setReplyingTo(null);
  };

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleMarkRead = async (id: string) => {
    setMarkingRead(id);
    const result = await markEnquiryRead(id);
    if (result.success) {
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, read: true } : e)),
      );
    }
    setMarkingRead(null);
  };

  const handleArchive = async (id: string, archive: boolean) => {
    setArchiving(id);
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ id, archived: archive }),
      });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, archived: archive, read: archive ? true : e.read } : e)),
      );
    } catch {}
    setArchiving(null);
  };

  const openEnquiries = enquiries.filter((e) => !e.archived);
  const archivedEnquiries = enquiries.filter((e) => e.archived);
  const visibleEnquiries = tab === 'open' ? openEnquiries : archivedEnquiries;
  const unreadCount = openEnquiries.filter((e) => !e.read).length;

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!provider) {
    return (
      <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Provider Profile Found</h2>
        <p className="text-sm text-gray-500 mb-4">Set up your profile first to receive enquiries.</p>
        <Link href="/dashboard/profile" className="text-sm text-blue-600 hover:underline">Set Up Profile</Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Oswald'" }}>
            Enquiries
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {openEnquiries.length} open · {archivedEnquiries.length} archived
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {enquiries.length > 0 && (
            <button
              onClick={() => exportEnquiriesToCSV(visibleEnquiries)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp(0.02)} className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setTab('open')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'open' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          Open
          {openEnquiries.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
              {openEnquiries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('archived')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'archived' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          Archived
          {archivedEnquiries.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === 'archived' ? 'bg-gray-200 text-gray-600' : 'bg-gray-200 text-gray-500'}`}>
              {archivedEnquiries.length}
            </span>
          )}
        </button>
      </motion.div>

      {/* Reply Templates */}
      {tab === 'open' && openEnquiries.length > 0 && (
        <motion.div {...fadeUp(0.05)} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <ReplyTemplates />
        </motion.div>
      )}

      {/* Empty state */}
      {visibleEnquiries.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {tab === 'archived' ? 'No Archived Enquiries' : 'No Enquiries Yet'}
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {tab === 'archived'
              ? 'Enquiries you archive will appear here.'
              : 'When participants send you enquiries through your listing, they will appear here.'}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Desktop table */}
          <motion.div {...fadeUp(0.1)} className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Participant</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Service</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Message</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleEnquiries.map((e, i) => (
                    <tr key={e.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            !e.read ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {(e.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                            <p className="text-xs text-gray-400">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {e.phone ? (
                          <a href={`tel:${e.phone}`} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                            <Phone className="w-3 h-3" /> {e.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                          {e.service || 'General'}
                        </span>
                      </td>
                      <td className="px-3 py-4 max-w-[220px]">
                        <p className="text-xs text-gray-500 line-clamp-2">{e.message}</p>
                        {replyingTo === e.id && authToken && e.email && (
                          <InlineReply
                            enquiryId={e.id}
                            enquiryEmail={e.email}
                            token={authToken}
                            onSent={handleReplySent}
                          />
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {e.created_at ? new Date(e.created_at).toLocaleDateString() : ''}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {e.read ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            New
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {!e.read && (
                            <button
                              onClick={() => handleMarkRead(e.id)}
                              disabled={markingRead === e.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-60"
                            >
                              {markingRead === e.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              Mark read
                            </button>
                          )}
                          {e.email && (
                            <button
                              onClick={() => setReplyingTo(replyingTo === e.id ? null : e.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                replyingTo === e.id
                                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                                  : e.replied_at
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                              title={e.replied_at ? `Replied ${new Date(e.replied_at).toLocaleDateString()}` : 'Reply'}
                            >
                              {replyingTo === e.id ? <X className="w-3 h-3" /> : <Reply className="w-3 h-3" />}
                              {e.replied_at ? 'Replied' : 'Reply'}
                            </button>
                          )}
                          <button
                            onClick={() => handleArchive(e.id, !e.archived)}
                            disabled={archiving === e.id}
                            className={`p-1.5 rounded-lg text-xs transition-colors disabled:opacity-60 ${
                              e.archived
                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                            aria-label={e.archived ? 'Unarchive' : 'Archive'}
                            title={e.archived ? 'Unarchive' : 'Archive'}
                          >
                            {archiving === e.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : e.archived ? (
                              <Inbox className="w-3.5 h-3.5" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {visibleEnquiries.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
                className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 ${
                  !e.read ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      !e.read ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {(e.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{e.name}</p>
                      <p className="text-xs text-gray-400">{e.email}</p>
                    </div>
                  </div>
                  {!e.read ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      New
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Read
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                    {e.service || 'General'}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {e.created_at ? new Date(e.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{e.message}</p>

                {replyingTo === e.id && authToken && e.email && (
                  <InlineReply
                    enquiryId={e.id}
                    enquiryEmail={e.email}
                    token={authToken}
                    onSent={handleReplySent}
                  />
                )}

                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex gap-2 flex-wrap">
                    {e.phone && (
                      <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    )}
                    {e.email && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === e.id ? null : e.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          replyingTo === e.id
                            ? 'bg-blue-600 text-white'
                            : e.replied_at
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {replyingTo === e.id ? <X className="w-3 h-3" /> : <Reply className="w-3 h-3" />}
                        {e.replied_at ? 'Replied' : 'Reply'}
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(e.id, !e.archived)}
                      disabled={archiving === e.id}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 ${
                        e.archived ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {archiving === e.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : e.archived ? (
                        <><Inbox className="w-3 h-3" /> Unarchive</>
                      ) : (
                        <><Archive className="w-3 h-3" /> Archive</>
                      )}
                    </button>
                  </div>
                  {!e.read && (
                    <button
                      onClick={() => handleMarkRead(e.id)}
                      disabled={markingRead === e.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-60"
                    >
                      {markingRead === e.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Mark read
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
