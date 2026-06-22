'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, User, AlertCircle, MessageSquare, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getProviderByUserId, getProviderReviews, supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReviewRecord = Record<string, any>;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-6 text-right">{stars}</span>
      <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6">{count}</span>
    </div>
  );
}

function ReviewCard({ review: r, index: i }: { review: ReviewRecord; index: number }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState(r.response || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedResponse, setSavedResponse] = useState<string | null>(r.response || null);

  const handleSaveReply = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase!.auth.getSession();
      const res = await fetch('/api/reviews/reply', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ review_id: r.id, response: replyText }),
      });
      if (res.ok) {
        setSavedResponse(replyText.trim() || null);
        setSaved(true);
        setReplyOpen(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {r.author || r.reviewer_name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-400">
              {r.created_at ? new Date(r.created_at).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'long', year: 'numeric',
              }) : ''}
            </p>
          </div>
        </div>
        <Stars rating={r.rating || 0} />
      </div>
      {(r.service || r.service_type) && (
        <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg mb-2">
          {r.service || r.service_type}
        </span>
      )}
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        &ldquo;{r.text || r.comment || r.review || ''}&rdquo;
      </p>

      {/* Existing response */}
      {savedResponse && !replyOpen && (
        <div className="mt-3 pl-4 border-l-2 border-blue-200 bg-blue-50/50 rounded-r-xl py-3 pr-3">
          <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3" /> Your reply
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{savedResponse}</p>
          <button
            onClick={() => { setReplyText(savedResponse); setReplyOpen(true); }}
            className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium"
          >
            Edit reply
          </button>
        </div>
      )}

      {/* Reply form */}
      {replyOpen ? (
        <div className="mt-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value.slice(0, 1000))}
            placeholder="Write a professional reply..."
            rows={3}
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400 text-gray-900 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{replyText.length}/1000</span>
            <div className="flex gap-2">
              <button
                onClick={() => setReplyOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReply}
                disabled={saving || !replyText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {saving ? 'Saving…' : 'Save Reply'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-3">
          {!savedResponse && (
            <button
              onClick={() => setReplyOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="w-3 h-3" /> Reply
            </button>
          )}
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
              <Check className="w-3 h-3" /> Reply saved
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

function GetReviewsCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const reviewLink = `https://referaus.com/providers/${slug}#reviews`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const emailTemplate = `Hi [Name],

I hope you've been happy with the support I've provided through [Business Name].

If you have a moment, I'd really appreciate it if you could share your experience by leaving a review on my ReferAus profile. It only takes a minute and helps other NDIS participants find the right support.

Leave a review here: ${reviewLink}

Thank you so much,
[Your Name]`;

  return (
    <motion.div {...fadeUp(0.05)} className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 fill-white text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Get More Reviews</h2>
          <p className="text-sm text-gray-500">Share your review link with clients to build trust on your listing.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-orange-200 rounded-xl px-3 py-2 text-sm text-gray-600 font-mono overflow-hidden">
          <span className="truncate">{reviewLink}</span>
        </div>
        <button
          onClick={copyLink}
          className="shrink-0 px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          {copied ? <><Check className="w-4 h-4" /> Copied!</> : "Copy Link"}
        </button>
        <button
          onClick={() => setShowEmail(v => !v)}
          className="shrink-0 px-5 py-2 bg-white border border-orange-300 text-orange-700 text-sm font-semibold rounded-xl hover:bg-orange-50 transition-colors"
        >
          Email Template
        </button>
      </div>
      {showEmail && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Copy &amp; paste this email to send to clients:</p>
          <pre className="bg-white border border-orange-200 rounded-xl p-4 text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans select-all">
            {emailTemplate}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(emailTemplate).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            className="mt-2 text-xs text-orange-600 hover:underline"
          >
            {copied ? "Copied!" : "Copy email text"}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<Record<string, any> | null>(null);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    if (p?.slug) {
      const rev = await getProviderReviews(p.slug);
      setReviews(rev);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-36 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="sm:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Provider Profile Found</h2>
        <p className="text-sm text-gray-500 mb-4">Set up your profile first to receive reviews.</p>
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
            Reviews
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} from participants
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Get Reviews section */}
      <GetReviewsCard slug={provider.slug} />

      {/* Empty state */}
      {reviews.length === 0 ? (
        <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            When participants leave reviews on your listing, they will appear here. Ask your clients to share their experience.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary card */}
          <motion.div {...fadeUp(0.05)} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-24 self-start">
            <div className="text-center mb-5">
              <p className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center mt-2">
                <Stars rating={Math.round(avgRating)} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="space-y-2">
              {ratingDist.map((d) => (
                <RatingBar key={d.stars} stars={d.stars} count={d.count} total={reviews.length} />
              ))}
            </div>
          </motion.div>

          {/* Review cards */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.map((r, i) => (
              <ReviewCard key={r.id || i} review={r} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
