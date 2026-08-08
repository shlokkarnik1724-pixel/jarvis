"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge, Button, Input, Label } from "@/components/ui";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Org = {
  id: string;
  name: string;
  industry: string;
  inviteCode: string;
};

export default function SettingsPage() {
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [sources, setSources] = useState<
    { id: string; name: string; status: string }[]
  >([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setOrg(d.organization);
        setMembers(d.members || []);
        setSources(d.dataSources || []);
        setName(d.organization?.name || "");
        setIndustry(d.organization?.industry || "");
      })
      .catch(() => undefined);
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/orgs/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, industry }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function generateKey() {
    const key = `tx_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    setApiKey(key);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl tracking-tight">
          Team & Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Workspace profile, invites, sources, and export keys.
        </p>
      </div>

      <section className="rounded-md border border-[var(--line)] bg-white p-6">
        <h2 className="font-display text-xl">Company profile</h2>
        <form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Company name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Industry</Label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Save profile</Button>
            {saved && (
              <span className="ml-3 text-sm text-[var(--ok)]">Saved</span>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-md border border-[var(--line)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl">Team members</h2>
          <div className="text-sm">
            Invite code:{" "}
            <code className="rounded bg-[var(--bg)] px-2 py-1 font-mono text-[var(--accent-deep)]">
              {org?.inviteCode || "—"}
            </code>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[var(--ink-muted)]">
              <tr>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-[var(--line)]">
                  <td className="py-3">{m.name}</td>
                  <td className="py-3">{m.email}</td>
                  <td className="py-3">
                    <Badge tone={m.role === "admin" ? "accent" : "neutral"}>
                      {m.role}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          Share the invite code on the onboarding “Join workspace” path.
        </p>
      </section>

      <section className="rounded-md border border-[var(--line)] bg-white p-6">
        <h2 className="font-display text-xl">Data sources</h2>
        <ul className="mt-4 space-y-2">
          {sources.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between border-b border-[var(--line)] py-2 text-sm"
            >
              <span>{s.name}</span>
              <Badge tone={s.status === "connected" ? "ok" : "neutral"}>
                {s.status === "coming_soon" ? "Coming soon" : s.status}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-[var(--line)] bg-white p-6">
        <h2 className="font-display text-xl">API keys</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Stub for exporting approved skills to LangChain / CrewAI.
        </p>
        <Button className="mt-4" variant="outline" onClick={generateKey}>
          Generate API Key
        </Button>
        {apiKey && (
          <code className="mt-3 block rounded bg-[var(--bg)] px-3 py-2 text-sm font-mono break-all">
            {apiKey}
          </code>
        )}
      </section>
    </div>
  );
}
