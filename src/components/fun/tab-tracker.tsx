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
  const nodes = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of settlements) {
      map.set(s.fromUserId, s.fromName);
      map.set(s.toUserId, s.toName);
    }
    return [...map.entries()].map(([id, name], index, arr) => {
      const angle = (Math.PI * 2 * index) / Math.max(arr.length, 1) - Math.PI / 2;
      return {
        id,
        name,
        x: 150 + Math.cos(angle) * 95,
        y: 150 + Math.sin(angle) * 95,
      };
    });
  }, [settlements]);

  if (settlements.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">No webs to weave — all settled.</p>
    );
  }

  return (
    <svg viewBox="0 0 300 300" className="mx-auto h-64 w-full max-w-sm">
      {settlements.map((s) => {
        const from = nodes.find((n) => n.id === s.fromUserId);
        const to = nodes.find((n) => n.id === s.toUserId);
        if (!from || !to) return null;
        return (
          <g key={`${s.fromUserId}-${s.toUserId}-${s.amount}`}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(31,111,84,0.55)"
              strokeWidth={Math.min(6, 1.5 + s.amount / 20)}
            />
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 - 6}
              textAnchor="middle"
              className="fill-[var(--accent-deep)] text-[10px] font-semibold"
            >
              {formatCurrency(s.amount)}
            </text>
          </g>
        );
      })}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={22} fill="rgba(255,255,255,0.85)" stroke="rgba(31,111,84,0.4)" />
          <text
            x={node.x}
            y={node.y + 4}
            textAnchor="middle"
            className="fill-[var(--ink)] text-[10px] font-bold"
          >
            {node.name.slice(0, 6)}
          </text>
        </g>
      ))}
    </svg>
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
            Top G at the top. Certified Broke Menace at the bottom. Debt Web below.
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
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              className="mt-2"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="42.50"
            />
          </div>
          <div className="group md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              className="mt-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Dinner, rideshare, snacks…"
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
        <section className="rounded-[1.5rem] border border-white/40 bg-white/25 p-5 backdrop-blur-xl">
          <h2 className="mb-3 font-island text-lg font-bold">🕸️ Debt Web</h2>
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
