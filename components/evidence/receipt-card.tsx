import { Check, TriangleAlert, X, Link2 } from "lucide-react";
import type { EvidenceItem } from "@/lib/mock/accounts";
import { TrustBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

const STATUS_META = {
  accepted: { label: "Accepted", accent: "border-l-verified", chip: "bg-verified-soft text-verified", Icon: Check },
  weak: { label: "Weak", accent: "border-l-inferred", chip: "bg-inferred-soft text-[#b57708]", Icon: TriangleAlert },
  rejected: { label: "Rejected", accent: "border-l-danger", chip: "bg-danger-soft text-danger", Icon: X },
} as const;

function fmtDate(iso: string | null): string {
  if (!iso) return "no date";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

export function ReceiptCard({ item }: { item: EvidenceItem }) {
  const meta = STATUS_META[item.status];
  const rejected = item.status === "rejected";

  return (
    <div className="overflow-hidden rounded-[12px] bg-surface shadow-card">
      {/* perforated receipt edge */}
      <div className="receipt-edge h-2 w-full bg-canvas" />

      <div className={cn("border-l-[3px] px-4 pb-4 pt-3", meta.accent)}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[10.5px] uppercase tracking-wide text-faint">
            {item.signal}
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
              meta.chip,
            )}
          >
            <meta.Icon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>

        <p
          className={cn(
            "text-[14px] font-semibold leading-snug",
            rejected && "text-faint line-through decoration-danger/40",
          )}
        >
          {item.claim}
        </p>

        <p className="mt-1.5 border-l-2 border-line pl-2.5 text-[12.5px] italic leading-relaxed text-muted">
          “{item.excerpt}”
        </p>

        {item.reason && (
          <p className="mt-2 text-[11.5px] font-medium text-muted">
            <span className="text-faint">Note — </span>
            {item.reason}
          </p>
        )}

        {/* stamp row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-dashed border-line pt-2.5 font-mono text-[11px] text-faint">
          <span className="flex items-center gap-1 text-muted">
            <Link2 className="h-3 w-3" />
            {item.domain}
          </span>
          <span>·</span>
          <span>{item.sourceType}</span>
          <span>·</span>
          <span>pub {fmtDate(item.publishedAt)}</span>
          <span>·</span>
          <span>Nimble {fmtDate(item.retrievedAt)}</span>
          <span className="ml-auto">
            <TrustBadge label={item.trust} />
          </span>
        </div>
      </div>
    </div>
  );
}
