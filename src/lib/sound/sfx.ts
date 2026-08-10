"use client";

/**
 * Gen Z soundboard — curated WAV stingers in /public/sfx (quirky, punchy).
 */

type SoundId =
  | "tap"
  | "hereWeGoAgain"
  | "cheers"
  | "clink"
  | "wrong"
  | "unlock"
  | "lockIn"
  | "vote"
  | "gameStart"
  | "sutta"
  | "danger"
  | "send"
  | "success"
  | "ping"
  | "spidey";

const FILES: Record<SoundId, string> = {
  tap: "/sfx/tap.wav",
  hereWeGoAgain: "/sfx/again.wav",
  cheers: "/sfx/cheers.wav",
  clink: "/sfx/clink.wav",
  wrong: "/sfx/wrong.wav",
  unlock: "/sfx/unlock.wav",
  lockIn: "/sfx/lock.wav",
  vote: "/sfx/vote.wav",
  gameStart: "/sfx/game.wav",
  sutta: "/sfx/sutta.wav",
  danger: "/sfx/danger.wav",
  send: "/sfx/send.wav",
  success: "/sfx/success.wav",
  ping: "/sfx/ping.wav",
  spidey: "/sfx/spidey.wav",
};

const pool = new Map<SoundId, HTMLAudioElement>();

function getAudio(id: SoundId): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let el = pool.get(id);
  if (!el) {
    el = new Audio(FILES[id]);
    el.preload = "auto";
    el.volume = id === "tap" ? 0.45 : 0.7;
    pool.set(id, el);
  }
  return el;
}

export function playSound(id: SoundId): void {
  if (typeof window === "undefined") return;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = getAudio(id);
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  } catch {
    // ignore autoplay failures until user gesture
  }
}

/** Warm the audio pool after first user gesture. */
export function armSounds(): void {
  (Object.keys(FILES) as SoundId[]).forEach((id) => {
    const el = getAudio(id);
    if (!el) return;
    el.load();
  });
}

export type { SoundId };
