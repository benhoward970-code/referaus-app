"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Providers", href: "/providers" },
  { label: "Compare", href: "/compare" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200"
            : "bg-white/80 backdrop-blur-md border-b border-gray-100"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? "text-gray-900 border-b-2 border-orange-500 pb-0.5"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm"
            >
              List Your Business
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden p-2 -mr-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l10 10M6 16L16 6" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="19" y2="6" />
                  <line x1="3" y1="12" x2="19" y2="12" />
                  <line x1="3" y1="18" x2="19" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 5l10 10M5 15L15 5" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 px-5 py-6 flex flex-col gap-1 overflow-y-auto">
                {NAV_LINKS.map(({ label, href }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-5 pb-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="text-center text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-center text-sm font-semibold px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all"
                >
                  List Your Business
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
