"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { IslandCard, ConfettiBurst } from "@/components/islands/island-card";
import { toast } from "@/lib/store/toast-store";
import { settleDebts, computeBalances } from "@/lib/utils/settlements";
import { formatCurrency } from "@/lib/utils";
import { getBrokeTitle } from "@/lib/party/systems";
import type { TabEntryView } from "@/lib/types";

function DebtWeb({
  settlements,
}: {
  settlements: Array<{
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  }>;
}) {
  const size = 640;
  const cx = size / 2;
  const cy = size / 2;

  const nodes = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of settlements) {
      map.set(s.fromUserId, s.fromName);
      map.set(s.toUserId, s.toName);
    }
    const entries = [...map.entries()];
    const radius = Math.min(250, 90 + entries.length * 18);
    return entries.map(([id, name], index, arr) => {
      const angle = (Math.PI * 2 * index) / Math.max(arr.length, 1) - Math.PI / 2;
      return {
        id,
        name,
        short: name.split(" ")[0] ?? name,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
  }, [settlements, cx, cy]);

  if (settlements.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">No webs to weave — all settled.</p>
    );
  }

  const rings = [0.35, 0.62, 0.92];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-auto w-full min-h-[22rem] max-w-3xl md:min-h-[28rem]"
        role="img"
        aria-label="Debt web graph of who owes whom"
      >
        <defs>
          <radialGradient id="debtGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(31,111,84,0.18)" />
            <stop offset="100%" stopColor="rgba(31,111,84,0)" />
          </radialGradient>
          <marker
            id="debtArrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(20,82,64,0.75)" />
          </marker>
        </defs>

        <circle cx={cx} cy={cy} r={280} fill="url(#debtGlow)" />

        {rings.map((scale) => (
          <circle
            key={scale}
            cx={cx}
            cy={cy}
            r={250 * scale}
            fill="none"
            stroke="rgba(31,111,84,0.18)"
            strokeWidth={1.5}
            strokeDasharray={scale === 0.62 ? "6 8" : undefined}
          />
        ))}

        {nodes.map((node, i) => {
          const next = nodes[(i + 1) % nodes.length];
          if (!next) return null;
          return (
            <line
              key={`ring-${node.id}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(31,111,84,0.12)"
              strokeWidth={1}
            />
          );
        })}

        {nodes.map((node) => (
          <line
            key={`spoke-${node.id}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            stroke="rgba(31,111,84,0.1)"
            strokeWidth={1}
          />
        ))}

        {settlements.map((s) => {
          const from = nodes.find((n) => n.id === s.fromUserId);
          const to = nodes.find((n) => n.id === s.toUserId);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.hypot(dx, dy) || 1;
          const ox = (-dy / len) * 18;
          const oy = (dx / len) * 18;
          const qx = mx + ox;
          const qy = my + oy;
          return (
            <g key={`${s.fromUserId}-${s.toUserId}-${s.amount}`}>
              <path
                d={`M ${from.x} ${from.y} Q ${qx} ${qy} ${to.x} ${to.y}`}
                fill="none"
                className="debt-web-line"
                stroke="rgba(31,111,84,0.55)"
                strokeWidth={Math.min(8, 2 + s.amount / 400)}
                markerEnd="url(#debtArrow)"
              />
              <rect
                x={(from.x + to.x) / 2 + ox * 0.55 - 34}
                y={(from.y + to.y) / 2 + oy * 0.55 - 12}
                width={68}
                height={22}
                rx={11}
                fill="rgba(247,250,248,0.95)"
                stroke="rgba(31,111,84,0.35)"
              />
              <text
                x={(from.x + to.x) / 2 + ox * 0.55}
                y={(from.y + to.y) / 2 + oy * 0.55 + 4}
                textAnchor="middle"
                className="fill-[var(--accent-deep)] text-[11px] font-bold"
              >
                {formatCurrency(s.amount)}
              </text>
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r={36} fill="rgba(20,82,64,0.9)" />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-white text-[12px] font-bold"
        >
          DEBT
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-white/85 text-[10px] font-semibold"
        >
          WEB
        </text>

        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={34}
              fill="rgba(255,255,255,0.95)"
              stroke="rgba(31,111,84,0.55)"
              strokeWidth={2.5}
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              className="fill-[var(--ink)] text-[12px] font-bold"
            >
              {node.short.slice(0, 8)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function TabTracker({ initialTabs }: { initialTabs: TabEntryView[] }) {
  const [tabs, setTabs] = useState(initialTabs);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();

  const settlements = useMemo(
    () =>
      settleDebts(
        tabs.map((tab) => ({
          payerId: tab.payerId,
          payerName: tab.payerName,
          amount: tab.amount,
        }))
      ),
    [tabs]
  );

  const brokeBoard = useMemo(
    () =>
      computeBalances(
        tabs.map((tab) => ({
          payerId: tab.payerId,
          payerName: tab.payerName,
          amount: tab.amount,
        }))
      )
        .map((row) => ({
          ...row,
          title: getBrokeTitle(row.net),
        }))
        .sort((a, b) => b.net - a.net),
    [tabs]
  );

  function addTab() {
    startTransition(async () => {
      const response = await fetch("/api/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: TabEntryView;
      };
      if (json.success && json.data) {
        setTabs((prev) => [json.data!, ...prev]);
        setAmount("");
        setDescription("");
        setBurst(true);
        window.setTimeout(() => setBurst(false), 1100);
        toast("Expense added", { tone: "success" });
        return;
      }
      toast("Couldn’t add expense", { tone: "error" });
    });
  }

  return (
    <div className="space-y-8">
      <ConfettiBurst show={burst} />
      <FadeIn>
        <IslandCard emoji="💸" title="Who's Broke" accent="rgba(126, 184, 201, 0.4)">
          <p className="text-sm text-[var(--ink-muted)]">
            Top G at the top. Certified Broke Menace at the bottom. Giant Debt Web below.
          </p>
        </IslandCard>
      </FadeIn>

      <FadeIn delay={0.03}>
        <section className="rounded-[1.5rem] border border-white/40 bg-white/70 p-5">
          <h2 className="mb-3 font-island text-lg font-bold">🥂 Broke vs Top G</h2>
          <ul className="space-y-2">
            {brokeBoard.map((row, index) => (
              <li
                key={row.userId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm"
              >
                <span>
                  {index === 0 ? "👑 " : ""}
                  {row.name} · {row.title}
                </span>
                <span className="font-semibold">{formatCurrency(row.net)}</span>
              </li>
            ))}
          </ul>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="glass-panel grid gap-4 rounded-2xl border border-white/40 p-5 md:grid-cols-3">
          <div className="group">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              className="mt-2"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="420"
            />
          </div>
          <div className="group md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              className="mt-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Dinner, Uber, sutta pack…"
            />
          </div>
          <div className="md:col-span-3">
            <Button onClick={addTab} disabled={pending || !amount || !description}>
              Add expense
            </Button>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="rounded-[1.75rem] border border-white/40 bg-white/40 p-4 backdrop-blur-xl md:p-6">
          <h2 className="mb-1 font-island text-2xl font-bold">🕸️ Debt Web</h2>
          <p className="mb-4 text-sm text-[var(--ink-muted)]">
            Who owes whom — curved threads, big names, real ₹ drama.
          </p>
          <DebtWeb settlements={settlements} />
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section>
          <h2 className="mb-3 text-lg font-medium">Suggested settlements</h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">Balances are already even.</p>
          ) : (
            <Stagger className="space-y-2">
              {settlements.map((transfer) => (
                <StaggerItem
                  key={`${transfer.fromUserId}-${transfer.toUserId}-${transfer.amount}`}
                >
                  <div className="rounded-xl border-b border-[var(--line)] py-3 text-sm transition hover:bg-[var(--accent-soft)]/40 hover:px-3">
                    <span className="font-medium">{transfer.fromName}</span> pays{" "}
                    <span className="font-medium">{transfer.toName}</span>{" "}
                    {formatCurrency(transfer.amount)}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>
      </FadeIn>

      <section>
        <h2 className="mb-3 text-lg font-medium">Ledger</h2>
        <Stagger className="space-y-3">
          {tabs.map((tab) => (
            <StaggerItem key={tab.id}>
              <div className="interactive-glow flex flex-wrap items-center justify-between gap-3 rounded-xl border border-transparent border-b-[var(--line)] py-3 hover:border-[var(--line)] hover:bg-white/40 hover:px-3">
                <div>
                  <p className="font-medium">{tab.description}</p>
                  <p className="text-sm text-[var(--ink-muted)]">Paid by {tab.payerName}</p>
                </div>
                <p className="font-semibold">{formatCurrency(tab.amount)}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
