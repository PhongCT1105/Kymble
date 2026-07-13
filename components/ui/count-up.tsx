"use client";

import { useEffect } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";

export function CountUp({
  value,
  className,
  duration = 0.9,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
