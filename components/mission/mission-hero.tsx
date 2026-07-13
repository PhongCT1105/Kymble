"use client";

import { Rocket, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { useMission } from "@/lib/mission/store";
import { cn } from "@/lib/utils";

const PARAMS = [
  { k: "Learn from", v: "Alta customer story" },
  { k: "Goal", v: "5 AI-native accounts" },
  { k: "Min score", v: "70" },
  { k: "Evidence", v: "2 sources" },
];

export function MissionHero() {
  const phase = useMission((s) => s.phase);
  const launch = useMission((s) => s.launch);
  const reset = useMission((s) => s.reset);

  const running = phase === "running";
  const done = phase !== "idle" && !running;

  return (
    <section className="card grid-backdrop relative overflow-hidden p-6 sm:p-8">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11.5px] font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-nimble" />
          Active mission · Nimble + Kylon
        </span>

        <h1 className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
          Find the next company that needs{" "}
          <span className="text-gradient-brand">Nimble + Kylon</span>
        </h1>

        <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">
          Kymble finds who needs you next — and shows the receipts. It learns from a real
          customer win, hunts the live web for the same buying conditions, and hands you a
          source-backed next action.
        </p>

        {/* mission params */}
        <div className="mt-5 flex flex-wrap gap-2">
          {PARAMS.map((p) => (
            <span
              key={p.k}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12px]"
            >
              <span className="text-faint">{p.k}</span>
              <span className="font-medium text-ink">{p.v}</span>
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!done ? (
            <button
              onClick={launch}
              disabled={running}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14.5px] font-semibold text-white shadow-raise transition-all",
                running
                  ? "cursor-default bg-nimble/70"
                  : "gradient-brand hover:brightness-105 active:scale-[0.99]",
              )}
            >
              {running ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Mission running…
                </>
              ) : (
                <>
                  <Rocket className="h-4.5 w-4.5" />
                  Launch GTM mission
                </>
              )}
            </button>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-xl bg-verified-soft px-4 py-3 text-[14px] font-semibold text-verified">
                <CheckCircle2 className="h-4.5 w-4.5" />
                Mission complete
              </span>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
              >
                <RotateCcw className="h-4 w-4" />
                Run again
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
