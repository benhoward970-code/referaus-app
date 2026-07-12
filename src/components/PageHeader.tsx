"use client";
import { motion } from "framer-motion";

/*
 * PageHeader — consistent gradient header band for all inner pages.
 * Gives a subtle blue-tinted top that matches the aurora homepage feel.
 */
interface PageHeaderProps {
  label?: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode; // extra elements (search bar, CTAs, etc.)
}

export function PageHeader({ label, title, subtitle, children }: PageHeaderProps) {
  return (
    <div
      className="pt-28 pb-10 px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, rgba(37,99,235,0.08) 0%, rgba(249,115,22,0.04) 50%, transparent 100%)",
      }}
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #2563eb, #f97316, transparent)" }} />

      <div className="max-w-7xl mx-auto">
        {label && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-[0.7rem] font-medium tracking-[0.15em] uppercase text-orange-500 mb-3 block">{label}</span>
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 mb-3"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 text-lg max-w-xl"
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
