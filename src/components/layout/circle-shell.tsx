"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PartyIntro } from "@/components/party/party-intro";
import { BackToCircleBubble } from "@/components/party/back-to-circle";
import { PageTransition } from "@/components/motion/page-transition";
import { StatusPulse } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PARTY_ISLANDS, themeForPath } from "@/lib/islands/party-catalog";
import { cn } from "@/lib/utils";

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
  const isHome = pathname === "/dashboard";
  const theme = themeForPath(pathname);

  return (
    <div className={cn("relative min-h-screen text-[var(--ink)]", `theme-${theme}`)}>
      <PartyIntro />
      <div className="party-ocean pointer-events-none fixed inset-0 -z-10" />
      <div className="party-orbs pointer-events-none fixed inset-0 -z-10" aria-hidden />

      {!isHome ? <BackToCircleBubble /> : null}

      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/15 bg-black/25 px-4 py-3 backdrop-blur-xl lg:px-8">
        <div className={cn("min-w-0", !isHome && "pl-28 sm:pl-36")}>
          <LinkHome isHome={isHome} />
          <p className="truncate text-xs text-white/65">
            {circleName} · {userName}
            {demo ? " · demo" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {demo ? <StatusPulse tone="accent" /> : null}
          <form action="/api/auth/logout" method="post">
            <Button type="submit" size="sm" variant="secondary" className="bg-white/15 text-white border-white/20">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      {!isHome ? (
        <nav className="scrollbar-none sticky top-[57px] z-30 flex gap-2 overflow-x-auto border-b border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
          {PARTY_ISLANDS.slice(0, 8).map((island) => {
            const active =
              pathname === island.href || pathname.startsWith(`${island.href}/`);
            return (
              <Link
                key={island.href}
                href={island.href}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm transition active:scale-95",
                  active
                    ? "border-white/50 bg-white/25 text-white"
                    : "border-white/15 bg-white/5 text-white/75 hover:bg-white/15"
                )}
              >
                {island.emoji} {island.title}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <main
        className={cn(
          "relative mx-auto w-full",
          isHome ? "max-w-6xl px-3 py-4 md:px-6" : "max-w-5xl px-4 py-8 lg:px-8"
        )}
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

function LinkHome({ isHome }: { isHome: boolean }) {
  if (isHome) {
    return (
      <p className="font-island text-lg font-extrabold tracking-tight text-white">
        🌀 Circle
      </p>
    );
  }
  return (
    <Link
      href="/dashboard"
      className="font-island text-lg font-extrabold tracking-tight text-white hover:opacity-90"
    >
      🌀 Circle
    </Link>
  );
}
