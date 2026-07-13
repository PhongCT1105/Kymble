"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Check, Search, XCircle, ExternalLink,
  Lightbulb, Split, CalendarClock, Sparkles,
} from "lucide-react";
import { useMission } from "@/lib/mission/store";
import { ACCOUNT_DETAIL, RESULTS } from "@/lib/mock/accounts";
import { ScoreMeter } from "@/components/ui/score-meter";
import { ScoreBreakdown } from "@/components/evidence/score-breakdown";
import { ReceiptCard } from "@/components/evidence/receipt-card";
import { StagePill, TrustBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

const KYLON_WORKSPACE = "https://app.kylon.io/c/q_rBaZ_kIMG8yUdV2FpiISm-rfosOZkj";
const HERO = "acct-revpilot";

export default function EvidenceRoom() {
  const params = useParams<{ accountId: string }>();
  const id = params.accountId;

  const live = useMission((s) => s.accounts.find((a) => a.id === id));
  const phase = useMission((s) => s.phase);
  const approve = useMission((s) => s.approve);
  const simulateReply = useMission((s) => s.simulateReply);

  const detail = ACCOUNT_DETAIL[id];
  const result = RESULTS[id];

  if (!live || !detail || !result) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">Account not found.</p>
        <Link href="/pipeline" className="mt-3 inline-block text-nimble hover:underline">
          Back to pipeline
        </Link>
      </div>
    );
  }

  const isHero = id === HERO;
  const displayStage =
    live.stage === "approved" || live.stage === "opportunity_simulated"
      ? live.stage
      : result.stage;

  const canApprove = isHero && phase === "awaiting_approval";
  const canSimulate = isHero && phase === "approved";
  const approved = live.approved || phase === "approved" || phase === "replied";
  const opportunity = live.opportunity;

  const accepted = detail.evidence.filter((e) => e.status === "accepted");
  const weak = detail.evidence.filter((e) => e.status === "weak");
  const rejected = detail.evidence.filter((e) => e.status === "rejected");

  return (
    <div className="space-y-6">
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Pipeline
      </Link>

      {/* header */}
      <header className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-[26px] font-semibold tracking-tight">
                {live.name}
              </h1>
              <TrustBadge label="synthetic" />
            </div>
            <p className="mt-1 text-[13.5px] text-muted">
              {live.description} · {live.industry} · {live.employeeBand}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StagePill stage={displayStage} />
              <span className="rounded-full bg-canvas px-2.5 py-1 text-[11.5px] font-medium text-muted">
                Priority <span className="tnum font-mono font-semibold text-ink">{result.priority}</span>
              </span>
              <span className="text-[12.5px] text-muted">
                <span className="text-faint">Why now — </span>{result.whyNow}
              </span>
            </div>
          </div>
          <div className="w-full max-w-[240px] space-y-3 sm:w-auto sm:min-w-[220px]">
            <ScoreMeter kind="nimble" value={result.nimble} />
            <ScoreMeter kind="kylon" value={result.kylon} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* left — hypothesis, triggers, evidence */}
        <div className="space-y-6 lg:col-span-7">
          {/* hypothesis */}
          <section className="card p-5">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-inferred" />
              <h2 className="text-[14px] font-semibold">Buying hypothesis</h2>
            </div>
            <p className="text-[13.5px] leading-relaxed text-ink">{detail.hypothesis}</p>
            <div className="mt-3 border-t border-line pt-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-muted">
                <Split className="h-3.5 w-3.5" />
                Alternative explanations
              </p>
              <ul className="space-y-1">
                {detail.alternatives.map((alt, i) => (
                  <li key={i} className="text-[12.5px] text-muted">— {alt}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* triggers */}
          {detail.triggers.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-nimble" />
                <h2 className="text-[14px] font-semibold">Recent trigger timeline</h2>
              </div>
              <ol className="relative space-y-3 border-l border-line pl-5">
                {detail.triggers.map((t) => (
                  <li key={t.date} className="relative">
                    <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-nimble ring-4 ring-nimble-soft" />
                    <p className="tnum font-mono text-[11.5px] text-faint">{t.date}</p>
                    <p className="text-[13px] font-medium text-ink">{t.title}</p>
                    <p className="text-[11.5px] text-muted">{t.type.replace(/_/g, " ")}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* evidence */}
          <section className="space-y-4">
            <EvidenceGroup icon={<Check className="h-4 w-4 text-verified" />} title="Accepted evidence" count={accepted.length} items={accepted} />
            {weak.length > 0 && (
              <EvidenceGroup icon={<Search className="h-4 w-4 text-inferred" />} title="Weak signals" count={weak.length} items={weak} />
            )}
            {rejected.length > 0 && (
              <EvidenceGroup icon={<XCircle className="h-4 w-4 text-danger" />} title="Rejected" count={rejected.length} items={rejected} />
            )}
          </section>
        </div>

        {/* right — scores, play, controls */}
        <div className="space-y-5 lg:col-span-5">
          <ScoreBreakdown kind="nimble" lines={detail.nimbleBreakdown} total={result.nimble} />
          <ScoreBreakdown kind="kylon" lines={detail.kylonBreakdown} total={result.kylon} />

          {/* recommended play */}
          <div className="card p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-kylon" />
              <h3 className="text-[13px] font-semibold">Recommended play</h3>
            </div>
            {result.play ? (
              <p className="text-[14px] font-semibold text-ink">{result.play}</p>
            ) : (
              <p className="text-[13.5px] text-muted">
                No play — {live.name} is not a fit right now.
              </p>
            )}
          </div>

          {/* human controls */}
          <div className="card p-5">
            <h3 className="mb-1 text-[13px] font-semibold">Human decision</h3>
            <p className="mb-3 text-[12px] text-muted">
              Research is autonomous. This next action needs you.
            </p>

            {/* approve */}
            {approved ? (
              <div className="flex items-center gap-2 rounded-lg bg-verified-soft px-3 py-2.5 text-[13px] font-semibold text-verified">
                <CheckCircle2 className="h-4 w-4" />
                Next action approved · Kylon handoff confirmed
              </div>
            ) : (
              <button
                onClick={approve}
                disabled={!canApprove}
                className={cn(
                  "w-full rounded-lg px-4 py-2.5 text-[13.5px] font-semibold transition-all",
                  canApprove
                    ? "gradient-brand text-white shadow-raise hover:brightness-105 pulse-approve"
                    : "cursor-not-allowed bg-canvas text-faint",
                )}
              >
                Approve next action
              </button>
            )}
            {!approved && !canApprove && (
              <p className="mt-1.5 text-[11px] text-faint">
                {isHero
                  ? "Runs the mission first — approval unlocks when Kymble requests it."
                  : "This account is not the one awaiting approval in this mission."}
              </p>
            )}

            {/* simulate reply */}
            <button
              onClick={simulateReply}
              disabled={!canSimulate}
              className={cn(
                "mt-2 w-full rounded-lg border px-4 py-2.5 text-[13.5px] font-semibold transition-all",
                canSimulate
                  ? "border-nimble/30 bg-nimble-soft text-nimble hover:brightness-[0.98]"
                  : "cursor-not-allowed border-line bg-canvas text-faint",
              )}
            >
              {opportunity ? "Opportunity created (synthetic)" : "Simulate positive reply"}
            </button>
            {!canSimulate && !opportunity && (
              <p className="mt-1.5 text-[11px] text-faint">Enabled after you approve.</p>
            )}

            {/* secondary */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:text-ink">
                Request more research
              </button>
              <button className="rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:text-ink">
                Reject account
              </button>
            </div>
            <a
              href={KYLON_WORKSPACE}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-kylon/25 bg-kylon-soft px-3 py-2 text-[12.5px] font-medium text-kylon transition-colors hover:brightness-[0.98]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Kylon workspace
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceGroup({
  icon, title, count, items,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  items: import("@/lib/mock/accounts").EvidenceItem[];
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        {icon}
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
        <span className="tnum rounded-full bg-canvas px-2 py-0.5 font-mono text-[11px] text-muted">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((e) => (
          <ReceiptCard key={e.id} item={e} />
        ))}
      </div>
    </div>
  );
}
