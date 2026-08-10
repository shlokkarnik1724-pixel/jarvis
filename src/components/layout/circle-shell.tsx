"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PartyIntro } from "@/components/party/party-intro";
import { FeatureEnvironment } from "@/components/party/feature-environment";
import { AmbientGifField } from "@/components/party/ambient-gif-field";
import { StealthGate } from "@/components/party/stealth-gate";
import { NotificationCenter } from "@/components/party/notification-center";
import { BackToCircleBubble } from "@/components/party/back-to-circle";
import { PageTransition } from "@/components/motion/page-transition";
import { StatusPulse } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PARTY_ISLANDS, themeForPath } from "@/lib/islands/party-catalog";
import { armSounds, playSound } from "@/lib/sound/sfx";
import { cn } from "@/lib/utils";

interface CircleShellProps {
  circleName: string;
  userName: string;
  demo: boolean;
  children: React.ReactNode;
}

const MOBILE_DOCK = [
  { href: "/dashboard", emoji: "🌀", label: "Home" },
  { href: "/fun/chat", emoji: "💬", label: "Chat" },
  { href: "/fun/tabs", emoji: "💸", label: "Tabs" },
  { href: "/fun/bar", emoji: "🍺", label: "Bar" },
  { href: "/events", emoji: "📅", label: "Hang" },
];

export function CircleShell({
  circleName,
  userName,
  demo,
  children,
}: CircleShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const theme = themeForPath(pathname);

  useEffect(() => {
    function arm() {
      armSounds();
      window.removeEventListener("pointerdown", arm);
    }
    window.addEventListener("pointerdown", arm, { once: true });
    return () => window.removeEventListener("pointerdown", arm);
  }, []);

  return (
    <StealthGate>
      <div
        className={cn(
          "app-shell relative min-h-dvh text-white",
          `theme-${theme}`
        )}
      >
        <PartyIntro />
        <div className="party-ocean pointer-events-none fixed inset-0 -z-10" />
        <div className="party-lights pointer-events-none fixed inset-0 -z-10" aria-hidden />
        <div className="party-orbs pointer-events-none fixed inset-0 -z-10" aria-hidden />
        <div className="party-particles pointer-events-none fixed inset-0 -z-10 opacity-40" aria-hidden />
        {!isHome ? <AmbientGifField density="light" className="fixed opacity-80" /> : null}

        {!isHome ? <BackToCircleBubble /> : null}

        <header className="app-header sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/20 bg-black/60 px-3 py-2.5 backdrop-blur-xl sm:px-4 lg:px-8">
          <div className={cn("min-w-0", !isHome && "pl-14 sm:pl-36")}>
            <LinkHome isHome={isHome} />
            <p className="truncate text-[11px] font-medium text-white drop-shadow sm:text-xs">
              {circleName} · {userName}
              {demo ? " · demo" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            {demo ? <StatusPulse tone="accent" /> : null}
            <form action="/api/auth/logout" method="post">
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                className="min-h-10 border-white/25 bg-white/15 px-3 text-white"
                onClick={() => playSound("tap")}
              >
                Sign out
              </Button>
            </form>
          </div>
        </header>

        {!isHome ? (
          <nav className="scrollbar-none sticky top-[52px] z-30 hidden gap-2 overflow-x-auto border-b border-white/15 bg-black/40 px-3 py-2 backdrop-blur-md md:flex">
            {PARTY_ISLANDS.slice(0, 8).map((island) => {
              const active =
                pathname === island.href || pathname.startsWith(`${island.href}/`);
              return (
                <Link
                  key={island.href}
                  href={island.href}
                  onClick={() => playSound("tap")}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition active:scale-95",
                    active
                      ? "border-white/55 bg-white/25 text-white"
                      : "border-white/20 bg-black/25 text-white/85 hover:bg-white/15"
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
            "relative mx-auto w-full pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8",
            isHome
              ? "max-w-6xl px-3 py-3 sm:px-4 md:px-6 md:py-4"
              : "max-w-5xl px-3 py-5 sm:px-4 md:py-8 lg:px-8"
          )}
        >
          <PageTransition>
            {isHome ? children : <FeatureEnvironment>{children}</FeatureEnvironment>}
          </PageTransition>
        </main>

        <nav className="app-dock fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-black/80 px-2 pt-2 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1 pb-[env(safe-area-inset-bottom)]">
            {MOBILE_DOCK.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => playSound("tap")}
                  className={cn(
                    "flex min-h-12 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-1 text-[10px] font-semibold tracking-wide",
                    active ? "bg-white/20 text-white" : "text-white/70"
                  )}
                >
                  <span className="text-lg leading-none">{item.emoji}</span>
                  <span className="mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </StealthGate>
  );
}

function LinkHome({ isHome }: { isHome: boolean }) {
  if (isHome) {
    return (
      <p className="font-island text-base font-extrabold tracking-tight text-white drop-shadow sm:text-lg">
        🌀 Circle
      </p>
    );
  }
  return (
    <Link
      href="/dashboard"
      onClick={() => playSound("tap")}
      className="font-island text-base font-extrabold tracking-tight text-white drop-shadow hover:opacity-90 sm:text-lg"
    >
      🌀 Circle
    </Link>
  );
}
