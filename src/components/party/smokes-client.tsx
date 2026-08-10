"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IslandCard, ConfettiBurst } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { partyGet, partyPost } from "@/lib/party/client";
import { playSound } from "@/lib/sound/sfx";
import { toast } from "@/lib/store/toast-store";
import type { SmokeRowView } from "@/lib/types";

export function SmokesClient() {
  const [rows, setRows] = useState<SmokeRowView[] | null>(null);
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  useEffect(() => {
    startTransition(async () => {
      const data = await partyGet<{ rows: SmokeRowView[] }>("smokes");
      setRows(data.rows);
    });
  }, []);

  function bump(userId: string, kind: "cigarettes" | "greens", delta = 1) {
    startTransition(async () => {
      const data = await partyPost<{ rows: SmokeRowView[] }>({
        feature: "smokes",
        action: "bump",
        userId,
        kind,
        delta,
      });
      setRows(data.rows);
      if (!reduced) {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 900);
      }
      toast(kind === "cigarettes" ? "Sutta logged" : "Greens logged", {
        tone: "success",
      });
      playSound(kind === "cigarettes" ? "sutta" : "danger");
    });
  }

  return (
    <div className="space-y-6">
      <ConfettiBurst show={burst} />
      <IslandCard emoji="🚬" title="Sutta Counter" floatDuration={4.6}>
        <p className="text-sm text-[var(--ink-muted)]">
          Who&apos;s the Suttebaaz tonight? Track cigarettes + greens. Titles get
          progressively unhinged.
        </p>
      </IslandCard>

      <div className="overflow-x-auto rounded-[1.5rem] border border-white/40 bg-white/55">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-black/5 text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3">Friend</th>
              <th className="px-4 py-3">Cigarettes</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Greens</th>
              <th className="px-4 py-3">Vibe</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row, i) => (
              <motion.tr
                key={row.userId}
                className="border-b border-[var(--line)]/70"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-xs text-[var(--ink-muted)]">{row.nickname}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-[var(--accent-deep)]">
                      {row.cigarettes}
                    </span>
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => bump(row.userId, "cigarettes", 1)}
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending || row.cigarettes <= 0}
                      onClick={() => bump(row.userId, "cigarettes", -1)}
                    >
                      −1
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{row.cigTitle}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold">{row.greens}</span>
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => bump(row.userId, "greens", 1)}
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending || row.greens <= 0}
                      onClick={() => bump(row.userId, "greens", -1)}
                    >
                      −1
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">{row.greenTitle}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
