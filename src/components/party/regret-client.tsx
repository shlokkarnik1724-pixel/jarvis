"use client";

import { useEffect, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { regretLabel } from "@/lib/party/systems";
import { partyGet, partyPost } from "@/lib/party/client";
import { toast } from "@/lib/store/toast-store";

type Regret = {
  id: string;
  name: string;
  score: number;
  label: string;
};

export function RegretClient() {
  const [score, setScore] = useState(35);
  const [regrets, setRegrets] = useState<Regret[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setRegrets(await partyGet<Regret[]>("regret"));
    });
  }, []);

  return (
    <div className="space-y-6">
      <IslandCard emoji="🧾" title="Regret-o-Meter" accent="rgba(163,59,43,0.35)">
        <p className="text-sm text-[var(--ink-muted)]">
          Morning-after check-in: no regrets → witness protection.
        </p>
      </IslandCard>

      <div className="rounded-2xl border border-white/40 bg-white/70 p-5">
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full"
        />
        <p className="mt-3 font-island text-xl font-bold">
          {score} — {regretLabel(score)}
        </p>
        <Button
          className="mt-4"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const data = await partyPost<{ regrets: Regret[] }>({
                feature: "regret",
                action: "set",
                score,
              });
              setRegrets(data.regrets);
              toast("Logged", { description: regretLabel(score), tone: "success" });
            })
          }
        >
          Submit morning status
        </Button>
      </div>

      <ul className="space-y-2">
        {regrets.map((r) => (
          <li key={r.id} className="rounded-xl bg-white/60 px-4 py-3 text-sm">
            <span className="font-medium">{r.name}</span>: {r.score} ({r.label})
          </li>
        ))}
      </ul>
    </div>
  );
}
