"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CircleMemberView,
  EventRsvpStatus,
  EventRsvpView,
  ShoppingItemView,
} from "@/lib/types";
import { playSound } from "@/lib/sound/sfx";

interface EventActionsProps {
  eventId: string;
  initiallyCheckedIn: boolean;
  checkinCount: number;
  shopping: ShoppingItemView[];
  canAddItems?: boolean;
  hostId: string | null;
  hostName: string | null;
  rsvps: EventRsvpView[];
  myRsvp: EventRsvpStatus | null;
  members: CircleMemberView[];
}

export function EventActions({
  eventId,
  initiallyCheckedIn,
  checkinCount,
  shopping,
  canAddItems = false,
  hostId,
  hostName,
  rsvps: initialRsvps,
  myRsvp: initialMyRsvp,
  members,
}: EventActionsProps) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(initiallyCheckedIn);
  const [count, setCount] = useState(checkinCount);
  const [items, setItems] = useState(shopping);
  const [newItem, setNewItem] = useState("");
  const [host, setHost] = useState({ id: hostId, name: hostName });
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [myRsvp, setMyRsvp] = useState<EventRsvpStatus | null>(initialMyRsvp);
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

  function vote(status: EventRsvpStatus) {
    startTransition(async () => {
      playSound("vote");
      const response = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rsvp", status }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: {
          myRsvp?: EventRsvpStatus | null;
          rsvps?: EventRsvpView[];
        };
      };
      if (json.success && json.data) {
        setMyRsvp(json.data.myRsvp ?? status);
        if (json.data.rsvps) setRsvps(json.data.rsvps);
        router.refresh();
      }
    });
  }

  function assignHost(nextHostId: string) {
    startTransition(async () => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_host", hostId: nextHostId }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: { hostId?: string | null; hostName?: string | null };
      };
      if (json.success && json.data) {
        setHost({
          id: json.data.hostId ?? nextHostId,
          name: json.data.hostName ?? null,
        });
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
      playSound("hereWeGoAgain");
      const response = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_item", itemName: newItem }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: ShoppingItemView;
      };
      if (json.success && json.data) {
        setItems((prev) => [...prev, json.data!]);
        setNewItem("");
        router.refresh();
      }
    });
  }

  const yes = rsvps.filter((r) => r.status === "yes").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;
  const no = rsvps.filter((r) => r.status === "no").length;

  return (
    <div className="space-y-8">
      <section className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
        <h2 className="font-island text-xl font-bold">🗳️ Coming or not?</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Vote for the next hang. {yes} in · {maybe} maybe · {no} out
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["yes", "I'm in"],
              ["maybe", "Maybe"],
              ["no", "Can't make it"],
            ] as const
          ).map(([status, label]) => (
            <Button
              key={status}
              size="sm"
              variant={myRsvp === status ? "default" : "secondary"}
              disabled={pending}
              onClick={() => vote(status)}
            >
              {label}
            </Button>
          ))}
        </div>
        <ul className="mt-4 space-y-1 text-sm">
          {rsvps.map((r) => (
            <li key={r.userId} className="flex justify-between gap-3">
              <span>{r.name}</span>
              <span className="font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
        <h2 className="font-island text-xl font-bold">🏠 Who&apos;s hosting?</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Current host: <strong>{host.name ?? "Unassigned"}</strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {members.map((m) => (
            <Button
              key={m.userId}
              size="sm"
              variant={host.id === m.userId ? "default" : "secondary"}
              disabled={pending}
              onClick={() => assignHost(m.userId)}
            >
              {m.name.split(" ")[0]}
            </Button>
          ))}
        </div>
      </section>

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
        <h2 className="mb-2 text-lg font-medium">Who brings what</h2>
        <p className="mb-4 text-sm text-[var(--ink-muted)]">
          Host assigns the vibes — claim what you&apos;re covering so it&apos;s accounted for.
        </p>
        {canAddItems ? (
          <div className="mb-4 flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add something to bring…"
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
