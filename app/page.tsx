import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MissionHero } from "@/components/mission/mission-hero";
import { OrgStrip } from "@/components/agents/org-strip";
import { KpiRow } from "@/components/kpi/kpi-row";
import { ActivityConsole } from "@/components/activity/activity-console";
import { PipelineTable } from "@/components/pipeline/pipeline-table";

function SectionHead({
  title,
  hint,
  href,
  cta,
}: {
  title: string;
  hint?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="font-display text-[17px] font-semibold">{title}</h2>
        {hint && <p className="text-[12.5px] text-muted">{hint}</p>}
      </div>
      {href && cta && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-nimble transition-all hover:gap-1.5"
        >
          {cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function CommandCenter() {
  return (
    <div className="space-y-8">
      <MissionHero />

      <section>
        <SectionHead
          title="Your AI GTM team"
          hint="Six coworkers. Research is autonomous — the next action waits for you."
        />
        <OrgStrip />
      </section>

      <section>
        <SectionHead title="Business metrics" hint="Updates as the mission runs." />
        <KpiRow />
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="card overflow-hidden lg:col-span-5">
          <ActivityConsole />
        </div>
        <div className="lg:col-span-7">
          <SectionHead
            title="Pipeline snapshot"
            hint="Records moving through a real state machine."
            href="/pipeline"
            cta="Open pipeline"
          />
          <PipelineTable compact />
        </div>
      </section>
    </div>
  );
}
