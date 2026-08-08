"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** One-click running demo — opens seeded company brain with no login form. */
export default function DemoLaunchPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Booting Acme company brain…");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Seeding demo workspace…");
        const res = await fetch("/api/demo/launch", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Demo launch failed");
        if (cancelled) return;
        setStatus("Opening Command Center…");
        router.replace("/command");
        router.refresh();
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not start demo");
        setStatus("Failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="atmosphere min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="font-display text-3xl tracking-tight">
          Tactix <span className="text-[var(--accent)]">AI</span>
        </p>
        <p className="mt-6 text-lg">{status}</p>
        {error ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[var(--danger)]">{error}</p>
            <button
              type="button"
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <p className="text-xs text-[var(--ink-muted)]">
              Or go to{" "}
              <a href="/" className="text-[var(--accent)] underline">
                home
              </a>
            </p>
          </div>
        ) : (
          <div className="mt-8 mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-[var(--line)]">
            <div className="h-full w-1/2 bg-[var(--accent)] processing-bar" />
          </div>
        )}
      </div>
    </div>
  );
}
