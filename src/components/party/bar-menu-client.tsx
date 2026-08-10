"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { DRINK_TIERS } from "@/lib/party/systems";
import { partyGet, partyPost } from "@/lib/party/client";
import { toast } from "@/lib/store/toast-store";

type TierRow = {
  userId: string;
  name: string;
  tierKey: string;
  label: string;
  level: number;
  isDD: boolean;
};

export function BarMenuClient() {
  const [tiers, setTiers] = useState<TierRow[]>([]);
  const [nags, setNags] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const data = await partyGet<{ tiers: TierRow[]; nags: string[] }>("bar");
      setTiers(data.tiers);
      setNags(data.nags);
    });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <IslandCard emoji="🍺" title="Bar Menu" accent="rgba(240,194,122,0.45)">
        <p className="text-sm text-[var(--ink-muted)]">
          Self-report your drink tier. Slösh+ gets hydration nags. DD stays sober.
        </p>
        <Link
          href="/fun/drinks"
          className="mt-3 inline-block text-sm text-[var(--accent-deep)] underline"
        >
          📖 open Bar Bible recipes →
        </Link>
      </IslandCard>

      {nags.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-[var(--warn)]/30 bg-[var(--warn-soft)] p-4 text-sm text-[var(--warn)]">
          {nags.map((nag) => (
            <p key={nag}>🧃 {nag}</p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {DRINK_TIERS.map((tier) => (
          <Button
            key={tier.key}
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const data = await partyPost<{ tiers: TierRow[]; nags: string[] }>({
                    feature: "bar",
                    action: "tier",
                    tierKey: tier.key,
                  });
                  setTiers(data.tiers);
                  setNags(data.nags);
                  toast("Tier updated", { description: tier.label, tone: "success" });
                } catch (error) {
                  toast("Couldn’t set tier", {
                    description: error instanceof Error ? error.message : undefined,
                    tone: "error",
                  });
                }
              })
            }
          >
            {tier.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {tiers.map((row) => (
          <div
            key={row.userId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {row.name} {row.isDD ? "🚗 DD" : ""}
              </p>
              <p className="text-sm text-[var(--ink-muted)]">{row.label}</p>
            </div>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${(row.level / 6) * 100}%` }}
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const data = await partyPost<{ tiers: TierRow[]; nags: string[] }>({
                    feature: "bar",
                    action: "dd",
                    userId: row.isDD ? null : row.userId,
                  });
                  setTiers(data.tiers);
                  setNags(data.nags);
                })
              }
            >
              {row.isDD ? "Clear DD" : "Make DD"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
