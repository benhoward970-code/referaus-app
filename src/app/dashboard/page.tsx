"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Eye, MessageSquare, Star, TrendingUp, ChevronRight,
  CheckCircle2, Circle, Lightbulb, Pencil, ExternalLink,
  Zap, User, Phone, Mail, Calendar, ArrowUpRight, Image,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  getProviderByUserId,
  getProviderEnquiries,
  getProviderReviews,
} from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProviderRecord = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnquiryRecord = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReviewRecord = Record<string, any>;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? "fill-orange-400 text-orange-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

const statColors: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-500", border: "border-yellow-100" },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [provider, setProvider] = useState<ProviderRecord | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    if (p?.slug) {
      const [enq, rev] = await Promise.all([
        getProviderEnquiries(p.slug),
        getProviderReviews(p.slug),
      ]);
      setEnquiries(enq);
      setReviews(rev);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  // Derived stats
  const unreadCount = enquiries.filter((e) => !e.read).length;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "0";

  const stats = [
    { label: "Total Enquiries", value: String(enquiries.length), icon: MessageSquare, color: "orange" },
    { label: "Unread Enquiries", value: String(unreadCount), icon: Eye, color: "blue" },
    { label: "Total Reviews", value: String(reviews.length), icon: Star, color: "yellow" },
    { label: "Average Rating", value: avgRating, icon: TrendingUp, color: "purple" },
  ];

  // Profile completion checks
  const profileChecks = provider
    ? [
        { label: "Business name added", done: !!provider.name },
        { label: "Description added", done: !!provider.description },
        { label: "Logo uploaded", done: !!provider.logo_url },
        { label: "Cover image uploaded", done: !!provider.cover_image_url },
        { label: "Phone number added", done: !!provider.phone },
        { label: "Services listed", done: Array.isArray(provider.services) && provider.services.length > 0 },
        { label: "Location set", done: !!provider.suburb || !!provider.location },
        { label: "Website added", done: !!provider.website },
      ]
    : [];

  const profileCompletion = profileChecks.length
    ? Math.round((profileChecks.filter((c) => c.done).length / profileChecks.length) * 100)
    : 0;

  const recentEnquiries = enquiries.slice(0, 5);
  const recentReviews = reviews.slice(0, 3);

  const tips = [
    { icon: Image, title: "Add more photos", desc: "Listings with 3+ photos get 2x more enquiries.", action: "Add photos", href: "/dashboard/images" },
    { icon: MessageSquare, title: "Reply faster", desc: "Responding within 1 hour increases booking rate by 40%.", action: "View enquiries", href: "/dashboard/enquiries" },
    { icon: Star, title: "Ask for reviews", desc: "Send a review request to your recent clients to build trust.", action: "Get reviews", href: "/dashboard/reviews" },
    { icon: Pencil, title: "Complete your profile", desc: `You are at ${profileCompletion}%. Full profiles rank higher in search.`, action: "Edit profile", href: "/dashboard/profile" },
  ];

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-9 w-72 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <Skeleton className="h-5 w-40 mb-4" />
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}
        </div>
      </div>
    );
  }

  // No provider profile found
  if (!provider) {
    return (
      <div className="space-y-8">
        <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-2" style={{ fontFamily: "'Oswald'" }}>
            Complete Your Provider Profile
          </h1>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Set up your provider profile to start receiving enquiries and appearing in search results on ReferAus.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm"
          >
            <Pencil className="w-4 h-4" /> Set Up Profile
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Provider Dashboard</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900" style={{ fontFamily: "'Oswald'" }}>
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              {provider.name}
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your listing.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/providers/${provider.slug}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
            <ExternalLink className="w-4 h-4" /> View Listing
          </Link>
          <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm">
            <Pencil className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const colors = statColors[s.color];
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              {...fadeUp(0.05 + i * 0.06)}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium leading-tight">{s.label}</p>
                <span className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                  <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-900">{s.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enquiries */}
        <motion.section {...fadeUp(0.2)} className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Enquiries</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {unreadCount} unread requiring action
              </p>
            </div>
            <Link href="/dashboard/enquiries" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No enquiries yet</p>
              <p className="text-xs text-gray-400 mt-1">Enquiries from participants will appear here.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="divide-y divide-gray-50 sm:hidden">
                {recentEnquiries.map((e) => (
                  <div key={e.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{e.name}</p>
                        <p className="text-xs text-gray-500">{e.service}</p>
                      </div>
                      {!e.read && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{e.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {e.created_at ? new Date(e.created_at).toLocaleDateString() : ""}
                      </span>
                      <div className="flex gap-2">
                        {e.phone && (
                          <a href={`tel:${e.phone}`} className="text-xs text-blue-600 font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Call
                          </a>
                        )}
                        <a href={`mailto:${e.email}`} className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Participant</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Service</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Message</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentEnquiries.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {(e.name || "?").charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                              <p className="text-xs text-gray-400">{e.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{e.service || "General"}</span>
                        </td>
                        <td className="px-3 py-4 max-w-[180px]">
                          <p className="text-xs text-gray-500 line-clamp-2">{e.message}</p>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {e.created_at ? new Date(e.created_at).toLocaleDateString() : ""}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          {e.read ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />New
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {e.phone && (
                              <a href={`tel:${e.phone}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <a href={`mailto:${e.email}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.section>

        {/* Right column */}
        <div className="space-y-5">
          {/* Profile Completion */}
          <motion.div {...fadeUp(0.25)} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Profile Strength</h2>
              <span className={`text-sm font-black ${profileCompletion >= 80 ? "text-green-600" : profileCompletion >= 50 ? "text-orange-500" : "text-red-500"}`}>
                {profileCompletion}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="space-y-2">
              {profileChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2.5">
                  {check.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-xs ${check.done ? "text-gray-600" : "text-gray-400"}`}>{check.label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/profile"
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center flex items-center justify-center gap-2 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" /> Complete Profile
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeUp(0.3)} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/dashboard/profile" className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200 transition-all group">
                <span className="flex items-center gap-2"><Pencil className="w-4 h-4 text-blue-500" /> Edit Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
              <Link href={`/providers/${provider.slug}`} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200 transition-all group">
                <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4 text-blue-500" /> View Public Listing</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
              <Link href="/dashboard/images" className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 border border-gray-200 transition-all group">
                <span className="flex items-center gap-2"><Image className="w-4 h-4 text-blue-500" /> Manage Images</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
              <Link href="/pricing" className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-sm font-medium text-orange-700 border border-orange-200 transition-all group">
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Upgrade Plan</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600 transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reviews */}
      <motion.section {...fadeUp(0.35)} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <Stars rating={Math.round(Number(avgRating))} />
                <span className="text-xs text-gray-500">{avgRating} average from {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          <Link href="/dashboard/reviews" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentReviews.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">Reviews from participants will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {recentReviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
                className="p-5 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.author || r.reviewer_name || "Anonymous"}</p>
                      <p className="text-xs text-gray-400">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <Stars rating={r.rating || 0} />
                </div>
                {r.service && (
                  <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">{r.service}</span>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;{r.text || r.comment || r.review || ""}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Tips */}
      <motion.section {...fadeUp(0.4)}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-orange-500" />
          <h2 className="text-base font-bold text-gray-900">Tips to Improve Your Listing</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, i) => {
            const TipIcon = tip.icon;
            return (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.06, duration: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                  <TipIcon className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{tip.title}</h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{tip.desc}</p>
                <Link href={tip.href} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  {tip.action} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Upgrade CTA */}
      <motion.div
        {...fadeUp(0.5)}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Grow your practice</span>
            </div>
            <h3 className="text-xl font-black" style={{ fontFamily: "'Oswald'" }}>Unlock Professional Features</h3>
            <p className="text-blue-200 text-sm mt-1">Get verified badge, priority ranking in search, direct booking, and advanced analytics.</p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all text-sm shadow-sm"
          >
            <Zap className="w-4 h-4" /> View Plans
          </Link>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -right-4 -bottom-10 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}
