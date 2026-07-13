"use client";

import { useMission } from "@/lib/mission/store";
import { CountUp } from "@/components/ui/count-up";
import { formatMoney } from "@/lib/utils";

export function KpiRow() {
  const kpis = useMission((s) => s.kpis);

  const tiles: { label: string; value: React.ReactNode }[] = [
    { label: "Cases learned", value: <CountUp value={kpis.casesLearned} /> },
    { label: "Candidates found", value: <CountUp value={kpis.candidates} /> },
    { label: "Evidence accepted", value: <CountUp value={kpis.evidenceAccepted} /> },
    { label: "Accounts qualified", value: <CountUp value={kpis.qualified} /> },
    { label: "Pending approvals", value: <CountUp value={kpis.pendingApprovals} /> },
    { label: "Pipeline (simulated)", value: formatMoney(kpis.pipelineValue) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => (
        <div key={t.label} className="card p-4">
          <p className="text-[11.5px] font-medium text-muted">{t.label}</p>
          <p className="tnum mt-1.5 font-display text-[26px] font-semibold leading-none">
            {t.value}
          </p>
        </div>
      ))}
    </div>
  );
}
