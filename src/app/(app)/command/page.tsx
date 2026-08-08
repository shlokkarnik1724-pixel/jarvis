"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  Radio,
  Rocket,
  Shield,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import type { OpsRequest } from "@/lib/types";
import type { BrainPulse } from "@/lib/ops-engine";

type Pulse = BrainPulse;

const SOURCE_COLOR: Record<string, string> = {
  slack: "#36c5f0",
  google_sheets: "#34a853",
  freshdesk: "#2fcb71",
  looker: "#f4b400",
  whatsapp: "#25d366",
  email: "#9ecbff",
  zoom: "#2d8cff",
};

export default function CommandCenterPage() {
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [selected, setSelected] = useState<OpsRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [boot, setBoot] = useState(true);
  const [tick, setTick] = useState(0);
  const [paste, setPaste] = useState("");
  const [source, setSource] = useState("whatsapp");
  const [error, setError] = useState("");
  const [ring, setRing] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/ops/pulse");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Brain offline");
      return;
    }
    setPulse(data);
    setError("");
    setSelected((prev) => {
      if (!prev) return data.requests?.[0] || null;
      return data.requests?.find((r: OpsRequest) => r.id === prev.id) || prev;
    });
  }, []);

  useEffect(() => {
    load().finally(() => setTimeout(() => setBoot(false), 900));
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setRing((x) => x + 1);
    }, 1800);
    return () => clearInterval(t);
  }, [load]);

  async function neuralTick() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/ops/pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "tick" }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Pulse failed");
      return;
    }
    await load();
    setSelected(data.request);
  }

  async function ingestPaste(e: FormEvent) {
    e.preventDefault();
    if (!paste.trim()) return;
    setBusy(true);
    const res = await fetch("/api/ops/pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ingest",
        source,
        channel: `${source} · live feed`,
        rawText: paste.trim(),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Ingest failed");
      return;
    }
    setPaste("");
    await load();
    setSelected(data.request);
  }

  async function act(
    action:
      | "apply_corrections"
      | "approve"
      | "execute"
      | "ship"
      | "resolve"
      | "reject"
  ) {
    if (!selected) return;
    setBusy(true);
    const res = await fetch("/api/ops/act", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: selected.id, action }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Action failed");
      return;
    }
    await load();
    setSelected(data.request);
  }

  if (boot) {
    return (
      <div className="jarvis-boot">
        <div className="jarvis-boot-ring" />
        <div className="jarvis-boot-ring delay" />
        <p className="font-display text-2xl tracking-[0.35em] text-[var(--hud-cyan)]">
          TACTIX
        </p>
        <p className="mt-3 text-xs tracking-[0.4em] text-[var(--hud-amber)] uppercase">
          Initializing company brain
        </p>
        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 bg-[var(--hud-cyan)] processing-bar" />
        </div>
      </div>
    );
  }

  return (
    <div className="jarvis-stage -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-4 md:px-8 py-6 min-h-[calc(100vh-0px)]">
      <div className="scanlines pointer-events-none" />

      <header className="relative z-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase text-[var(--hud-amber)]">
            Company brain · live
          </p>
          <h1 className="font-display text-3xl md:text-5xl tracking-tight text-white">
            Command <span className="text-[var(--hud-cyan)]">Center</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/65">
            Pull Slack, Google Sheets, Freshdesk, Looker, WhatsApp — detect
            requests, correct them, route shipments. One brain for the whole
            business.
          </p>
        </div>
        <button
          type="button"
          onClick={neuralTick}
          disabled={busy}
          className="hud-btn"
        >
          <Zap size={16} />
          {busy ? "Syncing…" : "Neural pull"}
        </button>
      </header>

      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Neural load",
            value: `${pulse?.neuralLoad ?? 0}%`,
            icon: Cpu,
          },
          {
            label: "Sources online",
            value: pulse?.sourcesOnline ?? 0,
            icon: Radio,
          },
          {
            label: "Open requests",
            value: pulse?.openRequests ?? 0,
            icon: Activity,
          },
          {
            label: "Shipments in flight",
            value: pulse?.shipmentsInFlight ?? 0,
            icon: Rocket,
          },
        ].map((m) => (
          <div key={m.label} className="hud-panel metric-pulse">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.25em] uppercase text-white/50">
                {m.label}
              </p>
              <m.icon size={14} className="text-[var(--hud-cyan)]" />
            </div>
            <p className="mt-3 font-display text-3xl text-white">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-8 grid gap-6 xl:grid-cols-[280px_1fr_340px]">
        {/* Sources orbit */}
        <aside className="hud-panel">
          <div className="flex items-center gap-2 text-[var(--hud-cyan)]">
            <Waves size={16} />
            <p className="text-xs tracking-[0.3em] uppercase">Neural sources</p>
          </div>
          <div className="relative mx-auto mt-6 h-52 w-52">
            <div
              className="absolute inset-0 rounded-full border border-[var(--hud-cyan)]/30"
              style={{ transform: `rotate(${ring * 8}deg)` }}
            />
            <div className="absolute inset-4 rounded-full border border-[var(--hud-amber)]/25 animate-spin-slow" />
            <div className="absolute inset-10 rounded-full border border-white/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-[var(--hud-cyan)]/15 border border-[var(--hud-cyan)]/50 flex items-center justify-center shadow-[0_0_40px_rgba(56,232,255,0.35)]">
                <Shield className="text-[var(--hud-cyan)]" size={22} />
              </div>
            </div>
            {(pulse?.sources || []).map((s, i) => {
              const angle = (i / Math.max(1, pulse!.sources.length)) * Math.PI * 2;
              const x = 50 + Math.cos(angle + tick * 0.15) * 42;
              const y = 50 + Math.sin(angle + tick * 0.15) * 42;
              return (
                <div
                  key={s.source}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className="rounded-full px-2 py-1 text-[9px] tracking-wide uppercase text-black font-semibold whitespace-nowrap"
                    style={{ background: SOURCE_COLOR[s.source] || "#38e8ff" }}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
          <ul className="mt-4 space-y-2">
            {(pulse?.sources || []).map((s) => (
              <li
                key={s.source}
                className="flex items-center justify-between text-xs text-white/70"
              >
                <span>{s.label}</span>
                <span className="text-[var(--hud-cyan)]">
                  {s.eventsPerMin}/min · {s.status}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Request stream */}
        <section className="hud-panel min-h-[520px] flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[var(--hud-amber)]">
              <Sparkles size={16} />
              <p className="text-xs tracking-[0.3em] uppercase">
                Live request stream
              </p>
            </div>
            <span className="text-[10px] text-white/40">
              AI detect → correct → execute
            </span>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-1">
            {(pulse?.requests || []).map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left rounded-md border px-3 py-3 transition ${
                  selected?.id === r.id
                    ? "border-[var(--hud-cyan)] bg-[var(--hud-cyan)]/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-black font-semibold"
                    style={{ background: SOURCE_COLOR[r.source] || "#38e8ff" }}
                  >
                    {r.source.replace("_", " ")}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">
                    {r.category}
                  </span>
                  <span
                    className={`ml-auto text-[10px] uppercase tracking-wider ${
                      r.status === "needs_correction"
                        ? "text-[var(--hud-amber)]"
                        : "text-[var(--hud-cyan)]"
                    }`}
                  >
                    {r.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white">{r.title}</p>
                <p className="mt-1 text-xs text-white/50 line-clamp-2">
                  {r.detectedIntent} · {r.suggestedAction}
                </p>
              </button>
            ))}
            {!pulse?.requests?.length && (
              <p className="text-sm text-white/50">
                No requests yet. Hit Neural pull or paste a live message.
              </p>
            )}
          </div>

          <form onSubmit={ingestPaste} className="mt-4 border-t border-white/10 pt-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/45 mb-2">
              Feed the brain
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {["whatsapp", "slack", "google_sheets", "freshdesk", "looker"].map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`rounded px-2 py-1 text-[10px] uppercase tracking-wide ${
                      source === s
                        ? "bg-[var(--hud-cyan)] text-black"
                        : "bg-white/5 text-white/60"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                )
              )}
            </div>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="Paste a Slack thread, Sheet row, Freshdesk ticket, WhatsApp chat, or Looker alert…"
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 min-h-20 outline-none focus:border-[var(--hud-cyan)]"
            />
            <button type="submit" disabled={busy} className="hud-btn mt-2 w-full">
              <Sparkles size={14} /> Extract · correct · queue
            </button>
          </form>
        </section>

        {/* Detail / act */}
        <aside className="hud-panel">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--hud-amber)]">
                  Active request
                </p>
                <h2 className="mt-1 font-display text-xl text-white">
                  {selected.title}
                </h2>
                <p className="mt-1 text-xs text-white/50">{selected.channel}</p>
              </div>

              <div className="rounded-md border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Raw intake
                </p>
                <p className="mt-2 text-xs text-white/80 whitespace-pre-wrap">
                  {selected.rawText}
                </p>
              </div>

              {selected.corrections.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--hud-amber)]">
                    AI corrections
                  </p>
                  <ul className="mt-2 space-y-2">
                    {selected.corrections.map((c, i) => (
                      <li
                        key={i}
                        className="rounded-md border border-[var(--hud-amber)]/30 bg-[var(--hud-amber)]/10 px-3 py-2 text-xs"
                      >
                        <p className="text-[var(--hud-amber)] font-medium">
                          {c.field}: {c.from} → {c.to}
                        </p>
                        <p className="mt-1 text-white/60">{c.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.correctedPayload && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--hud-cyan)]">
                    Corrected payload
                  </p>
                  <pre className="mt-2 overflow-auto rounded-md border border-white/10 bg-black/40 p-3 text-[11px] text-[var(--hud-cyan)]">
                    {JSON.stringify(selected.correctedPayload, null, 2)}
                  </pre>
                </div>
              )}

              {selected.shipment && (
                <div className="rounded-md border border-[var(--hud-cyan)]/30 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--hud-cyan)]">
                    Shipment lane
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {selected.shipment.id} · {selected.shipment.stage}
                  </p>
                  <p className="text-xs text-white/55 mt-1">
                    {selected.shipment.trackingNote}
                    {selected.shipment.eta ? ` · ETA ${selected.shipment.eta}` : ""}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Suggested action
                </p>
                <p className="mt-1 text-sm text-white">{selected.suggestedAction}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === "needs_correction" && (
                  <button
                    type="button"
                    className="hud-btn"
                    disabled={busy}
                    onClick={() => act("apply_corrections")}
                  >
                    Apply corrections
                  </button>
                )}
                {["detected", "corrected", "approved"].includes(
                  selected.status
                ) && (
                  <button
                    type="button"
                    className="hud-btn"
                    disabled={busy}
                    onClick={() =>
                      act(
                        selected.status === "approved" ? "execute" : "approve"
                      )
                    }
                  >
                    {selected.status === "approved" ? "Execute" : "Approve"}
                  </button>
                )}
                {selected.status === "executing" && selected.shipment && (
                  <button
                    type="button"
                    className="hud-btn"
                    disabled={busy}
                    onClick={() => act("ship")}
                  >
                    Mark shipped
                  </button>
                )}
                <button
                  type="button"
                  className="hud-btn ghost"
                  disabled={busy}
                  onClick={() => act("resolve")}
                >
                  Resolve
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/50">Select a request to pilot.</p>
          )}
          {error && (
            <p className="mt-4 text-xs text-red-300 bg-red-500/10 border border-red-400/30 rounded px-3 py-2">
              {error}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
