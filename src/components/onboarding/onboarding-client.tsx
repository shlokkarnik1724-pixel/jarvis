"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/motion/reveal";
import { toast } from "@/lib/store/toast-store";

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
        const err = json.error ?? "Could not create circle";
        setError(err);
        toast("Create failed", { description: err, tone: "error" });
        return;
      }
      toast("Circle created", { tone: "success" });
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
        const err = json.error ?? "Could not join circle";
        setError(err);
        toast("Join failed", { description: err, tone: "error" });
        return;
      }
      toast("You’re in", { description: "Joined the circle.", tone: "success" });
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--mesh-a),transparent_70%)] blur-2xl animate-drift" />
        <div className="absolute right-0 bottom-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--mesh-b),transparent_70%)] blur-2xl animate-drift-delayed" />
      </div>

      <FadeIn>
        <p className="font-display text-4xl">Welcome to Circle</p>
        <p className="mt-3 text-[var(--ink-muted)]">
          Create a private group for your friends, or join one with an invite code.
        </p>
      </FadeIn>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <FadeIn delay={0.06}>
          <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5 shadow-[0_18px_40px_-32px_rgba(20,32,27,0.4)]">
            <h2 className="text-lg font-medium">Create a circle</h2>
            <div className="group space-y-2">
              <Label
                htmlFor="circleName"
                className="transition-colors group-focus-within:text-[var(--accent-deep)]"
              >
                Circle name
              </Label>
              <Input
                id="circleName"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
              />
            </div>
            <Button disabled={pending || !circleName.trim()} onClick={createCircle}>
              Create & continue
            </Button>
          </section>
        </FadeIn>

        <FadeIn delay={0.12}>
          <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5 shadow-[0_18px_40px_-32px_rgba(20,32,27,0.4)]">
            <h2 className="text-lg font-medium">Join with invite code</h2>
            <div className="group space-y-2">
              <Label
                htmlFor="invite"
                className="transition-colors group-focus-within:text-[var(--accent-deep)]"
              >
                Invite code
              </Label>
              <Input
                id="invite"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. a1b2c3d4e5f6"
              />
            </div>
            <Button
              variant="secondary"
              disabled={pending || !inviteCode.trim()}
              onClick={joinCircle}
            >
              Join circle
            </Button>
          </section>
        </FadeIn>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
