"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Spidey-forward Gen Z reaction pack (Giphy CDN). */
export const SPIDEY_GIFS = [
  {
    id: "dance",
    url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    label: "spidey dance",
  },
  {
    id: "swing",
    url: "https://media.giphy.com/media/xT9DPIBYf0pAviBLzO/giphy.gif",
    label: "web swing",
  },
  {
    id: "mask",
    url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
    label: "mask on",
  },
  {
    id: "thwip",
    url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    label: "thwip energy",
  },
  {
    id: "party",
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    label: "party crawl",
  },
  {
    id: "cat",
    url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    label: "party cat",
  },
  {
    id: "shimmy",
    url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    label: "shimmy",
  },
  {
    id: "excited",
    url: "https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif",
    label: "excited",
  },
];

/** Floating reaction GIFs — home + inner pages (mobile + desktop). */
export function AmbientGifField({
  density = "normal",
  className,
  variant = "orbit",
}: {
  density?: "light" | "normal" | "home";
  className?: string;
  variant?: "orbit" | "scatter";
}) {
  const reduced = useReducedMotion();
  const gifs =
    density === "light"
      ? SPIDEY_GIFS.slice(0, 4)
      : density === "home"
        ? SPIDEY_GIFS
        : SPIDEY_GIFS.slice(0, 6);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      {gifs.map((gif, i) => {
        const angle = (Math.PI * 2 * i) / gifs.length - Math.PI / 2;
        const radius = density === "home" ? 46 : 42;
        const left =
          variant === "scatter"
            ? 8 + ((i * 17) % 84)
            : 50 + radius * Math.cos(angle);
        const top =
          variant === "scatter"
            ? 10 + ((i * 23) % 75)
            : 50 + radius * Math.sin(angle);
        const size =
          density === "home"
            ? "h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20"
            : "h-14 w-14 sm:h-20 sm:w-20";
        return (
          <motion.img
            key={gif.id}
            src={gif.url}
            alt=""
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-xl object-cover shadow-lg ring-2 ring-white/40",
              size,
              density === "home" ? "opacity-55 sm:opacity-65" : "opacity-40 sm:opacity-50"
            )}
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={
              reduced
                ? { opacity: 0.4 }
                : {
                    y: [0, -14, 0, 10, 0],
                    rotate: [i % 2 === 0 ? -10 : 10, i % 2 === 0 ? 8 : -8, i % 2 === 0 ? -10 : 10],
                    opacity: density === "home" ? [0.45, 0.75, 0.45] : [0.3, 0.55, 0.3],
                  }
            }
            transition={{
              duration: 3.8 + i * 0.28,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        );
      })}
    </div>
  );
}
