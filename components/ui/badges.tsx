import type { PipelineStage, TrustLabel } from "@/lib/domain/types";
import { STAGE_LABEL } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------- trust badge */

const TRUST: Record<
  TrustLabel,
  { short: string; long: string; text: string; bg: string; dot: string }
> = {
  verified: {
    short: "Verified", long: "Verified public source",
    text: "text-verified", bg: "bg-verified-soft", dot: "bg-verified",
  },
  inferred: {
    short: "Inferred", long: "Inferred, not directly stated",
    text: "text-[#b57708]", bg: "bg-inferred-soft", dot: "bg-inferred",
  },
  synthetic: {
    short: "Synthetic", long: "Synthetic demo record",
    text: "text-synthetic", bg: "bg-synthetic-soft", dot: "bg-synthetic",
  },
  cached: {
    short: "Cached", long: "Cached from a previous live retrieval",
    text: "text-cached", bg: "bg-cached-soft", dot: "bg-cached",
  },
};

export function TrustBadge({
  label,
  full = false,
  className,
}: {
  label: TrustLabel;
  full?: boolean;
  className?: string;
}) {
  const t = TRUST[label];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        t.bg,
        t.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {full ? t.long : t.short}
    </span>
  );
}

/* ------------------------------------------------------------ stage pill */

const STAGE_STYLE: Record<PipelineStage, string> = {
  discovered: "bg-canvas text-faint border-line",
  researching: "bg-nimble-soft text-nimble border-nimble/20",
  evidence_ready: "bg-nimble-soft text-nimble border-nimble/20",
  qualified: "bg-verified-soft text-verified border-verified/20",
  strategy_ready: "bg-kylon-soft text-kylon border-kylon/20",
  human_review: "bg-inferred-soft text-[#b57708] border-inferred/30",
  approved: "bg-verified-soft text-verified border-verified/30",
  opportunity_simulated: "bg-verified-soft text-verified border-verified/40",
  rejected: "bg-danger-soft text-danger border-danger/20",
};

export function StagePill({
  stage,
  className,
}: {
  stage: PipelineStage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11.5px] font-medium",
        STAGE_STYLE[stage],
        className,
      )}
    >
      {STAGE_LABEL[stage]}
    </span>
  );
}
