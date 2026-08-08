"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Label, Select, Textarea } from "@/components/ui";
import type { SkillSchema } from "@/lib/types";

const SAMPLE = `Alex (AE): Enterprise prospect wants 20% off to close this quarter.
Jordan (Manager): Cap at 15% for Enterprise — no manager sign-off needed under that. Above 15% escalate to me.
Alex: Got it — locking 15% for Acme.`;

function download(filename: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ConvertPage() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Discounting");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skill, setSkill] = useState<SkillSchema | null>(null);
  const [exports, setExports] = useState<{
    yaml: string;
    systemPrompt: string;
  } | null>(null);

  async function convert() {
    setLoading(true);
    setError("");
    setSkill(null);
    const res = await fetch("/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, category }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Conversion failed");
      return;
    }
    setSkill(data.skill);
    setExports({
      yaml: data.exports.yaml,
      systemPrompt: data.exports.systemPrompt,
    });
  }

  return (
    <div className="atmosphere min-h-screen">
      <header className="border-b border-[var(--line)] bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl">
            Tactix <span className="text-[var(--accent)]">AI</span>
          </Link>
          <div className="flex gap-3 text-sm">
            <Link href="/api/demo/launch" className="hidden" />
            <Link href="/" className="text-[var(--ink-muted)]">
              Home
            </Link>
            <Link href="/signup" className="text-[var(--accent)] font-medium">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Badge tone="accent">Free utility · no account</Badge>
        <h1 className="mt-4 font-display text-4xl tracking-tight max-w-2xl">
          Slack-to-Skill Converter
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-2xl">
          Paste one support or sales thread. Get a downloadable Skill JSON,
          YAML, or agent system prompt in seconds — the same engine behind
          Tactix.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select
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
              <div className="flex justify-between mb-1.5">
                <Label className="mb-0">Conversation</Label>
                <button
                  type="button"
                  className="text-xs text-[var(--accent)]"
                  onClick={() => setText(SAMPLE)}
                >
                  Load sample
                </button>
              </div>
              <Textarea
                className="min-h-64 font-mono text-xs"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a Slack / Zendesk / email thread…"
              />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <Button onClick={convert} disabled={loading || text.length < 20}>
              {loading ? "Extracting…" : "Convert to Skill"}
            </Button>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-white p-5 min-h-80">
            {!skill ? (
              <p className="text-sm text-[var(--ink-muted)]">
                Your structured skill will appear here with download options.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="ok">
                    {Math.round(skill.confidence * 100)}% confidence
                  </Badge>
                  <Badge>{skill.category}</Badge>
                </div>
                <h2 className="font-display text-2xl">{skill.title}</h2>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-[var(--ink-muted)]">IF</span>{" "}
                    {skill.condition}
                  </p>
                  <p>
                    <span className="text-[var(--ink-muted)]">THEN</span>{" "}
                    {skill.action}
                  </p>
                  <p className="text-[var(--ink-muted)] italic">
                    “{skill.source_excerpt}”
                  </p>
                </div>
                {skill.flagged_fields.length > 0 && (
                  <div className="rounded bg-[var(--warn-soft)] px-3 py-2 text-sm text-[var(--warn)]">
                    {skill.flagged_fields.map((f) => (
                      <p key={f}>⚠️ {f}</p>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      download(
                        "tactix-skill.json",
                        JSON.stringify(skill, null, 2)
                      )
                    }
                  >
                    Download JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      download(
                        "tactix-skill.yaml",
                        exports?.yaml || "",
                        "text/yaml"
                      )
                    }
                  >
                    Download YAML
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      download(
                        "tactix-system-prompt.txt",
                        exports?.systemPrompt || "",
                        "text/plain"
                      )
                    }
                  >
                    Download system prompt
                  </Button>
                </div>
                <p className="text-xs text-[var(--ink-muted)] pt-2">
                  Want governance, versioning, and the agent simulator?{" "}
                  <Link href="/signup" className="text-[var(--accent)]">
                    Create a free workspace
                  </Link>{" "}
                  or{" "}
                  <button
                    type="button"
                    className="text-[var(--accent)]"
                    onClick={() => {
                      window.location.assign("/api/demo/launch");
                    }}
                  >
                    launch the live demo
                  </button>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
