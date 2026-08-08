"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import {
  ArrowRight,
  Download,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type MapSkill = {
  id: string;
  title: string;
  if: string;
  then: string;
  active: boolean;
  status?: string;
};

type Pack = {
  company_brain: {
    name: string;
    skill_count: number;
    generated_at: string;
  };
  operating_map: Record<string, MapSkill[]>;
  skills: {
    id: string;
    title: string;
    category: string;
    filename: string;
    content: string;
    active: boolean;
    executable: { if: string; then: string; provenance: string };
  }[];
};

const DOMAIN_COPY: Record<
  string,
  { headline: string; why: string; accent: string }
> = {
  Discounting: {
    headline: "How pricing exceptions are decided",
    why: "Scattered across Slack sales threads and Sheets policy matrices.",
    accent: "#0f7a6c",
  },
  Refunds: {
    headline: "How refunds get handled",
    why: "Buried in Zendesk tickets, email threads, and CS lead memory.",
    accent: "#0a5c52",
  },
  Escalation: {
    headline: "How VIP issues escalate",
    why: "Lives in Teams channels and on-call tribal knowledge.",
    accent: "#1d4e6e",
  },
  "Incident Response": {
    headline: "How engineers respond to incidents",
    why: "Runbooks half in Zoho, half in someone’s head.",
    accent: "#7a4f0f",
  },
  Other: {
    headline: "Other operating rules",
    why: "Catch-all for decisions that don’t fit a known lane.",
    accent: "#5a6b76",
  },
};

export default function OperatingMapPage() {
  const [pack, setPack] = useState<Pack | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    fetch("/api/brain/pack")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setPack(d);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!pack) return;
    const keys = Object.keys(pack.operating_map).filter(
      (k) => (pack.operating_map[k] || []).length > 0
    );
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setReveal(i);
      if (i >= keys.length) clearInterval(t);
    }, 220);
    return () => clearInterval(t);
  }, [pack]);

  async function downloadPack(framework: string) {
    setBusy(true);
    const res = await fetch(`/api/brain/pack?framework=${framework}`);
    const data = await res.json();
    setBusy(false);
    if (data.error) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `company-brain-skills-${framework}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copySkillsPrompt() {
    if (!pack) return;
    const lines = [
      "# Company Brain — Executable Skills",
      `# ${pack.company_brain.name}`,
      "",
      "You are bound to these approved company skills. Apply them safely and cite provenance.",
      "",
    ];
    for (const s of pack.skills.filter((x) => x.active)) {
      lines.push(`## ${s.title}`);
      lines.push(`IF ${s.executable.if}`);
      lines.push(`THEN ${s.executable.then}`);
      lines.push(`Provenance: ${s.executable.provenance}`);
      lines.push("");
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const domains = pack
    ? Object.entries(pack.operating_map).filter(([, v]) => v.length > 0)
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Living company map
          </p>
          <h1 className="font-display text-3xl tracking-tight">
            How this company works
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
            Not a chatbot over docs — a living map of refunds, pricing
            exceptions, escalations, and incident response, kept current and
            turned into executable skills files for AI agents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => downloadPack("json")}
            disabled={busy || !pack}
          >
            <Download size={14} /> Skills pack
          </Button>
          <Button onClick={copySkillsPrompt} disabled={!pack}>
            <Sparkles size={14} /> {copied ? "Copied" : "Copy agent skills"}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Badge tone="accent">
          {pack?.company_brain.skill_count ?? "—"} executable skills
        </Badge>
        <Badge tone="ok">
          <ShieldCheck size={12} className="inline mr-1" />
          provenance linked
        </Badge>
        <Badge>
          <GitBranch size={12} className="inline mr-1" />
          bi-temporal memory
        </Badge>
      </div>

      <div className="mt-10 relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--line)] hidden lg:block pointer-events-none" />
        <div className="grid gap-5 lg:grid-cols-2">
          {domains.map(([domain, skills], idx) => {
            const copy = DOMAIN_COPY[domain] || DOMAIN_COPY.Other;
            const visible = reveal > idx;
            return (
              <div
                key={domain}
                className={`relative rounded-md border border-[var(--line)] bg-white/90 p-5 transition duration-500 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
                style={{ borderTopColor: copy.accent, borderTopWidth: 3 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.18em] uppercase text-[var(--ink-muted)]">
                      {domain}
                    </p>
                    <h2 className="mt-1 font-display text-xl">{copy.headline}</h2>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      {copy.why}
                    </p>
                  </div>
                  <Badge tone={skills.some((s) => s.active) ? "ok" : "warn"}>
                    {skills.filter((s) => s.active).length} active
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {skills.map((s) => (
                    <Link
                      key={s.id}
                      href={`/skills/${s.id}`}
                      className="block rounded-md border border-[var(--line)] bg-[var(--bg)] px-3 py-3 hover:border-[var(--accent)] transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{s.title}</p>
                        <Badge tone={s.active ? "ok" : "neutral"}>
                          {s.active ? "live" : "inactive"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-[var(--ink-muted)]">
                        <span className="text-[var(--accent-deep)]">IF</span>{" "}
                        {s.if}
                      </p>
                      <p className="mt-1 text-xs">
                        <span className="text-[var(--accent-deep)]">THEN</span>{" "}
                        {s.then}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!domains.length && (
        <p className="mt-10 text-sm text-[var(--ink-muted)]">
          No operating rules yet. Extract skills from Slack/tickets, approve
          them, and the map fills in.
        </p>
      )}

      <div className="mt-12 flex flex-wrap gap-3 border-t border-[var(--line)] pt-8">
        <Link href="/tour">
          <Button variant="outline">
            Replay thesis tour <ArrowRight size={14} />
          </Button>
        </Link>
        <Link href="/simulator">
          <Button>
            Prove agents can execute <ArrowRight size={14} />
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={() => downloadPack("langchain")}
          disabled={busy || !pack}
        >
          Export LangChain pack
        </Button>
        <Button
          variant="ghost"
          onClick={() => downloadPack("crewai")}
          disabled={busy || !pack}
        >
          Export CrewAI pack
        </Button>
      </div>
    </div>
  );
}
