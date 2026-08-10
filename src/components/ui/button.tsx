"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { duration, easeOut, hoverLift, tapScale } from "@/lib/motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background-color,box-shadow,border-color,color,transform,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 will-change-transform",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_12px_28px_-16px_rgba(31,111,84,0.65)] hover:bg-[var(--accent-deep)] hover:shadow-[0_16px_36px_-14px_rgba(31,111,84,0.55)]",
        secondary:
          "bg-[var(--bg-elevated)]/90 text-[var(--ink)] border border-[var(--line)] backdrop-blur-sm hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)] hover:shadow-[0_10px_24px_-18px_rgba(20,32,27,0.4)]",
        ghost:
          "text-[var(--ink)] hover:bg-[var(--accent-soft)]/80 hover:backdrop-blur-sm",
        danger:
          "bg-[var(--danger)] text-white shadow-[0_12px_28px_-18px_rgba(163,59,43,0.55)] hover:opacity-95",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const reduced = useReducedMotion();
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    return <Slot className={cn(classes, "active:scale-95")} {...props} />;
  }

  return (
    <motion.button
      className={classes}
      whileHover={reduced ? undefined : hoverLift}
      whileTap={reduced ? undefined : tapScale}
      transition={{ duration: duration.fast, ease: easeOut }}
      // Framer accepts a subset of button props; cast keeps HTML attrs intact.
      {...(props as React.ComponentProps<typeof motion.button>)}
    />
  );
}
