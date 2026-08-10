/** Shared motion tokens — GPU-friendly (transform/opacity), snappy 150–300ms. */

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeOutSoft = [0.16, 1, 0.3, 1] as const;

export const duration = {
  instant: 0.12,
  fast: 0.18,
  base: 0.24,
  slow: 0.3,
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOut },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.fast, ease: easeOut },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: easeOut },
  },
};

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: duration.fast, ease: easeOut },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOut },
  },
};

export const tapScale = { scale: 0.95 };
export const hoverLift = { scale: 1.02, y: -1 };
