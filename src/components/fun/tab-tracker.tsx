"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { toast } from "@/lib/store/toast-store";
import { settleDebts } from "@/lib/utils/settlements";
import { formatCurrency } from "@/lib/utils";
import type { TabEntryView } from "@/lib/types";

export function TabTracker({ initialTabs }: { initialTabs: TabEntryView[] }) {
  const [tabs, setTabs] = useState(initialTabs);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
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
        toast("Expense added", { tone: "success" });
        return;
      }
      toast("Couldn’t add expense", { tone: "error" });
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl">Tab Tracker</h1>
          <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
            Log shared expenses and settle with the fewest peer-to-peer transfers.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="glass-panel grid gap-4 rounded-2xl border border-[var(--line)] p-5 md:grid-cols-3">
          <div className="group">
            <Label
              htmlFor="amount"
              className="transition-colors group-focus-within:text-[var(--accent-deep)]"
            >
              Amount
            </Label>
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
            <Label
              htmlFor="description"
              className="transition-colors group-focus-within:text-[var(--accent-deep)]"
            >
              Description
            </Label>
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
              <div className="interactive-glow flex flex-wrap items-center justify-between gap-3 rounded-xl border border-transparent border-b-[var(--line)] py-3 hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]/70 hover:px-3">
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
