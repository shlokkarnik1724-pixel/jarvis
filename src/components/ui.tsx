import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-5 py-3 text-base",
        variant === "primary" &&
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)] shadow-sm",
        variant === "secondary" &&
          "bg-[var(--ink)] text-white hover:opacity-90",
        variant === "ghost" &&
          "bg-transparent hover:bg-black/5 text-[var(--ink)]",
        variant === "outline" &&
          "border border-[var(--line)] bg-white hover:bg-[var(--bg)] text-[var(--ink)]",
        variant === "danger" && "bg-[var(--danger)] text-white hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] min-h-32",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-[var(--ink)] mb-1.5",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-[var(--bg)] text-[var(--ink-muted)]",
        tone === "ok" && "bg-[var(--ok-soft)] text-[var(--ok)]",
        tone === "warn" && "bg-[var(--warn-soft)] text-[var(--warn)]",
        tone === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)]",
        tone === "accent" &&
          "bg-[var(--accent-soft)] text-[var(--accent-deep)]",
        className
      )}
    >
      {children}
    </span>
  );
}
