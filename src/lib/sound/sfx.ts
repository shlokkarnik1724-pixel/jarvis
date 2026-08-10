"use client";

/**
 * Gen Z soundboard — Web Audio synth stingers (no copyrighted samples).
 * Distinct cue per action so taps feel iconic without external assets.
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
  | "success";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  gain = 0.08,
  delay = 0
) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const PLAYBOOK: Record<SoundId, () => void> = {
  tap: () => tone(880, 0.06, "triangle", 0.05),
  hereWeGoAgain: () => {
    // Rising “oh no we’re doing this again” stinger
    tone(220, 0.12, "sawtooth", 0.07);
    tone(277, 0.12, "sawtooth", 0.07, 0.1);
    tone(330, 0.14, "sawtooth", 0.08, 0.2);
    tone(440, 0.22, "square", 0.06, 0.34);
  },
  cheers: () => {
    tone(523, 0.08, "triangle", 0.07);
    tone(659, 0.1, "triangle", 0.07, 0.07);
    tone(784, 0.16, "triangle", 0.06, 0.14);
  },
  clink: () => {
    tone(1200, 0.05, "sine", 0.06);
    tone(1800, 0.08, "sine", 0.05, 0.04);
  },
  wrong: () => {
    tone(180, 0.18, "sawtooth", 0.08);
    tone(140, 0.22, "sawtooth", 0.07, 0.12);
  },
  unlock: () => {
    tone(392, 0.08, "square", 0.06);
    tone(523, 0.1, "square", 0.06, 0.08);
    tone(659, 0.16, "square", 0.07, 0.16);
  },
  lockIn: () => {
    tone(300, 0.1, "square", 0.07);
    tone(600, 0.14, "square", 0.06, 0.1);
  },
  vote: () => {
    tone(740, 0.07, "triangle", 0.06);
    tone(990, 0.1, "triangle", 0.05, 0.06);
  },
  gameStart: () => {
    tone(262, 0.09, "square", 0.07);
    tone(330, 0.09, "square", 0.07, 0.09);
    tone(392, 0.09, "square", 0.07, 0.18);
    tone(523, 0.18, "square", 0.08, 0.27);
  },
  sutta: () => {
    tone(160, 0.2, "sawtooth", 0.04);
    tone(90, 0.25, "triangle", 0.035, 0.05);
  },
  danger: () => {
    tone(440, 0.1, "square", 0.08);
    tone(440, 0.1, "square", 0.08, 0.14);
    tone(440, 0.18, "square", 0.09, 0.28);
  },
  send: () => {
    tone(660, 0.05, "sine", 0.05);
    tone(880, 0.08, "sine", 0.05, 0.05);
  },
  success: () => {
    tone(523, 0.08, "triangle", 0.06);
    tone(784, 0.14, "triangle", 0.06, 0.08);
  },
};

export function playSound(id: SoundId): void {
  if (typeof window === "undefined") return;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    PLAYBOOK[id]();
  } catch {
    // ignore autoplay / audio failures
  }
}

export type { SoundId };
