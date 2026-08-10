"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { duration, easeOut } from "@/lib/motion";

export function Badge({
  className,
  pulse = false,
  children,
}: {
  className?: string;
  pulse?: boolean;
  children?: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        className
      )}
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: duration.fast, ease: easeOut }}
    >
      {pulse ? (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-status-pulse rounded-full bg-current opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </motion.span>
  );
}
