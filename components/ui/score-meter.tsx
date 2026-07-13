"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

export function ScoreMeter({
  kind,
  value,
  showLabel = true,
}: {
  kind: "nimble" | "kylon";
  value: number;
  showLabel?: boolean;
}) {
  const color = kind === "nimble" ? "var(--color-nimble)" : "var(--color-kylon)";
  const track = kind === "nimble" ? "var(--color-nimble-soft)" : "var(--color-kylon-soft)";

  return (
    <div className="min-w-0">
      {showLabel && (
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {kind === "nimble" ? "Nimble fit" : "Kylon fit"}
          </span>
          <span
            className="tnum font-mono text-[13px] font-semibold"
            style={{ color }}
          >
            <CountUp value={value} />
          </span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: track }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/** Compact inline score chip (pipeline table cells). */
export function ScoreChip({
  kind,
  value,
}: {
  kind: "nimble" | "kylon";
  value: number;
}) {
  const color = kind === "nimble" ? "var(--color-nimble)" : "var(--color-kylon)";
  return (
    <span
      className={cn(
        "tnum font-mono text-[14px] font-semibold",
        value === 0 && "text-faint",
      )}
      style={value > 0 ? { color } : undefined}
    >
      {value === 0 ? "—" : <CountUp value={value} />}
    </span>
  );
}
