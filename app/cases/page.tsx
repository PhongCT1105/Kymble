import Link from "next/link";
import { ExternalLink, Quote, ArrowRight, Sparkles } from "lucide-react";
import { CASE_STUDIES, CUSTOMER_DNA, type CaseStudy } from "@/lib/mock/data";
import { TrustBadge } from "@/components/ui/badges";

function CaseCard({ study, primary }: { study: CaseStudy; primary?: boolean }) {
  return (
    <article
      className={
        "card p-5 " + (primary ? "ring-1 ring-nimble/30" : "")
      }
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="font-display text-[15px] font-semibold">{study.customer_name}</span>
        {primary && (
          <span className="rounded-full bg-nimble-soft px-2 py-0.5 text-[10.5px] font-semibold text-nimble">
            Learning from this
          </span>
        )}
        <TrustBadge label={study.trust_label} className="ml-auto" />
      </div>
      <p className="text-[13px] font-medium leading-snug text-ink">{study.title}</p>
      <a
        href={study.source_url}
        target="_blank"
        rel="noreferrer"
        className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-nimble hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        nimbleway.com case study
      </a>
      <ul className="mt-3 space-y-2">
        {study.verified_facts.map((f, i) => (
          <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
            <Quote className="mt-0.5 h-3 w-3 shrink-0 text-faint" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function CustomerProof() {
  const alta = CASE_STUDIES.find((c) => c.id === "nimble-alta")!;
  const others = CASE_STUDIES.filter((c) => c.id !== "nimble-alta");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[12.5px] font-medium uppercase tracking-wide text-nimble">
          Customer Proof
        </p>
        <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight">
          Start with a real win, not a persona
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] text-muted">
          Kymble reads a verified Nimble customer story and extracts the structured
          conditions behind the purchase. Everything inferred is labeled.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* left — the case */}
        <div className="space-y-4 lg:col-span-5">
          <CaseCard study={alta} primary />
          <p className="px-1 text-[12px] font-medium text-faint">
            Other verified stories in the library
          </p>
          {others.map((s) => (
            <CaseCard key={s.id} study={s} />
          ))}
        </div>

        {/* right — DNA */}
        <div className="lg:col-span-7">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-kylon" />
            <h2 className="font-display text-[17px] font-semibold">
              Customer DNA · Alta
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CUSTOMER_DNA.map((d) => (
              <div key={d.label} className="card p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10.5px] font-medium uppercase tracking-wide text-faint">
                    {d.label}
                  </span>
                  <TrustBadge label={d.trust} />
                </div>
                <p className="text-[13px] leading-relaxed text-ink">{d.value}</p>
              </div>
            ))}
          </div>

          <Link
            href="/signals"
            className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-3 text-[14px] font-semibold text-white shadow-raise transition-all hover:brightness-105"
          >
            Build the buying pattern
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
