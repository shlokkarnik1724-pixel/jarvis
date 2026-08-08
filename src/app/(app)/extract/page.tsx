"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Badge, Button, Label, Select, Textarea } from "@/components/ui";

const STEPS = [
  "Reading conversation…",
  "Identifying decision point…",
  "Structuring rule…",
  "Checking for conflicts…",
];

const SAMPLES: Record<string, string> = {
  Discounting: `Alex (AE): Enterprise prospect wants 20% off to close this quarter.
Jordan (Manager): Cap at 15% for Enterprise — no manager sign-off needed under that. Above 15% escalate to me. Don't forget expiry on the exception.
Alex: Got it — locking 15% for Acme.`,
  Refunds: `Priya (Support): Customer #4821 wants a full refund 45 days after purchase — window is 30 days, but they're Enterprise and had a 2-day outage.
Marcus (CS Lead): For Enterprise accounts impacted by a P1 outage, approve a full refund even outside the 30-day window. Document exception and CC finance.
Priya: Processing now.`,
  Escalation: `Sam (L1): VIP account NovaCorp says checkout is broken. Escalate?
Riley (On-call): Yes — VIP/Enterprise blocking issues escalate to on-call immediately. First customer update within 15 minutes.`,
  "Incident Response": `DevOps Bot: SEV-2 — payments latency > 3s in us-east.
Casey (SRE): Flip traffic to us-west standby, page payments owner, post status every 10 minutes until green.`,
};

export default function ExtractPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Discounting");
  const [processing, setProcessing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    const content = await file.text();
    setText(content);
  }

  async function extract() {
    setError("");
    setProcessing(true);
    setStepIdx(0);

    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStepIdx(i), 450 * (i + 1))
    );

    try {
      const res = await fetch("/api/extract-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          category,
          sourceRef: "Manual paste · Extract screen",
        }),
      });
      const data = await res.json();
      timers.forEach(clearTimeout);
      if (!res.ok) {
        setProcessing(false);
        setError(data.error || "Extraction failed");
        return;
      }
      setStepIdx(STEPS.length - 1);
      setTimeout(() => router.push(`/skills/${data.skillId}`), 400);
    } catch {
      timers.forEach(clearTimeout);
      setProcessing(false);
      setError("Network error");
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Extract Skill</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Paste or upload a conversation. Watch the rule take shape.
      </p>

      {!processing ? (
        <div className="mt-8 max-w-3xl space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Refunds</option>
              <option>Escalation</option>
              <option>Discounting</option>
              <option>Incident Response</option>
              <option>Other</option>
            </Select>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <Label htmlFor="text" className="mb-0">
                Conversation
              </Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="text-xs text-[var(--accent)]"
                  onClick={() =>
                    setText(SAMPLES[category] || SAMPLES.Discounting)
                  }
                >
                  Load sample
                </button>
                <button
                  type="button"
                  className="text-xs text-[var(--accent)]"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload .txt / .eml
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.eml,.md,text/plain"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <Textarea
              id="text"
              className="min-h-56 font-mono text-xs"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste Slack / email / ticket thread…"
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <Button onClick={extract} disabled={text.length < 20}>
            Extract Skill
          </Button>
        </div>
      ) : (
        <div className="mt-16 max-w-lg">
          <Badge tone="accent">Processing</Badge>
          <h2 className="mt-4 font-display text-2xl">{STEPS[stepIdx]}</h2>
          <div className="mt-8 space-y-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className={`h-full bg-[var(--accent)] processing-bar ${
                      i <= stepIdx ? "w-full" : "w-0"
                    }`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                </div>
                <span
                  className={`text-xs w-40 ${
                    i <= stepIdx
                      ? "text-[var(--ink)]"
                      : "text-[var(--ink-muted)]"
                  }`}
                >
                  {s.replace("…", "")}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 h-10 rounded-md shimmer bg-[var(--accent-soft)]" />
        </div>
      )}
    </div>
  );
}
