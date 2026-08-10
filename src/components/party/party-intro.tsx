"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, easeOut } from "@/lib/motion";
import { playSound } from "@/lib/sound/sfx";

const INTRO_KEY = "circle-intro-day";

/** Quirky Gen Z reaction GIFs — dance / Spidey / party chaos (not video). */
const INTRO_GIFS = [
  {
    id: "dance1",
    url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    label: "spiderman dance",
  },
  {
    id: "swing",
    url: "https://media.giphy.com/media/xT9DPIBYf0pAviBLzO/giphy.gif",
    label: "web swing",
  },
  {
    id: "party",
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    label: "dance floor",
  },
  {
    id: "mask",
    url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
    label: "mask on",
  },
  {
    id: "cat",
    url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    label: "party cat",
  },
  {
    id: "excited",
    url: "https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif",
    label: "excited",
  },
  {
    id: "thwip",
    url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    label: "thwip",
  },
  {
    id: "shimmy",
    url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    label: "shimmy",
  },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readIntroPending(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) !== todayKey();
  } catch {
    return true;
  }
}

const introListeners = new Set<() => void>();

function subscribeIntro(cb: () => void) {
  introListeners.add(cb);
  return () => {
    introListeners.delete(cb);
  };
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_KEY, todayKey());
  } catch {
    // ignore
  }
  introListeners.forEach((l) => l());
}

function gifOrbit(index: number, total: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const radius = 38;
  return {
    left: `${50 + radius * Math.cos(angle)}%`,
    top: `${50 + radius * Math.sin(angle) * 0.88}%`,
    rotate: `${(index % 2 === 0 ? -1 : 1) * (8 + (index % 4) * 3)}deg`,
  };
}

export function PartyIntro() {
  const reduced = useReducedMotion();
  const pending = useSyncExternalStore(subscribeIntro, readIntroPending, () => false);
  const [dismissed, setDismissed] = useState(false);
  const show = pending && !dismissed;

  function dismiss() {
    markIntroSeen();
    playSound("cheers");
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          type="button"
          aria-label="Enter Circle"
          onClick={dismiss}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#070c0a] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: duration.base } }}
        >
          <div className="party-lights party-lights--intense pointer-events-none absolute inset-0" />
          <div className="party-particles pointer-events-none absolute inset-0" />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {INTRO_GIFS.map((gif, i) => {
              const pos = gifOrbit(i, INTRO_GIFS.length);
              return (
                <motion.img
                  key={gif.id}
                  src={gif.url}
                  alt={gif.label}
                  className="absolute h-24 w-24 rounded-2xl object-cover shadow-[0_12px_40px_rgba(0,0,0,0.65)] ring-2 ring-white/35 md:h-32 md:w-32"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: `translate(-50%, -50%) rotate(${pos.rotate})`,
                  }}
                  initial={reduced ? false : { opacity: 0, scale: 0.75 }}
                  animate={
                    reduced
                      ? { opacity: 0.75 }
                      : {
                          opacity: [0.55, 0.95, 0.55],
                          y: [0, -14, 0],
                          scale: [0.94, 1.06, 0.94],
                        }
                  }
                  transition={{
                    duration: 2.8 + i * 0.18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                />
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />

          <motion.p
            className="relative max-w-[92vw] font-island text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] md:text-5xl lg:text-6xl"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
          >
            🍾 WHAT ARE WE DRINKING TONIGHT?
          </motion.p>
          <motion.p
            className="relative mt-6 text-sm font-medium text-white drop-shadow md:text-base"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            tap anywhere to enter the circle
          </motion.p>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
