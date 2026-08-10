"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { partyGet, partyPost } from "@/lib/party/client";
import { playSound } from "@/lib/sound/sfx";
import { toast } from "@/lib/store/toast-store";
import { CabRecommendModal } from "@/components/party/cab-recommend-modal";
import { pushCircleNotice } from "@/components/party/notification-center";

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
  const [myGeo, setMyGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [cabOpen, setCabOpen] = useState(false);
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
        if (geo) setMyGeo(geo);
        playSound(action === "in" ? "lockIn" : "tap");
        toast(action === "in" ? "Locked in" : "Locked out", {
          description:
            action === "in" && geo
              ? `Shared ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)} for 24h`
              : undefined,
          tone: "success",
        });
        if (action === "in") {
          pushCircleNotice({
            title: "You locked in",
            body: geo
              ? `Location live on the safety web`
              : atHome
                ? "Home mode — location skipped"
                : "Locked in without GPS",
          });
          const drunk = full.rideHome.filter((r) => !r.worthy && r.level >= 3);
          if (drunk.length > 0 && !atHome) {
            playSound("danger");
            setCabOpen(true);
          }
        }
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

      <section className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4 text-[var(--ink)] shadow-sm">
        <h2 className="font-island text-lg font-bold text-[var(--ink)]">🕸️ Location web</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Live GPS pins · Pune safety net · tap a name for Maps
        </p>
        {myGeo ? (
          <p className="mt-2 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm font-medium text-[var(--ink)]">
            Your pin: {myGeo.lat.toFixed(5)}, {myGeo.lng.toFixed(5)}{" "}
            <a
              className="underline"
              href={`https://www.google.com/maps?q=${myGeo.lat},${myGeo.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              open maps
            </a>
          </p>
        ) : null}
        <div className="mt-3">
          <LocationWeb locations={locations} />
        </div>
        <ul className="mt-3 space-y-1 text-sm text-[var(--ink)]">
          {locations.map((loc) => (
            <li key={loc.userId} className="flex justify-between gap-2">
              <span className="font-medium">{loc.name}</span>
              <a
                className="text-[var(--accent-deep)] underline"
                href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4 text-[var(--ink)] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-island text-lg font-bold text-[var(--ink)]">🚕 Ride home safely</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Drunk = not worthy driver. We&apos;ll push Uber / Ola.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              playSound("danger");
              setCabOpen(true);
            }}
          >
            Cab tips
          </Button>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {rideHome.map((row) => (
            <li
              key={row.userId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[#f7faf8] px-3 py-2 text-[var(--ink)]"
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
            className="w-28 shrink-0 rounded-2xl border border-[var(--line)] bg-white p-2 text-[var(--ink)] shadow-sm"
          >
            {row.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.photoDataUrl}
                alt={row.name}
                className="h-24 w-full rounded-xl object-cover"
              />
            ) : null}
            <figcaption className="mt-1 text-xs font-medium text-[var(--ink)]">
              {row.action === "in" ? "🟢" : "⚫"} {row.name}
            </figcaption>
          </figure>
        ))}
      </div>

      <CabRecommendModal
        open={cabOpen}
        onClose={() => setCabOpen(false)}
        targets={rideHome
          .filter((r) => !r.worthy)
          .map((r) => ({ name: r.name, drinkLabel: r.label, level: r.level }))}
        lat={myGeo?.lat ?? locations[0]?.lat}
        lng={myGeo?.lng ?? locations[0]?.lng}
      />
    </div>
  );
}
