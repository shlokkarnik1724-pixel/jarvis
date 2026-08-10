"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-[var(--ink)] transition-colors duration-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-focus-visible:text-[var(--accent-deep)]",
        className
      )}
      {...props}
    />
  );
}
