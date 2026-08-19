"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Flame, ThermometerSun, Snowflake, AlertTriangle, ShieldAlert, Clock } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnquiryRecord = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProviderRecord = Record<string, any>;

type LeadTemp = "hot" | "warm" | "cold";

function scoreEnquiry(e: EnquiryRecord): LeadTemp {
  const ageHours = (Date.now() - new Date(e.created_at).getTime()) / 3600000;
  if (!e.read && ageHours < 24) return "hot";
  if (!e.archived && ageHours < 24 * 7) return "warm";
  return "cold";
}

const TEMP_STYLE: Record<LeadTemp, { label: string; icon: typeof Flame; className: string }> = {
  hot: { label: "Hot", icon: Flame, className: "bg-rose-50 text-rose-700 border-rose-200" },
  warm: { label: "Warm", icon: ThermometerSun, className: "bg-amber-50 text-amber-700 border-amber-200" },
  cold: { label: "Cold", icon: Snowflake, className: "bg-blue-50 text-blue-600 border-blue-200" },
};

/** Lead scoring + compliance nudges — computed client-side from data already on the dashboard, no new backend needed. */
export function DashboardInsights({ provider, enquiries }: { provider: ProviderRecord; enquiries: EnquiryRecord[] }) {
  const scored = useMemo(() => {
    const withScores = enquiries.map((e) => ({ ...e, temp: scoreEnquiry(e) }));
    return {
      hot: withScores.filter((e) => e.temp === "hot"),
      warm: withScores.filter((e) => e.temp === "warm"),
      cold: withScores.filter((e) => e.temp === "cold"),
    };
  }, [enquiries]);

  const complianceAlerts = useMemo(() => {
    const alerts: { icon: typeof AlertTriangle; text: string; href?: string; tone: "warn" | "danger" }[] = [];

    if (provider?.registration_expiry) {
      const daysLeft = Math.floor((new Date(provider.registration_expiry).getTime() - Date.now()) / 86400000);
      if (daysLeft < 0) {
        alerts.push({ icon: ShieldAlert, text: "Your NDIS registration has expired — update it to keep your Verified badge.", tone: "danger" });
      } else if (daysLeft < 60) {
        alerts.push({ icon: AlertTriangle, text: `NDIS registration expires in ${daysLeft} days — renew soon.`, tone: "warn" });
      }
    }

    const unanswered = enquiries.filter((e) => {
      const ageHours = (Date.now() - new Date(e.created_at).getTime()) / 3600000;
      return !e.read && ageHours > 48;
    });
    if (unanswered.length > 0) {
      alerts.push({
        icon: Clock,
        text: `${unanswered.length} enquir${unanswered.length === 1 ? "y" : "ies"} unanswered for 48+ hours — reply soon to protect your response rate.`,
        href: "/dashboard/enquiries",
        tone: "warn",
      });
    }

    return alerts;
  }, [provider, enquiries]);

  if (enquiries.length === 0 && complianceAlerts.length === 0) return null;

  return (
    <div className="card-flat shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-900">Lead scoring</h3>
        <Link href="/dashboard/enquiries" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View all enquiries →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["hot", "warm", "cold"] as LeadTemp[]).map((temp) => {
          const style = TEMP_STYLE[temp];
          const Icon = style.icon;
          return (
            <div key={temp} className={`rounded-xl border px-3 py-3 text-center ${style.className}`}>
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xl font-black">{scored[temp].length}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide">{style.label}</div>
            </div>
          );
        })}
      </div>

      {complianceAlerts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-line-100">
          {complianceAlerts.map((a, i) => {
            const Icon = a.icon;
            const tone = a.tone === "danger" ? "text-rose-700 bg-rose-50 border-rose-200" : "text-amber-700 bg-amber-50 border-amber-200";
            const content = (
              <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${tone}`}>
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{a.text}</span>
              </div>
            );
            return a.href ? <Link key={i} href={a.href}>{content}</Link> : content;
          })}
        </div>
      )}
    </div>
  );
}
