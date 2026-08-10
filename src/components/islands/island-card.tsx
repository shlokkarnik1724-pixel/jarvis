"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { duration, easeOut } from "@/lib/motion";

type IslandCardProps = {
  emoji: string;
  title: string;
  href?: string;
  accent?: string;
  pulse?: boolean;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
  floatDuration?: number;
};

export function IslandCard({
  emoji,
  title,
  href,
  accent = "rgba(31, 111, 84, 0.28)",
  pulse = false,
  className,
  children,
  delay = 0,
  floatDuration = 5,
}: IslandCardProps) {
  const reduced = useReducedMotion();

  const inner = (
    <motion.div
      className={cn(
        "island-card relative w-full overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/25 p-5 shadow-[0_18px_40px_-24px_rgba(20,32,27,0.45)] backdrop-blur-xl",
        pulse && "island-pulse",
        className
      )}
      style={{ boxShadow: `0 14px 36px -18px ${accent}` }}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={
        reduced
          ? { opacity: 1, y: 0 }
          : {
              opacity: 1,
              y: [0, -7, 0],
            }
      }
      transition={
        reduced
          ? { duration: duration.fast }
          : {
              opacity: { duration: duration.base, ease: easeOut, delay },
              y: {
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              },
            }
      }
      whileHover={
        reduced
          ? undefined
          : {
              y: -12,
              rotate: -1.2,
              scale: 1.03,
              transition: { duration: duration.fast, ease: easeOut },
            }
      }
      whileTap={reduced ? undefined : { scale: 0.98 }}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-3xl leading-none" aria-hidden>
          {emoji}
        </span>
        <h3 className="font-island text-lg font-extrabold tracking-tight text-[var(--ink)]">
          {title}
        </h3>
        {pulse ? (
          <span className="ml-auto inline-flex h-2.5 w-2.5 animate-status-pulse rounded-full bg-[var(--accent)]" />
        ) : null}
      </div>
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none">
        {inner}
      </Link>
    );
  }

  return inner;
}

export function OceanBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden ocean-bg">
      <div className="ocean-blob ocean-blob-a" />
      <div className="ocean-blob ocean-blob-b" />
      <div className="ocean-blob ocean-blob-c" />
    </div>
  );
}

export function ConfettiBurst({ show }: { show: boolean }) {
  const reduced = useReducedMotion();
  if (!show || reduced) return null;

  const bits = ["🎉", "✨", "💥", "🌟", "🎊", "💫"];
  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      {bits.map((bit, i) => (
        <motion.span
          key={`${bit}-${i}`}
          className="absolute text-2xl"
          style={{ left: `${12 + i * 14}%`, top: "35%" }}
          initial={{ opacity: 0, y: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], y: [-20, -120], scale: [0.6, 1.2, 0.8] }}
          transition={{ duration: 1.1, delay: i * 0.05, ease: easeOut }}
        >
          {bit}
        </motion.span>
      ))}
    </div>
  );
}
