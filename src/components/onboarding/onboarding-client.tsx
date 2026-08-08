"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingClient({ userName }: { userName: string }) {
  const router = useRouter();
  const [circleName, setCircleName] = useState(`${userName}'s Circle`);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function createCircle() {
    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: circleName }),
      });
      const json = (await response.json()) as { success: boolean; error?: string };
      if (!json.success) {
        setError(json.error ?? "Could not create circle");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  function joinCircle() {
    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", inviteCode }),
      });
      const json = (await response.json()) as { success: boolean; error?: string };
      if (!json.success) {
        setError(json.error ?? "Could not join circle");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="font-display text-4xl">Welcome to Circle</p>
      <p className="mt-3 text-[var(--ink-muted)]">
        Create a private group for your friends, or join one with an invite code.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="space-y-3 border-t border-[var(--line)] pt-6">
          <h2 className="text-lg font-medium">Create a circle</h2>
          <Label htmlFor="circleName">Circle name</Label>
          <Input
            id="circleName"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
          />
          <Button disabled={pending || !circleName.trim()} onClick={createCircle}>
            Create & continue
          </Button>
        </section>

        <section className="space-y-3 border-t border-[var(--line)] pt-6">
          <h2 className="text-lg font-medium">Join with invite code</h2>
          <Label htmlFor="invite">Invite code</Label>
          <Input
            id="invite"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="e.g. a1b2c3d4e5f6"
          />
          <Button
            variant="secondary"
            disabled={pending || !inviteCode.trim()}
            onClick={joinCircle}
          >
            Join circle
          </Button>
        </section>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
