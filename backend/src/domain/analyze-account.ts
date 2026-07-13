import { createHash } from "node:crypto";

import { recommendActions } from "./action-policy.js";
import type {
  AccountAnalysis,
  AccountDossier,
  ProfileQuestion,
  RecommendedPlaybook,
  ScoreContribution,
  SignalKey,
  SponsorScore,
} from "./types.js";

const NIMBLE_WEIGHTS: Array<[SignalKey, string, number]> = [
  ["nimble_live_data_need", "Live or frequently changing data need", 20],
  ["nimble_structured_extraction", "Structured page-level extraction need", 20],
  ["nimble_scale", "High-volume or multi-source workflow", 20],
  ["nimble_ai_dependency", "AI-agent or data-product dependency", 15],
  ["nimble_reliability_pain", "Freshness or reliability pain", 15],
  ["nimble_recent_trigger", "Recent urgency trigger", 10],
];

const KYLON_WEIGHTS: Array<[SignalKey, string, number]> = [
  ["kylon_multi_agent", "Multiple agents or AI workflows", 20],
  ["kylon_fragmented_context", "Context spread across systems", 20],
  ["kylon_human_collaboration", "Human-agent collaboration need", 20],
  ["kylon_governance", "Approval or governance requirement", 15],
  ["kylon_cross_functional", "Cross-functional automation", 15],
  ["kylon_recent_trigger", "Recent AI-organization trigger", 10],
];

function score(
  dossier: AccountDossier,
  weights: Array<[SignalKey, string, number]>,
): SponsorScore {
  const contributions: ScoreContribution[] = weights.map(([key, label, maximum]) => {
    const matching = dossier.evidence.filter(
      (item) => item.decision === "supported" && item.signalKeys.includes(key),
    );
    return {
      key,
      label,
      points: matching.length > 0 ? maximum : 0,
      maximum,
      evidenceIds: matching.map((item) => item.id),
      trustLabels: [...new Set(matching.map((item) => item.trustLabel))],
    };
  });
  return {
    total: contributions.reduce((sum, contribution) => sum + contribution.points, 0),
    maximum: 100,
    contributions,
  };
}

function firstFormAnswer(dossier: AccountDossier, key: string): [string, string] | null {
  for (const form of dossier.forms) {
    const answer = form.responses[key];
    if (answer?.trim()) return [answer.trim(), form.id];
  }
  return null;
}

function profileQuestions(dossier: AccountDossier): ProfileQuestion[] {
  const specs: Array<{
    key: ProfileQuestion["key"];
    question: string;
    responseKey?: string;
    fallback?: () => [string, string] | null;
  }> = [
    {
      key: "why_use_product",
      question: "Why is this account using or evaluating the product?",
      responseKey: "why_use_product",
    },
    {
      key: "when_use_product",
      question: "When does the product enter the account's workflow?",
      responseKey: "when_use_product",
      fallback: () =>
        dossier.usage[0]
          ? [dossier.usage[0].interpretation, dossier.usage[0].id]
          : null,
    },
    {
      key: "current_workflow",
      question: "What workflow and systems surround the product?",
      responseKey: "current_workflow",
      fallback: () =>
        dossier.meetings[0]
          ? [dossier.meetings[0].summary, dossier.meetings[0].id]
          : null,
    },
    {
      key: "blocker_to_progress",
      question: "What blocks conversion, adoption, or expansion?",
      responseKey: "blocker_to_convert",
    },
    {
      key: "decision_process",
      question: "Who decides and what must be true for the next commitment?",
      responseKey: "decision_process",
      fallback: () =>
        dossier.meetings[0]
          ? [dossier.meetings[0].summary, dossier.meetings[0].id]
          : null,
    },
  ];

  return specs.map((spec) => {
    const direct = spec.responseKey
      ? firstFormAnswer(dossier, spec.responseKey)
      : null;
    const answer = direct ?? spec.fallback?.() ?? null;
    return {
      key: spec.key,
      question: spec.question,
      status: answer ? "answered" : "missing",
      answer: answer?.[0] ?? null,
      referenceIds: answer ? [answer[1]] : [],
    };
  });
}

