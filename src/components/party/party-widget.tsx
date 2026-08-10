"use client";

import { useEffect, useMemo, useState } from "react";

export function PartyWidget({
  name,
  emoji,
  startTs,
  location,
  confirmedCount,
  maybeCount,
}: {
  name: string;
  emoji: string;
  startTs: string | null;
  location: string;
  confirmedCount: number;
  maybeCount: number;
}) {
  const target = useMemo(
    () => (startTs ? new Date(startTs).getTime() : null),
    [startTs]
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  let countdown = "happening whenever";
  if (target) {
    const diff = Math.max(0, target - now);
    if (diff === 0) countdown = "LIVE RIGHT NOW";
    else {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdown = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} until start`;
    }
  }

  return (
    <div className="max-w-md rounded-3xl border border-white/25 bg-black/35 p-4 text-left shadow-xl backdrop-blur-xl">
      <h2 className="font-island text-xl font-bold text-white">
        {emoji} {name}
      </h2>
      <p className="mt-2 text-sm text-white/80">⏳ {countdown}</p>
      <p className="mt-1 text-sm text-white/80">📍 {location}</p>
      <p className="mt-1 text-sm text-white/80">
        👥 {confirmedCount} in, {maybeCount} maybe
      </p>
    </div>
  );
}
