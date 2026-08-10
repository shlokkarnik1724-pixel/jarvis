"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const AMBIENT_GIFS = [
  {
    id: "dance",
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    label: "dance",
  },
  {
    id: "cheers",
    url: "https://media.giphy.com/media/g9582DNuQVjV6/giphy.gif",
    label: "cheers",
  },
  {
    id: "spidey",
    url: "https://media.giphy.com/media/l2SpU4cE1hiHdG7ji/giphy.gif",
    label: "spidey",
  },
  {
    id: "chaos",
    url: "https://media.giphy.com/media/3o7aCTPPm4OHgjwD8Y/giphy.gif",
    label: "chaos",
  },
  {
    id: "hype",
    url: "https://media.giphy.com/media/l0MYwONBGDcdVu8mA/giphy.gif",
    label: "hype",
  },
  {
    id: "groove",
    url: "https://media.giphy.com/media/3oriO7A7bt1wgFzBhK/giphy.gif",
    label: "groove",
  },
];

/** Floating reaction GIFs that hang around feature pages (mobile + desktop). */
export function AmbientGifField({
  density = "normal",
  className,
}: {
  density?: "light" | "normal";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const gifs = density === "light" ? AMBIENT_GIFS.slice(0, 4) : AMBIENT_GIFS;

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
        const radius = 42;
        const left = 50 + radius * Math.cos(angle);
        const top = 50 + radius * Math.sin(angle);
        return (
          <motion.img
            key={gif.id}
            src={gif.url}
            alt=""
            className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-xl object-cover opacity-40 shadow-lg ring-1 ring-white/30 sm:h-20 sm:w-20 sm:opacity-50"
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={
              reduced
                ? { opacity: 0.35 }
                : {
                    y: [0, -12, 0, 8, 0],
                    rotate: [i % 2 === 0 ? -8 : 8, i % 2 === 0 ? 6 : -6, i % 2 === 0 ? -8 : 8],
                    opacity: [0.3, 0.55, 0.3],
                  }
            }
            transition={{
              duration: 4.2 + i * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        );
      })}
    </div>
  );
}
