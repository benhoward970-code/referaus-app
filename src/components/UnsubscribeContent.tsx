"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function UnsubscribeInner() {
  const searchParams = useSearchParams();
  const isDone = searchParams.get("status") === "done";
  const isError = !!searchParams.get("error");

  return (
    <div className="card-flat p-10 text-center max-w-md w-full">
      {isDone ? (
        <>
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 mb-2">You&apos;re unsubscribed</h1>
          <p className="text-ink-500 text-sm leading-relaxed">
            You&apos;ve been removed from the ReferAus newsletter. You won&apos;t receive any more marketing emails from us.
          </p>
          <p className="text-ink-400 text-xs mt-4">
            Note: You may still receive transactional emails related to your account or enquiries you&apos;ve sent.
          </p>
        </>
      ) : isError ? (
        <>
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 mb-2">Invalid link</h1>
          <p className="text-ink-500 text-sm">
            This unsubscribe link is missing or invalid. If you received a newsletter from us and want to unsubscribe, please email{" "}
            <a href="mailto:hello@referaus.com" className="text-orange-600 underline">hello@referaus.com</a>.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-ink-900 mb-2">Unsubscribe</h1>
          <p className="text-ink-500 text-sm">Processing your request…</p>
        </>
      )}

      <Link href="/" className="mt-8 inline-block text-sm text-orange-600 font-semibold hover:underline">
        Back to ReferAus
      </Link>
    </div>
  );
}

export function UnsubscribeContent() {
  return (
    <Suspense fallback={<div className="card-flat p-10 max-w-md w-full h-64 animate-pulse" />}>
      <UnsubscribeInner />
    </Suspense>
  );
}
