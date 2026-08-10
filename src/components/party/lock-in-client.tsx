"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { partyGet, partyPost } from "@/lib/party/client";
import { toast } from "@/lib/store/toast-store";

type Attendance = {
  id: string;
  name: string;
  action: "in" | "out";
  photoDataUrl: string | null;
  ts: string;
};

export function LockInClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [rows, setRows] = useState<Attendance[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setRows(await partyGet<Attendance[]>("lock"));
    });
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function boot() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamReady(true);
        }
      } catch {
        setStreamReady(false);
      }
    }
    void boot();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function snap(): string | null {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  function clock(action: "in" | "out") {
    const photoDataUrl = snap();
    startTransition(async () => {
      try {
        const data = await partyPost<{ attendance: Attendance[] }>({
          feature: "lock",
          action: "clock",
          clock: action,
          photoDataUrl,
        });
        setRows(data.attendance);
        toast(action === "in" ? "Locked in" : "Locked out", { tone: "success" });
      } catch (error) {
        toast("Need a selfie", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <IslandCard emoji="⏰" title="Lock In / Out" accent="rgba(126,184,201,0.4)">
        <p className="text-sm text-[var(--ink-muted)]">
          Mandatory selfie to clock in or dip. Who&apos;s here strip below.
        </p>
      </IslandCard>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-black">
        <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
      </div>
      {!streamReady ? (
        <p className="text-sm text-[var(--ink-muted)]">
          Camera blocked — allow access to lock in with a selfie.
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button disabled={pending} onClick={() => clock("in")}>
          🔓 Lock In
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => clock("out")}>
          🚪 Lock Out
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {rows.map((row) => (
          <figure
            key={row.id}
            className="w-28 shrink-0 rounded-2xl border border-white/40 bg-white/70 p-2"
          >
            {row.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.photoDataUrl}
                alt={row.name}
                className="h-24 w-full rounded-xl object-cover"
              />
            ) : null}
            <figcaption className="mt-1 text-xs">
              {row.action === "in" ? "🟢" : "⚫"} {row.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
