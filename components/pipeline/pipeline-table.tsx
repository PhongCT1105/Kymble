"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { useMission } from "@/lib/mission/store";
import { StagePill } from "@/components/ui/badges";
import { ScoreChip } from "@/components/ui/score-meter";
import { cn } from "@/lib/utils";

type SortKey = "priority" | "nimble" | "kylon";

export function PipelineTable({ compact = false }: { compact?: boolean }) {
  const accounts = useMission((s) => s.accounts);
  const [sort, setSort] = useState<SortKey>("priority");

  const rows = useMemo(() => {
    const withScores = accounts.some((a) => a.priority > 0);
    if (!withScores) return accounts;
    return [...accounts].sort((a, b) => b[sort] - a[sort]);
  }, [accounts, sort]);

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSort(k)}
      className={cn(
        "inline-flex items-center gap-1 transition-colors",
        sort === k ? "text-ink" : "hover:text-ink",
      )}
    >
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-50" />
    </button>
  );

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-[11px] font-medium uppercase tracking-wide text-faint">
              <th className="px-4 py-3">Account</th>
              <th className="px-3 py-3">Stage</th>
              <th className="px-3 py-3 text-right">
                {compact ? "Nimble" : <SortBtn k="nimble" label="Nimble" />}
              </th>
              <th className="px-3 py-3 text-right">
                {compact ? "Kylon" : <SortBtn k="kylon" label="Kylon" />}
              </th>
              <th className="px-3 py-3 text-right">
                {compact ? "Priority" : <SortBtn k="priority" label="Priority" />}
              </th>
              <th className="px-3 py-3 text-right">Ev.</th>
              {!compact && <th className="px-3 py-3">Why now</th>}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr
                key={a.id}
                className="group border-b border-line last:border-0 transition-colors hover:bg-surface-2"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/accounts/${a.id}`}
                    className="font-medium text-ink hover:text-nimble"
                  >
                    {a.name}
                  </Link>
                  <p className="text-[11.5px] text-faint">{a.industry}</p>
                </td>
                <td className="px-3 py-3">
                  <StagePill stage={a.stage} />
                </td>
                <td className="px-3 py-3 text-right">
                  <ScoreChip kind="nimble" value={a.nimble} />
                </td>
                <td className="px-3 py-3 text-right">
                  <ScoreChip kind="kylon" value={a.kylon} />
                </td>
                <td className="px-3 py-3 text-right tnum font-mono text-[14px] font-semibold">
                  {a.priority === 0 ? <span className="text-faint">—</span> : a.priority}
                </td>
                <td className="px-3 py-3 text-right tnum font-mono text-[13px] text-muted">
                  {a.evidenceCount || <span className="text-faint">—</span>}
                </td>
                {!compact && (
                  <td className="max-w-[220px] px-3 py-3 text-[12.5px] text-muted">
                    {a.whyNow}
                  </td>
                )}
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/accounts/${a.id}`}
                    aria-label={`Open ${a.name}`}
                    className="inline-flex text-faint transition-colors group-hover:text-nimble"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
