"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { partyGet, partyPost } from "@/lib/party/client";
import { playSound } from "@/lib/sound/sfx";
import { toast } from "@/lib/store/toast-store";

type Attendance = {
  id: string;
  name: string;
  action: "in" | "out";
  photoDataUrl: string | null;
  ts: string;
};

type LiveLoc = {
  userId: string;
  name: string;
  lat: number;
  lng: number;
  expiresAt: string;
};

type RideRow = {
  userId: string;
  name: string;
  label: string;
  level: number;
  isDD: boolean;
  worthy: boolean;
  verdict: string;
};

type LockPayload = {
  attendance: Attendance[];
  locations: LiveLoc[];
  rideHome: RideRow[];
};

function LocationWeb({ locations }: { locations: LiveLoc[] }) {
  const size = 360;
  const nodes = useMemo(() => {
    if (locations.length === 0) return [];
    const lats = locations.map((l) => l.lat);
    const lngs = locations.map((l) => l.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 0.01;
    const latSpan = Math.max(maxLat - minLat, pad);
    const lngSpan = Math.max(maxLng - minLng, pad);
    return locations.map((loc, i) => {
      const x = 40 + ((loc.lng - minLng) / lngSpan) * (size - 80);
      const y = 40 + (1 - (loc.lat - minLat) / latSpan) * (size - 80);
      return { ...loc, x, y, short: loc.name.split(" ")[0] ?? loc.name, i };
    });
  }, [locations]);

  if (nodes.length === 0) {
    return <p className="text-sm text-[var(--ink-muted)]">No live pins yet.</p>;
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-md">
      <rect width={size} height={size} rx={24} fill="rgba(15,30,24,0.08)" />
      <text x={18} y={28} className="fill-[var(--ink-muted)] text-[11px] font-semibold">
        Pune safety web · 24h
      </text>
      {nodes.map((a, i) =>
        nodes.slice(i + 1).map((b) => (
          <line
            key={`${a.userId}-${b.userId}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(31,111,84,0.28)"
            strokeWidth={1.5}
          />
        ))
      )}
      {nodes.map((node) => (
        <g key={node.userId}>
          <circle cx={node.x} cy={node.y} r={18} fill="rgba(255,255,255,0.95)" stroke="rgba(31,111,84,0.55)" strokeWidth={2} />
          <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-[var(--ink)] text-[10px] font-bold">
            {node.short.slice(0, 6)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function LockInClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [rows, setRows] = useState<Attendance[]>([]);
  const [locations, setLocations] = useState<LiveLoc[]>([]);
  const [rideHome, setRideHome] = useState<RideRow[]>([]);
  const [shareLocation, setShareLocation] = useState(true);
  const [atHome, setAtHome] = useState(false);
  const [pending, startTransition] = useTransition();

  function applyPayload(data: LockPayload) {
    setRows(data.attendance);
    setLocations(data.locations);
    setRideHome(data.rideHome);
  }

  useEffect(() => {
    startTransition(async () => {
      applyPayload(await partyGet<LockPayload>("lock"));
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

  function readGeo(): Promise<{ lat: number; lng: number } | null> {
    if (!shareLocation || atHome || !navigator.geolocation) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  function clock(action: "in" | "out") {
    const photoDataUrl = snap();
    startTransition(async () => {
      try {
        const geo = action === "in" ? await readGeo() : null;
        const data = await partyPost<LockPayload & { attendance: Attendance[] }>({
          feature: "lock",
          action: "clock",
          clock: action,
          photoDataUrl,
          shareLocation: Boolean(geo) && !atHome,
          lat: geo?.lat,
          lng: geo?.lng,
        });
        setRows(data.attendance);
        if (data.locations) setLocations(data.locations);
        // refresh ride home + locations
        const full = await partyGet<LockPayload>("lock");
        applyPayload(full);
        playSound(action === "in" ? "lockIn" : "tap");
        toast(action === "in" ? "Locked in" : "Locked out", {
          description:
            action === "in" && geo
              ? "Location shared with the circle for 24h"
              : undefined,
          tone: "success",
        });
      } catch (error) {
        playSound("wrong");
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
          Selfie to clock in. Optionally share GPS so the Pune safety web stays live for 24 hours.
        </p>
      </IslandCard>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-black">
        <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full object-cover sm:aspect-video" />
      </div>
      {!streamReady ? (
        <p className="text-sm text-[var(--ink-muted)]">
          Camera blocked — allow access to lock in with a selfie.
        </p>
      ) : null}

      <label className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={shareLocation && !atHome}
          disabled={atHome}
          onChange={(e) => setShareLocation(e.target.checked)}
        />
        <span>
          Share my location with the circle for 24h (safety web). The browser will ask for GPS
          permission.
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={atHome}
          onChange={(e) => setAtHome(e.target.checked)}
        />
        <span>We&apos;re at someone&apos;s home — skip location sharing tonight.</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <Button className="min-h-11 flex-1" disabled={pending} onClick={() => clock("in")}>
          🔓 Lock In
        </Button>
        <Button
          className="min-h-11 flex-1"
          variant="secondary"
          disabled={pending}
          onClick={() => clock("out")}
        >
          🚪 Lock Out
        </Button>
      </div>

      <section className="rounded-[1.5rem] border border-white/40 bg-white/70 p-4">
        <h2 className="font-island text-lg font-bold">🕸️ Location web</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Live pins from friends who shared GPS · Pune hang safety net
        </p>
        <div className="mt-3">
          <LocationWeb locations={locations} />
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/40 bg-white/70 p-4">
        <h2 className="font-island text-lg font-bold">🚕 Ride home safely</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Based on bar tiers — if they drank, they&apos;re not worthy to drive.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {rideHome.map((row) => (
            <li
              key={row.userId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] px-3 py-2"
            >
              <span>
                {row.name} · {row.label}
              </span>
              <span className={row.worthy ? "font-semibold text-[var(--ok)]" : "font-semibold text-[var(--danger)]"}>
                {row.verdict}
              </span>
            </li>
          ))}
        </ul>
      </section>

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
