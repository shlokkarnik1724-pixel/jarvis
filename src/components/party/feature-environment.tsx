"use client";

import { usePathname } from "next/navigation";
import { islandForPath } from "@/lib/islands/party-catalog";
import { cn } from "@/lib/utils";

/** Quirky per-feature “room” wrapper — readable panel on themed stage. */
export function FeatureEnvironment({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const island = islandForPath(pathname);

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
        <div className={cn("feature-room-lights", island ? `room-${island.theme}` : undefined)} />
      </div>

      {island ? (
        <div className="mb-5 rounded-2xl border border-white/30 bg-black/55 px-4 py-3 text-white shadow-lg backdrop-blur-md">
          <p className="font-island text-xl font-extrabold tracking-tight text-white drop-shadow">
            <span className="mr-2 text-2xl">{island.emoji}</span>
            {island.title}
          </p>
          <p className="mt-1 text-sm font-medium text-white/90">{island.vibe}</p>
          <p className="mt-0.5 text-xs text-white/70">{island.blurb}</p>
        </div>
      ) : null}

      <div className="feature-readable rounded-[1.75rem] border border-white/50 bg-[#f7faf8] p-4 text-[var(--ink)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] md:p-6">
        {children}
      </div>
    </div>
  );
}
