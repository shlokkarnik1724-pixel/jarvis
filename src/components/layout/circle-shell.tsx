"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion/page-transition";
import { StatusPulse } from "@/components/ui/skeleton";
import { OceanBackdrop } from "@/components/islands/island-card";
import { NAV_ISLANDS } from "@/lib/islands/catalog";
import { duration, easeOut } from "@/lib/motion";

interface CircleShellProps {
  circleName: string;
  userName: string;
  demo: boolean;
  children: React.ReactNode;
}

export function CircleShell({
  circleName,
  userName,
  demo,
  children,
}: CircleShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-screen text-[var(--ink)]">
      <OceanBackdrop />

      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/30 glass-nav transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 flex items-start justify-between gap-3">
              <div>
                <p className="font-island text-2xl tracking-tight text-[var(--ink)]">
                  🌀 Circle
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{circleName}</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 transition hover:bg-[var(--accent-soft)] active:scale-95 lg:hidden"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              {NAV_ISLANDS.map((item) => {
                const active =
                  item.href === "/fun"
                    ? pathname === "/fun"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
                      active
                        ? "bg-white/55 text-[var(--accent-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                        : "text-[var(--ink-muted)] hover:bg-white/35 hover:text-[var(--ink)]"
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId={reduced ? undefined : "nav-active"}
                        className="absolute inset-y-1 left-0 w-1 rounded-full bg-[var(--accent)]"
                        transition={{ duration: duration.fast, ease: easeOut }}
                      />
                    ) : null}
                    <span className="text-lg leading-none transition-transform duration-200 group-hover:scale-110">
                      {item.emoji}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/40 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium">{userName}</p>
                {demo ? <StatusPulse tone="accent" /> : null}
              </div>
              {demo ? (
                <p className="mt-1 text-[var(--ink-muted)]">Demo session</p>
              ) : null}
              <form action="/api/auth/logout" method="post" className="mt-3">
                <Button type="submit" variant="secondary" size="sm" className="w-full">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </aside>

        <AnimatePresence>
          {open ? (
            <motion.button
              type="button"
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px] lg:hidden"
              aria-label="Close overlay"
              onClick={() => setOpen(false)}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast }}
            />
          ) : null}
        </AnimatePresence>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/30 glass-nav px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-white/40 bg-white/50 p-2 shadow-sm transition hover:border-[var(--accent)] active:scale-95 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <p className="text-sm text-[var(--ink-muted)]">
                Floating islands for your closed circle
              </p>
            </div>
            <Link
              href="/events"
              className="text-sm font-medium text-[var(--accent-deep)] transition hover:text-[var(--accent)] active:scale-95"
            >
              ⏳ Events
            </Link>
          </header>
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
