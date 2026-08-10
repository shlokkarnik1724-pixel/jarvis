"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { playSound } from "@/lib/sound/sfx";

const UNLOCK_KEY = "circle-son-unlock";
const UNLOCK_HOURS = 24;

function readUnlocked(): boolean {
  try {
    const raw = sessionStorage.getItem(UNLOCK_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < UNLOCK_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function subscribe() {
  return () => undefined;
}

function persistUnlock() {
  try {
    sessionStorage.setItem(UNLOCK_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

/**
 * Parent-safe “false front”: looks like a boring college LMS error.
 * Only “the son” who knows the unlock can enter Circle.
 *
 * Unlock: tap “SPPU Student Portal” 5× → enter `son` / `shlok` / `42069`
 */
export function StealthGate({ children }: { children: React.ReactNode }) {
  const storedOpen = useSyncExternalStore(subscribe, readUnlocked, () => false);
  const [manualOpen, setManualOpen] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [pin, setPin] = useState("");
  const [fails, setFails] = useState(0);
  const [hardError, setHardError] = useState(false);
  const [taps, setTaps] = useState(0);

  const open = storedOpen || manualOpen;

  if (open) return <>{children}</>;

  if (hardError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#111] px-6 text-center text-white">
        <p className="font-mono text-sm text-red-400">ERR_ACCESS_DENIED</p>
        <h1 className="mt-3 text-2xl font-bold">This page isn’t available</h1>
        <p className="mt-2 max-w-sm text-sm text-white/60">
          Parental control filter blocked this resource. Contact your network
          administrator.
        </p>
        <p className="mt-8 font-mono text-xs text-white/30">HTTP 451 · Unavailable For Legal Reasons</p>
      </div>
    );
  }

  function onLogoTap() {
    const next = taps + 1;
    setTaps(next);
    if (next >= 5) {
      setShowCalc(true);
      playSound("tap");
    }
  }

  function tryUnlock(event: FormEvent) {
    event.preventDefault();
    const normalized = pin.trim().toLowerCase();
    if (normalized === "son" || normalized === "shlok" || normalized === "42069") {
      playSound("unlock");
      persistUnlock();
      setManualOpen(true);
      return;
    }
    playSound("wrong");
    const nextFails = fails + 1;
    setFails(nextFails);
    setPin("");
    if (nextFails >= 3) setHardError(true);
  }

  return (
    <div className="min-h-dvh bg-[#eef1f4] text-[#1f2937]">
      <header className="border-b border-[#d1d5db] bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button
            type="button"
            onClick={onLogoTap}
            className="text-left text-sm font-semibold tracking-tight text-[#111827]"
          >
            SPPU Student Portal
          </button>
          <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#991b1b]">
            session expired
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-lg border border-[#d1d5db] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Attendance / LMS Access</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Your institutional login session has expired. Re-authenticate to
            continue coursework, grade reports, and attendance records.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <label className="block">
              <span className="text-xs font-medium text-[#4b5563]">PRN / Email</span>
              <input
                className="mt-1 w-full rounded border border-[#d1d5db] px-3 py-2"
                placeholder="student@college.edu"
                autoComplete="username"
                readOnly
                value=""
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#4b5563]">Password</span>
              <input
                type="password"
                className="mt-1 w-full rounded border border-[#d1d5db] px-3 py-2"
                placeholder="••••••••"
                autoComplete="current-password"
                readOnly
                value=""
              />
            </label>
            <button
              type="button"
              className="min-h-11 w-full rounded bg-[#1d4ed8] py-2.5 text-sm font-semibold text-white"
              onClick={() => {
                playSound("wrong");
                setFails((f) => {
                  const n = f + 1;
                  if (n >= 3) setHardError(true);
                  return n;
                });
              }}
            >
              Sign in
            </button>
          </div>
          <p className="mt-4 text-xs text-[#9ca3af]">
            For parent / guardian queries contact the exam cell. Unauthorized
            access is logged.
          </p>
        </div>

        {showCalc ? (
          <form
            onSubmit={tryUnlock}
            className="mt-6 rounded-lg border border-dashed border-[#9ca3af] bg-white p-4"
          >
            <p className="text-xs font-medium text-[#6b7280]">
              Maintenance override (staff / authorized student only)
            </p>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-2 w-full rounded border border-[#d1d5db] px-3 py-2 text-sm"
              placeholder="identity token"
              autoComplete="off"
            />
            <button
              type="submit"
              className="mt-2 min-h-11 w-full rounded bg-[#111827] py-2 text-sm font-semibold text-white"
            >
              Verify
            </button>
            {fails > 0 ? (
              <p className="mt-2 text-xs text-[#b91c1c]">
                Invalid token · {3 - fails} attempt{3 - fails === 1 ? "" : "s"} left
              </p>
            ) : null}
          </form>
        ) : (
          <p className="mt-8 text-center text-[10px] text-[#9ca3af]">
            © 2026 Savitribai Phule Pune University · LMS v4.2
          </p>
        )}
      </main>
    </div>
  );
}
