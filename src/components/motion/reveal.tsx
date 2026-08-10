"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  duration,
  easeOut,
  fadeUp,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.18, margin: "0px 0px -40px 0px" }}
      transition={{ duration: duration.base, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
};

export function Stagger({ children, className, once = true }: StaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.12 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        ...fadeUp,
        visible: {
          ...fadeUp.visible,
          transition: { duration: duration.base, ease: easeOut, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function InteractiveSurface({
  children,
  className,
  as: Comp = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const reduced = useReducedMotion();
  const MotionComp = motion[Comp];

  return (
    <MotionComp
      className={cn(
        "transition-[box-shadow,border-color,backdrop-filter] duration-200",
        className
      )}
      whileHover={
        reduced
          ? undefined
          : {
              y: -2,
              transition: { duration: duration.fast, ease: easeOut },
            }
      }
      whileTap={reduced ? undefined : { scale: 0.985 }}
    >
      {children}
    </MotionComp>
  );
}
