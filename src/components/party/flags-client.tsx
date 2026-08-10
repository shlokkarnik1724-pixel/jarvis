"use client";

import { useEffect, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { FLAG_TYPES } from "@/lib/party/systems";
import { partyGet, partyPost } from "@/lib/party/client";
import { toast } from "@/lib/store/toast-store";
import type { CircleMemberView } from "@/lib/types";

type Flag = {
  id: string;
  targetName: string;
  flaggerName: string;
  flagType: string;
  ts: string;
};

export function FlagsClient() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [members, setMembers] = useState<CircleMemberView[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await partyGet<{ flags: Flag[]; members: CircleMemberView[] }>("flags");
      setFlags(data.flags);
      setMembers(data.members);
    });
  }, []);

  function flag(target: CircleMemberView, flagType: string) {
    startTransition(async () => {
      try {
        const data = await partyPost<{ flags: Flag[] }>({
          feature: "flags",
          action: "add",
          targetId: target.userId,
          targetName: target.nickname || target.name,
          flagType,
        });
        setFlags(data.flags);
        toast("Flagged", { description: flagType, tone: "info" });
      } catch (error) {
        toast("Flag blocked", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <IslandCard emoji="🚩" title="Flag Someone" accent="rgba(196,92,74,0.4)">
        <p className="text-sm text-[var(--ink-muted)]">
          Funny flags only. Rate-limited so it stays a roast, not a weapon.
        </p>
      </IslandCard>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.userId}
            className="rounded-2xl border border-white/40 bg-white/70 p-4"
          >
            <p className="font-medium">{member.nickname || member.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FLAG_TYPES.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => flag(member, type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="font-island text-lg font-bold">Tonight&apos;s tally</h2>
        {flags.map((item) => (
          <p key={item.id} className="text-sm text-[var(--ink-muted)]">
            {item.flagType} → <span className="font-medium text-[var(--ink)]">{item.targetName}</span>{" "}
            (by {item.flaggerName})
          </p>
        ))}
      </section>
    </div>
  );
}
