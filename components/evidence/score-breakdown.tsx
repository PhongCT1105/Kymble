import type { ScoreLine } from "@/lib/mock/accounts";
import { cn } from "@/lib/utils";

export function ScoreBreakdown({
  kind,
  lines,
  total,
}: {
  kind: "nimble" | "kylon";
  lines: ScoreLine[];
  total: number;
}) {
  const color = kind === "nimble" ? "text-nimble" : "text-kylon";
  const soft = kind === "nimble" ? "bg-nimble-soft" : "bg-kylon-soft";

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className={cn("text-[13px] font-semibold", color)}>
          {kind === "nimble" ? "Nimble fit" : "Kylon fit"}
        </h4>
        <span className={cn("tnum rounded-md px-2 py-0.5 font-mono text-[15px] font-bold", soft, color)}>
          {total}
        </span>
      </div>
      <ul className="space-y-1.5">
        {lines.map((l) => (
          <li key={l.label} className="flex items-center justify-between text-[12.5px]">
            <span className="text-muted">{l.label}</span>
            <span className="tnum font-mono font-medium text-ink">+{l.points}</span>
          </li>
        ))}
        <li className="mt-1 flex items-center justify-between border-t border-line pt-2 text-[12.5px] font-semibold">
          <span>Total</span>
          <span className={cn("tnum font-mono", color)}>{total}</span>
        </li>
      </ul>
    </div>
  );
}
