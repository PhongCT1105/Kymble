"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentId } from "@/lib/domain/types";
import { useMission } from "@/lib/mission/store";

const AGENT_TAG: Record<AgentId, string> = {
  chief: "Chief of Staff",
  case: "Case Analyst",
  signal: "Signal Architect",
  scout: "Web Scout",
  verifier: "Verifier",
  strategist: "Strategist",
};

export function ActivityConsole({ className }: { className?: string }) {
  const activity = useMission((s) => s.activity);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activity.length]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-verified" />
        <h3 className="text-[13px] font-semibold">Activity console</h3>
        <span className="ml-auto font-mono text-[11px] text-faint">
          {activity.length} events
        </span>
      </div>

      <div
        ref={scrollRef}
        className="h-[280px] overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed"
      >
        {activity.length === 0 ? (
          <p className="pt-16 text-center text-[12px] text-faint">
            Launch a mission to watch the team work.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {activity.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-2.5 py-1"
              >
                <span className="shrink-0 tnum text-faint">{line.time}</span>
                <span className="shrink-0 font-semibold text-nimble">
                  {AGENT_TAG[line.agent]}
                </span>
                <span className="text-ink/80">{line.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
