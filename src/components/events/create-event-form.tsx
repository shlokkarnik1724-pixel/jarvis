"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { playSound } from "@/lib/sound/sfx";
import { toast } from "@/lib/store/toast-store";

export function CreateEventForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!enabled) return null;

  function submit() {
    startTransition(async () => {
      setError(null);
      playSound("hereWeGoAgain");
      const response = await fetch("/api/events/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title,
          date: new Date(date).toISOString(),
          location,
        }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: { id: string };
        error?: string;
      };
      if (!json.success || !json.data) {
        const err = json.error ?? "Failed to create event";
        setError(err);
        playSound("wrong");
        toast("Event not created", { description: err, tone: "error" });
        return;
      }
      playSound("success");
      toast("Event created", { tone: "success" });
      router.push(`/events/${json.data.id}`);
      router.refresh();
    });
  }

  return (
    <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5">
      <h2 className="text-lg font-medium">Create event</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="group">
          <Label
            htmlFor="title"
            className="transition-colors group-focus-within:text-[var(--accent-deep)]"
          >
            Title
          </Label>
          <Input
            id="title"
            className="mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="group">
          <Label
            htmlFor="date"
            className="transition-colors group-focus-within:text-[var(--accent-deep)]"
          >
            Date & time
          </Label>
          <Input
            id="date"
            className="mt-1"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="group">
          <Label
            htmlFor="location"
            className="transition-colors group-focus-within:text-[var(--accent-deep)]"
          >
            Location
          </Label>
          <Input
            id="location"
            className="mt-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
      <Button disabled={pending || !title || !date} onClick={submit}>
        Create event
      </Button>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </section>
  );
}
