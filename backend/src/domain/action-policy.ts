import type {
  AccountDossier,
  GtmAction,
  RecommendedPlaybook,
} from "./types.js";

function allEvidenceIds(dossier: AccountDossier): string[] {
  return dossier.evidence
    .filter((item) => item.decision === "supported")
    .slice(0, 4)
    .map((item) => item.id);
}

function trialBlocker(dossier: AccountDossier): string | null {
  const value = dossier.forms
    .map((form) => form.responses.blocker_to_convert)
    .find((answer) => answer && answer.toLowerCase() !== "none");
  return value ?? null;
}

export function recommendActions(
  dossier: AccountDossier,
  playbook: RecommendedPlaybook,
): GtmAction[] {
  const evidenceIds = allEvidenceIds(dossier);

  if (dossier.account.lifecycle === "rejected") {
    return [
      {
        type: "document_disqualification",
        title: "Keep this account as an ICP negative control",
        rationale: "The CRM marks this account rejected; preserve the evidence that explains why instead of forcing sponsor fit.",
        sensitive: false,
        evidenceIds,
      },
    ];
  }

  if (dossier.account.lifecycle === "trial" && trialBlocker(dossier)) {
    return [
      {
        type: "diagnose_conversion_friction",
        title: "Resolve the documented trial friction",
        rationale: `The product fit is promising, but the account named this blocker: ${trialBlocker(dossier)}`,
        sensitive: true,
        evidenceIds,
      },
    ];
  }

  if (dossier.account.lifecycle === "paying" && playbook === "joint") {
    return [
      {
        type: "expand_joint_adoption",
        title: "Map the next joint Nimble + Kylon workflow",
        rationale: "The account already pays and shows both live-intelligence and agent-coordination needs, so the decision is adoption expansion rather than conversion.",
        sensitive: true,
        evidenceIds,
      },
      {
        type: "capture_customer_proof",
        title: "Validate this pattern for a customer story",
        rationale: "The repeated use case can strengthen the cluster if the customer confirms the why, when, and measurable outcome.",
        sensitive: true,
        evidenceIds,
      },
    ];
  }

  if (dossier.account.lifecycle === "dormant") {
    return [
      {
        type: "reactivate_with_new_trigger",
        title: "Research whether a new trigger changes the dormant decision",
        rationale: "A dormant account should only be reactivated when new evidence changes the previous timing or priority.",
        sensitive: false,
        evidenceIds,
      },
    ];
  }

  if (playbook === "nimble") {
    return [
      {
        type: "offer_nimble_reliability_audit",
        title: "Prepare a web-intelligence reliability audit",
        rationale: "The strongest evidence supports a fresh, structured, high-volume web-data need.",
        sensitive: true,
        evidenceIds,
      },
    ];
  }

  if (playbook === "kylon") {
    return [
      {
        type: "offer_kylon_readiness_map",
        title: "Prepare an agent-organization readiness map",
        rationale: "The strongest evidence supports shared context, handoff, and human-governance needs.",
        sensitive: true,
        evidenceIds,
      },
    ];
  }

  if (playbook === "joint") {
    return [
      {
        type: "expand_joint_adoption",
        title: "Offer a joint architecture workshop",
        rationale: "Independent evidence supports both live-web intelligence and coordinated human-agent operations.",
        sensitive: true,
        evidenceIds,
      },
    ];
  }

  return [
    {
      type: "request_missing_evidence",
      title: "Answer the missing ICP questions",
      rationale: "The current record does not support a trustworthy sponsor-specific decision.",
      sensitive: false,
      evidenceIds,
    },
  ];
}
