"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration, easeOut } from "@/lib/motion";

const INTRO_KEY = "circle-intro-day";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PartyIntro() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(INTRO_KEY);
      if (seen === todayKey()) return;
      setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(INTRO_KEY, todayKey());
    } catch {
      // ignore
    }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          type="button"
          aria-label="Enter Circle"
          onClick={dismiss}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0c1612] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: duration.base } }}
        >
          <div className="party-particles pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(31,111,84,0.45),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(240,194,122,0.25),transparent_45%)]" />

          <motion.p
            className="relative font-island text-3xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
          >
            🍾 WHAT ARE WE DRINKING TONIGHT?
          </motion.p>
          <motion.p
            className="relative mt-6 text-sm text-white/70 md:text-base"
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
