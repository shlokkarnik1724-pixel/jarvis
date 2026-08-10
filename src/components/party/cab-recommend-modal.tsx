"use client";

import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/sound/sfx";

export type CabTarget = {
  name: string;
  drinkLabel: string;
  level: number;
};

/** Drunk-cab popup with Uber / Ola deep links for Pune. */
export function CabRecommendModal({
  open,
  onClose,
  targets,
  lat,
  lng,
}: {
  open: boolean;
  onClose: () => void;
  targets: CabTarget[];
  lat?: number | null;
  lng?: number | null;
}) {
  if (!open) return null;

  const dropLat = lat ?? 18.5204;
  const dropLng = lng ?? 73.8567;
  const uber = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${dropLat}&dropoff[longitude]=${dropLng}`;
  const ola = `https://book.olacabs.com/?lat=${dropLat}&lng=${dropLng}`;
  const maps = `https://www.google.com/maps?q=${dropLat},${dropLng}`;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-[1.75rem] border border-white/30 bg-[#fff8f1] p-5 text-[#1a120c] shadow-2xl">
        <p className="font-island text-2xl font-extrabold text-[#1a120c]">🚕 Cab check</p>
        <p className="mt-2 text-sm text-[#4a3a30]">
          Someone&apos;s too drunk to drive. Book a ride home — Pune edition.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {targets.map((t) => (
            <li
              key={t.name}
              className="rounded-xl border border-[#e8d5c4] bg-white px-3 py-2 font-semibold text-[#1a120c]"
            >
              {t.name} · {t.drinkLabel} → 🚫 not worthy driver
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-2">
          <Button
            className="min-h-11"
            onClick={() => {
              playSound("success");
              window.open(uber, "_blank", "noopener,noreferrer");
            }}
          >
            Open Uber
          </Button>
          <Button
            className="min-h-11"
            variant="secondary"
            onClick={() => {
              playSound("tap");
              window.open(ola, "_blank", "noopener,noreferrer");
            }}
          >
            Open Ola
          </Button>
          <Button
            className="min-h-11"
            variant="ghost"
            onClick={() => {
              playSound("tap");
              window.open(maps, "_blank", "noopener,noreferrer");
            }}
          >
            View location on Maps
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
