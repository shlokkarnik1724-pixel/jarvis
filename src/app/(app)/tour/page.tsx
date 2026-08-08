"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import {
  ArrowRight,
  Brain,
  Cable,
  CheckCircle2,
  FileCode2,
  Network,
  Radio,
} from "lucide-react";

const STEPS = [
  {
    id: "blocker",
    eyebrow: "The real blocker",
    title: "Models got good. Domain knowledge didn’t.",
    body: "Every business has critical know-how scattered everywhere — people’s heads, old email threads, Slack, support tickets, databases. Companies only work because humans vaguely remember where that knowledge is.",
    proof: "AI agents can’t operate on vague memory.",
    href: "/ingestion",
    cta: "See passive ingestion",
    icon: Radio,
  },
  {
    id: "pull",
    eyebrow: "Step 1 — Pull",
    title: "Ingest fragmented company knowledge",
    body: "Listeners mine Slack, Teams, Zendesk, Gmail, Gong, Zoho, Sheets, and Zoom transcripts. Decisions surface without forcing teams to write docs.",
    proof: "Demo Acme already has connected sources and a live ingestion stream.",
    href: "/connectors",
    cta: "Open connectors",
    icon: Cable,
  },
  {
    id: "structure",
    eyebrow: "Step 2 — Structure",
    title: "Turn conversations into executable skills",
    body: "Extraction produces IF/THEN skills plus human SOP steps, with provenance back to the source thread. Humans approve before anything becomes agent policy.",
    proof: "Pending VIP escalation + SEV-2 cutover skills are waiting for review.",
    href: "/skills?status=pending",
    cta: "Review pending skills",
    icon: FileCode2,
  },
  {
    id: "map",
    eyebrow: "Step 3 — Keep current",
    title: "A living map of how the company works",
    body: "Refunds, pricing exceptions, escalations, incident response — one operating map. Bi-temporal memory supersedes old rules when policy changes, so agents don’t hallucinate parallel truths.",
    proof: "Legacy 10% discount was auto-superseded by today’s 15% Enterprise rule.",
    href: "/map",
    cta: "Open operating map",
    icon: Network,
  },
  {
    id: "act",
    eyebrow: "Step 4 — Execute",
    title: "Skills files agents can actually run",
    body: "Export LangChain, CrewAI, AutoGen, or webhook packs. Ask the company brain a question — answers cite approved skills, not random docs.",
    proof: "This is the missing layer between raw company data and reliable AI automation.",
    href: "/simulator",
    cta: "Run sandbox agent",
    icon: Brain,
  },
];

export default function TourPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([0]);

  useEffect(() => {
    setDone((d) => (d.includes(step) ? d : [...d, step]));
  }, [step]);

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Company brain thesis
          </p>
          <h1 className="font-display text-3xl tracking-tight">
            Why every company needs a brain
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
            A 90-second walkthrough of the product idea: pull scattered
            know-how, structure it, keep it current, and ship executable skills
            for AI agents.
          </p>
        </div>
        <Badge tone="accent">
          Step {step + 1} / {STEPS.length}
        </Badge>
      </div>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <ol className="space-y-2">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition border ${
                  i === step
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]/60 text-[var(--accent-deep)]"
                    : "border-transparent text-[var(--ink-muted)] hover:bg-black/[0.03]"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {done.includes(i) && i !== step ? (
                    <CheckCircle2 size={14} className="text-[var(--ok)]" />
                  ) : (
                    <span className="text-[10px] tracking-widest">0{i + 1}</span>
                  )}
                  {s.eyebrow.replace(/^Step \d+ — /, "")}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="rounded-md border border-[var(--line)] bg-white p-6 md:p-8 tour-panel">
          <div className="flex items-center gap-3 text-[var(--accent)]">
            <Icon size={22} />
            <p className="text-xs uppercase tracking-[0.2em]">{current.eyebrow}</p>
          </div>
          <h2 className="mt-4 font-display text-2xl md:text-3xl tracking-tight max-w-2xl">
            {current.title}
          </h2>
          <p className="mt-4 text-[var(--ink-muted)] leading-relaxed max-w-2xl">
            {current.body}
          </p>
          <div className="mt-6 rounded-md border border-[var(--accent)]/20 bg-[var(--accent-soft)]/40 px-4 py-3 text-sm">
            <p className="font-medium text-[var(--accent-deep)]">In this demo</p>
            <p className="mt-1 text-[var(--ink)]">{current.proof}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                if (step < STEPS.length - 1) setStep(step + 1);
                else router.push("/map");
              }}
            >
              {step < STEPS.length - 1 ? "Next" : "Open operating map"}{" "}
              <ArrowRight size={14} />
            </Button>
            <Link href={current.href}>
              <Button variant="outline">{current.cta}</Button>
            </Link>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
