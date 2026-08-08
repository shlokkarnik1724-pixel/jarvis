"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CircleMemberView } from "@/lib/types";

export function MembersManager({
  initialMembers,
}: {
  initialMembers: CircleMemberView[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialMembers.map((m) => [m.userId, m.nickname ?? ""]))
  );
  const [pending, startTransition] = useTransition();

  function save(targetId: string) {
    startTransition(async () => {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          nickname: drafts[targetId] ?? "",
        }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: CircleMemberView;
      };
      if (json.success && json.data) {
        setMembers((prev) =>
          prev.map((member) =>
            member.userId === targetId ? { ...member, ...json.data! } : member
          )
        );
      }
    });
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-medium">Nickname tagging</h2>
      <ul className="space-y-4">
        {members.map((member) => (
          <li
            key={member.userId}
            className="grid gap-3 border-b border-[var(--line)] py-4 md:grid-cols-[1fr_1fr_auto] md:items-center"
          >
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm capitalize text-[var(--ink-muted)]">{member.role}</p>
            </div>
            <Input
              value={drafts[member.userId] ?? ""}
              onChange={(event) =>
                setDrafts((prev) => ({
                  ...prev,
                  [member.userId]: event.target.value,
                }))
              }
              placeholder="Nickname"
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => save(member.userId)}
            >
              Save
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
