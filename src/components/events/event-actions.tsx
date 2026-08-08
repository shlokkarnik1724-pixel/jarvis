"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ShoppingItemView } from "@/lib/types";

interface EventActionsProps {
  eventId: string;
  initiallyCheckedIn: boolean;
  checkinCount: number;
  shopping: ShoppingItemView[];
}

export function EventActions({
  eventId,
  initiallyCheckedIn,
  checkinCount,
  shopping,
}: EventActionsProps) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(initiallyCheckedIn);
  const [count, setCount] = useState(checkinCount);
  const [items, setItems] = useState(shopping);
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
        data?: { checkedInByMe: boolean; checkinCount: number };
      };
      if (json.success && json.data) {
        setCheckedIn(json.data.checkedInByMe);
        setCount(json.data.checkinCount);
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
