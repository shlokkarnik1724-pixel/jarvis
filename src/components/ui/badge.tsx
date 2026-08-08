import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent-deep)]",
        className
      )}
      {...props}
    />
  );
}
