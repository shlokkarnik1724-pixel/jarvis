"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Select } from "@/components/ui";

export default function OnboardingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createOrg(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/orgs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        industry: fd.get("industry"),
        teamSize: fd.get("teamSize"),
        primaryUseCase: fd.get("primaryUseCase"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create workspace");
      return;
    }
    router.push("/brain");
    router.refresh();
  }

  async function joinOrg(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/orgs/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: fd.get("inviteCode") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not join workspace");
      return;
    }
    router.push("/brain");
    router.refresh();
  }

  return (
    <div className="atmosphere min-h-screen px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-display text-2xl">
          Tactix <span className="text-[var(--accent)]">AI</span>
        </p>
        <h1 className="mt-6 font-display text-4xl tracking-tight">
          Link your company
        </h1>
        <p className="mt-2 text-[var(--ink-muted)] max-w-xl">
          Every skill, conversation, and agent run is scoped to a workspace.
          New workspaces come pre-loaded with example skills so the product is
          immediately demoable.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTab("create")}
            className={`text-left rounded-md border p-5 transition ${
              tab === "create"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] bg-white"
            }`}
          >
            <p className="font-display text-lg">Create a new workspace</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              You become admin. Perfect for design-partner demos.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setTab("join")}
            className={`text-left rounded-md border p-5 transition ${
              tab === "join"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--line)] bg-white"
            }`}
          >
            <p className="font-display text-lg">Join an existing workspace</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Enter an invite code from a teammate.
            </p>
          </button>
        </div>

        <div className="mt-8 rounded-md border border-[var(--line)] bg-white p-6">
          {tab === "create" ? (
            <form onSubmit={createOrg} className="space-y-4">
              <div>
                <Label htmlFor="name">Company name</Label>
                <Input id="name" name="name" required placeholder="Acme Inc" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select id="industry" name="industry" defaultValue="SaaS">
                    <option>SaaS</option>
                    <option>Support</option>
                    <option>Agency</option>
                    <option>Other</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="teamSize">Team size</Label>
                  <Select id="teamSize" name="teamSize" defaultValue="11-50">
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-300</option>
                    <option>300+</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="primaryUseCase">Primary use case</Label>
                <Select
                  id="primaryUseCase"
                  name="primaryUseCase"
                  defaultValue="Support Ops"
                >
                  <option>Support Ops</option>
                  <option>Engineering</option>
                  <option>Sales</option>
                </Select>
              </div>
              {error && (
                <p className="text-sm text-[var(--danger)]">{error}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create workspace"}
              </Button>
            </form>
          ) : (
            <form onSubmit={joinOrg} className="space-y-4">
              <div>
                <Label htmlFor="inviteCode">Invite code</Label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  required
                  placeholder="TX-XXXXXXXX"
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--danger)]">{error}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Joining…" : "Join workspace"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
