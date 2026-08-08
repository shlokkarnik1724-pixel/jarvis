"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShoppingItemView } from "@/lib/types";

interface EventActionsProps {
  eventId: string;
  initiallyCheckedIn: boolean;
  checkinCount: number;
  shopping: ShoppingItemView[];
  canAddItems?: boolean;
}

export function EventActions({
  eventId,
  initiallyCheckedIn,
  checkinCount,
  shopping,
  canAddItems = false,
}: EventActionsProps) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(initiallyCheckedIn);
  const [count, setCount] = useState(checkinCount);
  const [items, setItems] = useState(shopping);
  const [newItem, setNewItem] = useState("");
  const [pending, startTransition] = useTransition();

  function checkIn() {
    startTransition(async () => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin" }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: { checkedInByMe?: boolean; checkinCount?: number };
      };
      if (json.success && json.data) {
        setCheckedIn(Boolean(json.data.checkedInByMe ?? true));
        setCount(json.data.checkinCount ?? count + 1);
        router.refresh();
      }
    });
  }

  function claim(itemId: string) {
    startTransition(async () => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", itemId }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: ShoppingItemView;
      };
      if (json.success && json.data) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? json.data! : item))
        );
        router.refresh();
      }
    });
  }

  function addItem() {
    startTransition(async () => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_item", itemName: newItem }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: {
          id: string;
          event_id?: string;
          eventId?: string;
          item_name?: string;
          itemName?: string;
          quantity?: string | null;
          claimer_id?: string | null;
          claimerId?: string | null;
        };
      };
      if (json.success && json.data) {
        const raw = json.data;
        setItems((prev) => [
          ...prev,
          {
            id: raw.id,
            eventId: raw.eventId ?? raw.event_id ?? eventId,
            itemName: raw.itemName ?? raw.item_name ?? newItem,
            quantity: raw.quantity ?? null,
            claimerId: raw.claimerId ?? raw.claimer_id ?? null,
            claimerName: null,
          },
        ]);
        setNewItem("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="border-y border-[var(--line)] py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Check-in</h2>
            <p className="text-sm text-[var(--ink-muted)]">
              {count} member{count === 1 ? "" : "s"} here
            </p>
          </div>
          <Button onClick={checkIn} disabled={pending || checkedIn}>
            {checkedIn ? "You're checked in" : "Check in now"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Shopping list</h2>
        {canAddItems ? (
          <div className="mb-4 flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an item…"
            />
            <Button
              size="sm"
              disabled={pending || !newItem.trim()}
              onClick={addItem}
            >
              Add
            </Button>
          </div>
        ) : null}
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] py-3"
            >
              <div>
                <p className="font-medium">
                  {item.itemName}
                  {item.quantity ? ` × ${item.quantity}` : ""}
                </p>
                <p className="text-sm text-[var(--ink-muted)]">
                  {item.claimerName ? `Claimed by ${item.claimerName}` : "Open"}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending || Boolean(item.claimerId)}
                onClick={() => claim(item.id)}
              >
                {item.claimerId ? "Claimed" : "I'll bring it"}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
