"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { playSound } from "@/lib/sound/sfx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CircleNotice = {
  id: string;
  title: string;
  body: string;
  ts: number;
};

const KEY = "circle-notices";
const PERM_ASKED = "circle-notif-asked";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function readNotices(): CircleNotice[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CircleNotice[];
  } catch {
    return [];
  }
}

function writeNotices(rows: CircleNotice[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(rows.slice(0, 20)));
  } catch {
    // ignore
  }
  emit();
}

export function pushCircleNotice(input: { title: string; body: string }) {
  const notice: CircleNotice = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: input.title,
    body: input.body,
    ts: Date.now(),
  };
  writeNotices([notice, ...readNotices()]);
  window.dispatchEvent(new CustomEvent("circle-notice", { detail: notice }));

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(input.title, {
        body: input.body,
        icon: "/favicon.ico",
        tag: notice.id,
      });
    } catch {
      // ignore
    }
  }
  playSound("ping");
  return notice;
}

function readPerm(): NotificationPermission | "unsupported" {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const rows = useSyncExternalStore(subscribe, readNotices, () => []);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(() =>
    typeof window === "undefined" ? "default" : readPerm()
  );

  useEffect(() => {
    try {
      if (typeof Notification === "undefined") return;
      if (sessionStorage.getItem(PERM_ASKED)) return;
      sessionStorage.setItem(PERM_ASKED, "1");
      if (Notification.permission === "default") {
        void Notification.requestPermission().then((p) => {
          setPerm(p);
          if (p === "granted") {
            pushCircleNotice({
              title: "Circle alerts on",
              body: "You’ll get pings when someone assigns you or drops in chat.",
            });
          }
        });
      }
    } catch {
      // ignore
    }

    const timer = window.setTimeout(() => {
      if (readNotices().length > 0) return;
      pushCircleNotice({
        title: "Meet pinged you",
        body: "yo who’s bringing the aux + sutta pack",
      });
      window.setTimeout(() => {
        pushCircleNotice({
          title: "Role assigned",
          body: "Kedar set you as ice + mixer for Friday Night Chaos",
        });
      }, 1800);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          playSound("tap");
          setOpen((v) => !v);
        }}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white",
          rows.length > 0 && "ring-2 ring-amber-300/50"
        )}
      >
        🔔
        {rows.length > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-black">
            {Math.min(9, rows.length)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-[80] w-[min(92vw,20rem)] rounded-2xl border border-white/25 bg-[#101816] p-3 text-white shadow-2xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">Pings</p>
            {perm === "default" ? (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => {
                  void Notification.requestPermission().then((p) => setPerm(p));
                }}
              >
                Enable
              </Button>
            ) : (
              <span className="text-[10px] uppercase tracking-wide text-white/70">
                {perm === "granted" ? "live" : perm}
              </span>
            )}
          </div>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {rows.length === 0 ? (
              <li className="text-sm text-white/70">No pings yet.</li>
            ) : (
              rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-white">{row.title}</p>
                  <p className="mt-0.5 text-xs text-white/80">{row.body}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
