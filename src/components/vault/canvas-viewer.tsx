"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CanvasViewerProps {
  photoId: string;
  viewerName: string;
  viewerIp?: string;
  className?: string;
}

export function CanvasViewer({
  photoId,
  viewerName,
  viewerIp = "local",
  className,
}: CanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const originalToDataURL = canvas.toDataURL.bind(canvas);
    const originalToBlob = canvas.toBlob.bind(canvas);

    canvas.toDataURL = () => {
      return "data:,";
    };
    canvas.toBlob = (callback) => {
      if (callback) callback(null);
    };

    async function render() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/vault/stream/${photoId}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Unable to load protected media");
        }

        const buffer = await response.arrayBuffer();
        if (cancelled) return;

        const blob = new Blob([buffer], {
          type: response.headers.get("content-type") || "image/jpeg",
        });
        const objectUrl = URL.createObjectURL(blob);

        const bitmap = await createImageBitmap(blob);
        URL.revokeObjectURL(objectUrl);

        if (cancelled) {
          bitmap.close();
          return;
        }

        const target = canvasRef.current;
        if (!target) {
          bitmap.close();
          return;
        }

        const maxWidth = target.parentElement?.clientWidth || 720;
        const scale = Math.min(1, maxWidth / bitmap.width);
        target.width = Math.max(1, Math.floor(bitmap.width * scale));
        target.height = Math.max(1, Math.floor(bitmap.height * scale));

        const ctx = target.getContext("2d");
        if (!ctx) {
          bitmap.close();
          throw new Error("Canvas unavailable");
        }

        ctx.clearRect(0, 0, target.width, target.height);
        ctx.drawImage(bitmap, 0, 0, target.width, target.height);
        bitmap.close();

        const stamp = `${viewerName} · ${new Date().toISOString()} · ${viewerIp}`;
        ctx.save();
        ctx.translate(target.width * 0.08, target.height * 0.55);
        ctx.rotate(-0.28);
        ctx.font = `${Math.max(14, Math.floor(target.width * 0.035))}px sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.fillText(stamp, 0, 0);
        ctx.fillStyle = "rgba(12,18,24,0.22)";
        ctx.fillText(stamp, 1, 1);
        ctx.restore();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Render failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void render();

    return () => {
      cancelled = true;
      canvas.toDataURL = originalToDataURL;
      canvas.toBlob = originalToBlob;
    };
  }, [photoId, viewerIp, viewerName]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-none bg-[var(--ink)]/5 select-none",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="block h-auto w-full pointer-events-none"
        aria-label="Protected vault media"
      />
      <div
        className="absolute inset-0 z-10"
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onTouchStart={(event) => {
          if (event.touches.length > 1) event.preventDefault();
        }}
        role="presentation"
      />
      {loading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg)]/70 text-sm text-[var(--ink-muted)]">
          Decrypting secure stream…
        </div>
      ) : null}
      {error ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--danger-soft)] text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}
    </div>
  );
}
