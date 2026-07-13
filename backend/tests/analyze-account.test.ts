import { describe, expect, it } from "vitest";

import { analyzeAccount } from "../src/domain/analyze-account.js";
import type { AccountDossier } from "../src/domain/types.js";

const jointSignals = [
  "nimble_live_data_need",
  "nimble_structured_extraction",
  "nimble_scale",
  "nimble_ai_dependency",
  "nimble_reliability_pain",
  "nimble_recent_trigger",
  "kylon_multi_agent",
  "kylon_fragmented_context",
  "kylon_human_collaboration",
  "kylon_governance",
  "kylon_cross_functional",
  "kylon_recent_trigger",
] as const;

function dossier(lifecycle: AccountDossier["account"]["lifecycle"]): AccountDossier {
  return {
    account: {
      id: `acct-${lifecycle}`,
      name: `${lifecycle} account`,
      domain: `${lifecycle}.example`,
      lifecycle,
      industry: "AI Software",
      employeeBand: "21-50",
      currentProducts: ["nimble", "kylon"],
      trustLabel: "synthetic",
    },
    contacts: [
      {
        id: `contact-${lifecycle}`,
        accountId: `acct-${lifecycle}`,
        fullName: "Taylor Morgan",
        title: "VP Product",
        email: `taylor@${lifecycle}.example`,
        trustLabel: "synthetic",
      },
    ],
    usage: [
      {
        id: `usage-${lifecycle}`,
        accountId: `acct-${lifecycle}`,
        product: "joint",
        occurredAt: "2026-07-10T10:00:00Z",
        metrics: { workflows: 8, approvals: 21, pages: 3400 },
        interpretation: "Coordinates research agents that require fresh web data.",
        trustLabel: "synthetic",
      },
    ],
    engagements: [],
    forms: [
      {
        id: `form-${lifecycle}`,
        accountId: `acct-${lifecycle}`,
        submittedAt: "2026-07-09T10:00:00Z",
        responses: {
          why_use_product: "Keep account-research agents current and coordinated.",
          when_use_product: "Before every outbound campaign.",
          current_workflow: "Research, messaging, and approval agents share one workflow.",
          blocker_to_convert:
            lifecycle === "trial" ? "Security review and unclear rollout ownership." : "none",
        },
        trustLabel: "synthetic",
      },
    ],
    meetings: [],
    evidence: [
      {
        id: `evidence-${lifecycle}-1`,
        accountId: `acct-${lifecycle}`,
        sourceUrl: `https://product-${lifecycle}.example/launch`,
        sourceTitle: "Agent workflow launch",
        sourceDomain: `product-${lifecycle}.example`,
        publishedAt: "2026-07-01T10:00:00Z",
        retrievedAt: "2026-07-13T10:00:00Z",
        excerpt: "Launched coordinated AI agents backed by live account intelligence.",
        decision: "supported",
        signalKeys: [...jointSignals],
        trustLabel: "verified",
      },
      {
        id: `evidence-${lifecycle}-2`,
        accountId: `acct-${lifecycle}`,
        sourceUrl: `https://jobs-${lifecycle}.example/platform`,
        sourceTitle: "Platform role",
        sourceDomain: `jobs-${lifecycle}.example`,
        publishedAt: "2026-06-20T10:00:00Z",
        retrievedAt: "2026-07-13T10:00:00Z",
        excerpt: "Hiring for reliable web extraction and human approval infrastructure.",
        decision: "supported",
        signalKeys: [...jointSignals],
        trustLabel: "verified",
      },
    ],
  };
}

describe("analyzeAccount", () => {
  it("gives a high-fit trial a conversion-friction action", () => {
    const analysis = analyzeAccount(dossier("trial"), new Date("2026-07-13T12:00:00Z"));

    expect(analysis.recommendedPlaybook).toBe("joint");
    expect(analysis.primaryClusterId).toBe("cluster-trial-friction");
    expect(analysis.actions[0]?.type).toBe("diagnose_conversion_friction");
    expect(analysis.profileQuestions.find((question) => question.key === "blocker_to_progress")?.status).toBe("answered");
  });

  it("gives a paying account an adoption and expansion action", () => {
    const analysis = analyzeAccount(dossier("paying"), new Date("2026-07-13T12:00:00Z"));

    expect(analysis.recommendedPlaybook).toBe("joint");
    expect(analysis.primaryClusterId).toBe("cluster-joint-agentic-gtm");
    expect(analysis.actions.map((action) => action.type)).toContain("expand_joint_adoption");
    expect(analysis.actions.map((action) => action.type)).not.toContain("diagnose_conversion_friction");
  });

  it("keeps a rejected account as a negative control even with apparent fit signals", () => {
    const analysis = analyzeAccount(dossier("rejected"), new Date("2026-07-13T12:00:00Z"));

    expect(analysis.qualified).toBe(false);
    expect(analysis.recommendedPlaybook).toBe("none");
    expect(analysis.primaryClusterId).toBe("cluster-negative-control");
    expect(analysis.actions[0]?.type).toBe("document_disqualification");
  });

  it("requires two independent public sources for qualification", () => {
    const input = dossier("trial");
    input.evidence[1] = {
      ...input.evidence[1]!,
      sourceDomain: input.evidence[0]!.sourceDomain,
    };

    const analysis = analyzeAccount(input, new Date("2026-07-13T12:00:00Z"));

    expect(analysis.qualified).toBe(false);
    expect(analysis.warnings).toContain("Qualification needs supported evidence from two independent public domains.");
  });

  it("can simulate qualification from synthetic evidence without presenting it as verified", () => {
    const input = dossier("trial");
    input.evidence = input.evidence.map((item) => ({
      ...item,
      trustLabel: "synthetic" as const,
    }));

    const analysis = analyzeAccount(input, new Date("2026-07-13T12:00:00Z"));

    expect(analysis.qualified).toBe(true);
    expect(analysis.warnings).toContain(
      "Qualification is a synthetic demo result and must not be presented as verified customer evidence.",
    );
  });
});
