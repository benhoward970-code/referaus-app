"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

/**
 * Wraps dashboard pages. Redirects unauthenticated users to /login.
 * Shows a blank loading screen while auth state is resolving so there's
 * no flash of dashboard content for logged-out visitors.
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const redirect = encodeURIComponent(pathname || "/dashboard");
      router.push(`/login?redirect=${redirect}`);
    }
  }, [loading, user, router, pathname]);

  // While loading or redirecting, show nothing (avoids content flash)
  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
