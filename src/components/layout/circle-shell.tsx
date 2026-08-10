"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Gamepad2,
  GlassWater,
  LayoutDashboard,
  MessageSquareQuote,
  Settings,
  Sparkles,
  Trophy,
  Vault,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion/page-transition";
import { StatusPulse } from "@/components/ui/skeleton";
import { duration, easeOut } from "@/lib/motion";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vault", label: "Photo Vault", icon: Vault },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/fun/vibe", label: "Vibe Gen", icon: Sparkles },
  { href: "/fun/drinks", label: "Drinks Bar", icon: GlassWater },
  { href: "/fun/roast-toast", label: "Roast & Toast", icon: MessageSquareQuote },
  { href: "/fun/tabs", label: "Tab Tracker", icon: Wallet },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,var(--mesh-a),transparent_70%)] blur-2xl animate-drift" />
        <div className="absolute right-[-80px] top-40 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,var(--mesh-b),transparent_68%)] blur-2xl animate-drift-delayed" />
        <div className="absolute bottom-[-120px] left-1/3 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,var(--mesh-c),transparent_70%)] blur-2xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-[var(--line)] glass-nav transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl tracking-tight text-[var(--ink)]">
                  Circle
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
              {NAV.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                        : "text-[var(--ink-muted)] hover:bg-[var(--bg)]/80 hover:text-[var(--ink)] hover:backdrop-blur-sm"
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId={reduced ? undefined : "nav-active"}
                        className="absolute inset-y-1 left-0 w-1 rounded-full bg-[var(--accent)]"
                        transition={{ duration: duration.fast, ease: easeOut }}
                      />
                    ) : null}
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                        active && "text-[var(--accent)]"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-[var(--line)] pt-4 text-sm">
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
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] lg:hidden"
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
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] glass-nav px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-[var(--line)] bg-[var(--bg-elevated)]/80 p-2 shadow-sm transition hover:border-[var(--accent)] hover:shadow-[0_0_0_3px_rgba(31,111,84,0.12)] active:scale-95 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
                <CalendarDays className="h-4 w-4" />
                Private circle hub
              </div>
            </div>
            <Link
              href="/events"
              className="text-sm font-medium text-[var(--accent-deep)] transition hover:text-[var(--accent)] active:scale-95"
            >
              All events
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
