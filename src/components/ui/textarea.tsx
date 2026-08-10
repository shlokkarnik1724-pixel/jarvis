"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "field-shell flex min-h-[110px] w-full rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)]/90 px-4 py-3 text-sm text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] placeholder:text-[var(--ink-muted)] backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
