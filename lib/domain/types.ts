export type TrustLabel = "verified" | "inferred" | "synthetic" | "cached";

export type Playbook = "nimble" | "kylon" | "joint";

export type PipelineStage =
  | "discovered"
  | "researching"
  | "evidence_ready"
  | "qualified"
  | "strategy_ready"
  | "human_review"
  | "approved"
  | "opportunity_simulated"
  | "rejected";

export const STAGE_LABEL: Record<PipelineStage, string> = {
  discovered: "Discovered",
  researching: "Researching",
  evidence_ready: "Evidence ready",
  qualified: "Qualified",
  strategy_ready: "Strategy ready",
  human_review: "Human review",
  approved: "Approved",
  opportunity_simulated: "Opportunity",
  rejected: "Rejected",
};

/** Ordered flow used for the pipeline progress rail. */
export const STAGE_FLOW: PipelineStage[] = [
  "discovered",
  "researching",
  "evidence_ready",
  "qualified",
  "human_review",
];

export type AgentId =
  | "chief"
  | "case"
  | "signal"
  | "scout"
  | "verifier"
  | "strategist";

export type AgentState =
  | "waiting"
  | "running"
  | "completed"
  | "blocked"
  | "needs_approval";

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  blurb: string;
  state: AgentState;
}

export type MissionPhase =
  | "idle"
  | "running"
  | "awaiting_approval"
  | "approved"
  | "replied";

export interface ActivityLine {
  id: number;
  time: string;
  agent: AgentId;
  text: string;
}

export interface LiveAccount {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employeeBand: string;
  description: string;
  stage: PipelineStage;
  nimble: number;
  kylon: number;
  priority: number;
  evidenceCount: number;
  whyNow: string;
  play: string | null;
  decision: "qualify" | "reject" | "pending";
  approved: boolean;
  opportunity: boolean;
}

export interface Kpis {
  casesLearned: number;
  candidates: number;
  evidenceAccepted: number;
  qualified: number;
  pendingApprovals: number;
  pipelineValue: number;
}
