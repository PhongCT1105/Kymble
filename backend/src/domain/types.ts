export type TrustLabel = "verified" | "inferred" | "synthetic" | "cached";
export type Lifecycle =
  | "paying"
  | "trial"
  | "evaluator"
  | "dormant"
  | "expansion"
  | "rejected";
export type RecommendedPlaybook = "nimble" | "kylon" | "joint" | "none";

export type SignalKey =
  | "nimble_live_data_need"
  | "nimble_structured_extraction"
  | "nimble_scale"
  | "nimble_ai_dependency"
  | "nimble_reliability_pain"
  | "nimble_recent_trigger"
  | "kylon_multi_agent"
  | "kylon_fragmented_context"
  | "kylon_human_collaboration"
  | "kylon_governance"
  | "kylon_cross_functional"
  | "kylon_recent_trigger";

export type Account = {
  id: string;
  name: string;
  domain: string;
  lifecycle: Lifecycle;
  industry: string;
  employeeBand: string;
  currentProducts: Array<"nimble" | "kylon">;
  trustLabel: TrustLabel;
};

export type Contact = {
  id: string;
  accountId: string;
  fullName: string;
  title: string;
  email: string;
  trustLabel: TrustLabel;
};

export type UsageRecord = {
  id: string;
  accountId: string;
  product: "nimble" | "kylon" | "joint" | "other";
  occurredAt: string;
  metrics: Record<string, number>;
  interpretation: string;
  trustLabel: TrustLabel;
};

export type Engagement = {
  id: string;
  accountId: string;
  contactId?: string | undefined;
  type: string;
  occurredAt: string;
  details: string;
  trustLabel: TrustLabel;
};

export type FormSubmission = {
  id: string;
  accountId: string;
  contactId?: string | undefined;
  submittedAt: string;
  responses: Record<string, string>;
  trustLabel: TrustLabel;
};

export type MeetingRecord = {
  id: string;
  accountId: string;
  occurredAt: string;
  summary: string;
  openQuestions: string[];
  trustLabel: TrustLabel;
};

export type EvidenceRecord = {
  id: string;
  accountId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDomain: string;
  publishedAt: string | null;
  retrievedAt: string;
  excerpt: string;
  decision: "supported" | "weak" | "rejected";
  signalKeys: SignalKey[];
  trustLabel: TrustLabel;
};

export type AccountDossier = {
  account: Account;
  contacts: Contact[];
  usage: UsageRecord[];
  engagements: Engagement[];
  forms: FormSubmission[];
  meetings: MeetingRecord[];
  evidence: EvidenceRecord[];
};

export type ScoreContribution = {
  key: SignalKey;
  label: string;
  points: number;
  maximum: number;
  evidenceIds: string[];
  trustLabels: TrustLabel[];
};

export type SponsorScore = {
  total: number;
  maximum: 100;
  contributions: ScoreContribution[];
};

export type ProfileQuestion = {
  key:
    | "why_use_product"
    | "when_use_product"
    | "current_workflow"
    | "blocker_to_progress"
    | "decision_process";
  question: string;
  status: "answered" | "missing";
  answer: string | null;
  referenceIds: string[];
};

export type GtmActionType =
  | "diagnose_conversion_friction"
  | "expand_joint_adoption"
  | "capture_customer_proof"
  | "offer_nimble_reliability_audit"
  | "offer_kylon_readiness_map"
  | "request_missing_evidence"
  | "reactivate_with_new_trigger"
  | "document_disqualification";

export type GtmAction = {
  type: GtmActionType;
  title: string;
  rationale: string;
  sensitive: boolean;
  evidenceIds: string[];
};

export type AccountAnalysis = {
  id: string;
  accountId: string;
  analyzedAt: string;
  lifecycle: Lifecycle;
  recommendedPlaybook: RecommendedPlaybook;
  qualified: boolean;
  primaryClusterId: string;
  nimbleScore: SponsorScore;
  kylonScore: SponsorScore;
  profileQuestions: ProfileQuestion[];
  strongestEvidenceIds: string[];
  findings: string[];
  actions: GtmAction[];
  warnings: string[];
};

export type ApprovalDecision = "approved" | "rejected" | "more_research";

export type Approval = {
  id: string;
  runId: string;
  accountId: string;
  status: "pending" | ApprovalDecision;
  action: GtmAction;
  decidedAt: string | null;
  decisionNote: string | null;
};

export type AuditEvent = {
  id: string;
  runId: string;
  accountId: string;
  occurredAt: string;
  type: string;
  message: string;
  trustLabel: TrustLabel;
};

export type AnalysisRun = {
  analysis: AccountAnalysis;
  approval: Approval | null;
  audit: AuditEvent[];
  providerModes: {
    repository: "fixture" | "insforge";
    nimble: "fixture" | "live" | "cached";
    hydra: "disabled" | "live";
    kylon: "workspace" | "native";
  };
  providerWarnings: string[];
  kylonPacket: unknown;
};
