import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-xl", className)}
      aria-hidden
      {...props}
    />
  );
}

export function SkeletonBlock({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading">
      <Skeleton className="h-7 w-2/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function StatusPulse({
  className,
  tone = "ok",
}: {
  className?: string;
  tone?: "ok" | "warn" | "accent";
}) {
  const color =
    tone === "warn"
      ? "bg-[var(--warn)]"
      : tone === "accent"
        ? "bg-[var(--accent)]"
        : "bg-[var(--ok)]";

  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5", className)}>
      <span
        className={cn(
          "absolute inset-0 animate-status-pulse rounded-full opacity-60",
          color
        )}
      />
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)} />
    </span>
  );
}
