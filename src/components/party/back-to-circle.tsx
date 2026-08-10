"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { duration, easeOut } from "@/lib/motion";

export function BackToCircleBubble({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn("fixed left-4 top-4 z-50", className)}
      initial={reduced ? false : { opacity: 0, scale: 0.9, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: duration.fast, ease: easeOut }}
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:scale-105 active:scale-95"
      >
        🔙 back to Circle
      </Link>
    </motion.div>
  );
}
