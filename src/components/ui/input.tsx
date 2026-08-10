"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "field-shell flex h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]/90 px-4 py-2 text-sm text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] placeholder:text-[var(--ink-muted)] backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