function selectPlaybook(
  dossier: AccountDossier,
  nimbleScore: number,
  kylonScore: number,
  evidenceGate: boolean,
): RecommendedPlaybook {
  if (dossier.account.lifecycle === "rejected" || !evidenceGate) return "none";
  if (nimbleScore >= 70 && kylonScore >= 70) return "joint";
  if (nimbleScore >= 65) return "nimble";
  if (kylonScore >= 65) return "kylon";
  return "none";
}

function selectCluster(
  dossier: AccountDossier,
  playbook: RecommendedPlaybook,
): string {
  if (dossier.account.lifecycle === "rejected") return "cluster-negative-control";
  const hasTrialBlocker = dossier.forms.some((form) => {
    const blocker = form.responses.blocker_to_convert?.toLowerCase();
    return blocker && blocker !== "none";
  });
  if (dossier.account.lifecycle === "trial" && hasTrialBlocker) {
    return "cluster-trial-friction";
  }
  if (dossier.account.lifecycle === "expansion") return "cluster-expansion";
  if (playbook === "joint") return "cluster-joint-agentic-gtm";
  if (playbook === "nimble") return "cluster-nimble-web-intelligence";
  if (playbook === "kylon") return "cluster-kylon-agent-operations";
  return "cluster-insufficient-evidence";
}

export function analyzeAccount(dossier: AccountDossier, now = new Date()): AccountAnalysis {
  const nimbleScore = score(dossier, NIMBLE_WEIGHTS);
  const kylonScore = score(dossier, KYLON_WEIGHTS);
  const supportedPublic = dossier.evidence.filter(
    (item) => item.decision === "supported",
  );
  const independentDomains = new Set(supportedPublic.map((item) => item.sourceDomain));
  const recentCutoff = new Date(now);
  recentCutoff.setUTCDate(recentCutoff.getUTCDate() - 180);
  const hasRecentEvidence = supportedPublic.some((item) => {
    const date = item.publishedAt ? new Date(item.publishedAt) : null;
    return date !== null && !Number.isNaN(date.valueOf()) && date >= recentCutoff;
  });
  const evidenceGate =
    supportedPublic.length >= 2 && independentDomains.size >= 2 && hasRecentEvidence;
  const recommendedPlaybook = selectPlaybook(
    dossier,
    nimbleScore.total,
    kylonScore.total,
    evidenceGate,
  );
  const questions = profileQuestions(dossier);
  const warnings: string[] = [];
  if (
    supportedPublic.length > 0 &&
    supportedPublic.every((item) => item.trustLabel === "synthetic")
  ) {
    warnings.push(
      "Qualification is a synthetic demo result and must not be presented as verified customer evidence.",
    );
  }
  if (supportedPublic.length < 2 || independentDomains.size < 2) {
    warnings.push(
      "Qualification needs supported evidence from two independent public domains.",
    );
  }
  if (!hasRecentEvidence) {
    warnings.push("Qualification needs a recent public trigger from the last 180 days.");
  }
  const missing = questions.filter((question) => question.status === "missing");
  if (missing.length > 0) {
    warnings.push(
      `Profile still has ${missing.length} unanswered question${missing.length === 1 ? "" : "s"}.`,
    );
  }

  const idSeed = `${dossier.account.id}:${now.toISOString()}`;
  const id = `run-${createHash("sha256").update(idSeed).digest("hex").slice(0, 12)}`;
  const strongestEvidenceIds = supportedPublic.slice(0, 4).map((item) => item.id);
  const qualified = recommendedPlaybook !== "none";
  const findings = [
    `${dossier.account.name} is a ${dossier.account.lifecycle} account with ${dossier.contacts.length} known contact${dossier.contacts.length === 1 ? "" : "s"}.`,
    `Deterministic fit is Nimble ${nimbleScore.total}/100 and Kylon ${kylonScore.total}/100.`,
    qualified
      ? `${supportedPublic.length} supported public items across ${independentDomains.size} domains justify the ${recommendedPlaybook} playbook.`
      : "The current record does not clear the evidence and fit gates for a sponsor-specific playbook.",
  ];
  const actions = recommendActions(dossier, recommendedPlaybook);

  return {
    id,
    accountId: dossier.account.id,
    analyzedAt: now.toISOString(),
    lifecycle: dossier.account.lifecycle,
    recommendedPlaybook,
    qualified,
    primaryClusterId: selectCluster(dossier, recommendedPlaybook),
    nimbleScore,
    kylonScore,
    profileQuestions: questions,
    strongestEvidenceIds,
    findings,
    actions,
    warnings,
  };
}
