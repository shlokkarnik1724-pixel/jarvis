"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { duration, easeOut } from "@/lib/motion";
import { useToastStore, type ToastTone } from "@/lib/store/toast-store";
import { cn } from "@/lib/utils";

const toneStyles: Record<ToastTone, string> = {
  default:
    "border-[var(--line)] bg-[var(--bg-elevated)]/90 text-[var(--ink)]",
  success:
    "border-[var(--ok)]/25 bg-[var(--ok-soft)]/95 text-[var(--ok)]",
  error:
    "border-[var(--danger)]/25 bg-[var(--danger-soft)]/95 text-[var(--danger)]",
  info: "border-[var(--accent)]/25 bg-[var(--accent-soft)]/95 text-[var(--accent-deep)]",
};

function ToastCard({
  id,
  title,
  description,
  tone,
  durationMs,
}: {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs?: number;
}) {
  const dismiss = useToastStore((s) => s.dismiss);
  const reduced = useReducedMotion();

  useEffect(() => {
    const ms = durationMs ?? 3200;
    const timer = window.setTimeout(() => dismiss(id), ms);
    return () => window.clearTimeout(timer);
  }, [dismiss, durationMs, id]);

  return (
    <motion.div
      layout
      initial={reduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: duration.fast, ease: easeOut }}
      className={cn(
        "pointer-events-auto glass-panel flex w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_-28px_rgba(20,32,27,0.55)]",
        toneStyles[tone]
      )}
      role="status"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{title}</p>
        {description ? (
          <p className="mt-0.5 text-xs opacity-80">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(id)}
        className="rounded-lg p-1 opacity-60 transition hover:opacity-100 active:scale-95"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard
            key={t.id}
            id={t.id}
            title={t.title}
            description={t.description}
            tone={t.tone}
            durationMs={t.duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
