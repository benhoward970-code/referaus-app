"use client";
import { useEffect } from "react";
import Lenis from "lenis";

/*
 * SmoothScrollProvider — wraps the app with Lenis lerped scroll.
 * Gives the site the inertia/flowy feel of premium agency sites.
 * Integrates with Framer Motion's useScroll via requestAnimationFrame.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Skip on mobile — native scroll is already smooth on iOS
    if (window.innerWidth < 768) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 0,
    });

    // Sync Lenis with Framer Motion's scroll tracking
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
