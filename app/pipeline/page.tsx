import { ChevronRight } from "lucide-react";
import { PipelineTable } from "@/components/pipeline/pipeline-table";
import { STAGE_FLOW, STAGE_LABEL } from "@/lib/domain/types";

export default function Pipeline() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[12.5px] font-medium uppercase tracking-wide text-nimble">Pipeline</p>
        <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight">
          Records moving through a real state machine
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] text-muted">
          Every account carries separate Nimble and Kylon scores. Sort by any of them —
          then open an account to see the receipts.
        </p>
      </header>

      {/* stage flow legend */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface p-3 text-[12px] font-medium text-muted">
        {STAGE_FLOW.map((s, i) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="rounded-md bg-canvas px-2 py-1">{STAGE_LABEL[s]}</span>
            {i < STAGE_FLOW.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-faint" />}
          </span>
        ))}
      </div>

      <PipelineTable />
    </div>
  );
}
