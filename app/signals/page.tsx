"use client";

import { useState } from "react";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { SIGNALS } from "@/lib/mock/data";
import type { Playbook } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const PLAYBOOK_META: Record<Playbook, { label: string; text: string; soft: string; dot: string }> = {
  nimble: { label: "Nimble", text: "text-nimble", soft: "bg-nimble-soft", dot: "bg-nimble" },
  kylon: { label: "Kylon", text: "text-kylon", soft: "bg-kylon-soft", dot: "bg-kylon" },
  joint: { label: "Joint", text: "text-verified", soft: "bg-verified-soft", dot: "bg-verified" },
};

type Filter = "all" | Playbook;

function Step({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className={cn("text-[12.5px] leading-snug text-ink", mono && "font-mono text-[11.5px] text-nimble")}>
        {children}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden shrink-0 items-center self-stretch pt-5 text-line-strong lg:flex">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

export default function SignalMap() {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = SIGNALS.filter((s) => filter === "all" || s.playbook === filter);

  const tabs: { k: Filter; label: string }[] = [
    { k: "all", label: "All playbooks" },
    { k: "nimble", label: "Nimble" },
    { k: "kylon", label: "Kylon" },
    { k: "joint", label: "Joint" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[12.5px] font-medium uppercase tracking-wide text-nimble">Signal Map</p>
        <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight">
          From hidden pain to a public, searchable signal
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] text-muted">
          Each private customer condition becomes a public proxy, a Nimble query, and a
          weighted scoring rule — with the false-positive risk stated up front.
        </p>
      </header>

      <div className="inline-flex rounded-xl border border-line bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setFilter(t.k)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              filter === t.k ? "bg-canvas text-ink" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((s) => {
          const meta = PLAYBOOK_META[s.playbook];
          return (
            <article key={s.id} className="card p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", meta.soft, meta.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                  {meta.label}
                </span>
                <h3 className="text-[14px] font-semibold">{s.name}</h3>
                <span className={cn("ml-auto tnum rounded-md px-2 py-0.5 font-mono text-[12px] font-semibold", meta.soft, meta.text)}>
                  +{s.weight} fit
                </span>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-3">
                <Step label="Hidden condition">{s.private_condition}</Step>
                <Arrow />
                <Step label="Public proxy">{s.observable_proxy}</Step>
                <Arrow />
                <Step label="Nimble query" mono>“{s.search_queries[0]}”</Step>
                <Arrow />
                <Step label="Preferred source">
                  {s.eligible_sources.slice(0, 2).join(", ")}
                  <span className="ml-1 text-faint">· ≤{s.max_age_days}d</span>
                </Step>
              </div>

              <p className="mt-4 flex items-start gap-1.5 border-t border-dashed border-line pt-3 text-[12px] text-muted">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-inferred" />
                <span>
                  <span className="font-medium text-[#b57708]">False-positive risk — </span>
                  {s.false_positive_risks[0]}
                </span>
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
