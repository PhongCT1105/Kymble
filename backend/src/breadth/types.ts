// Breadth + causal-graph domain types for ICP enrichment.
// Sits on top of the existing depth pipeline (analyze-account.ts) without changing it.
import type {
  Account,
  EvidenceRecord,
  SignalKey,
  TrustLabel,
} from "../domain/types.js";
import type { ClusterProfile } from "../fixtures/build-seed.js";

/** A company found OUTSIDE the CRM that resembles a cluster's ICP. */
export type LookalikeCandidate = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employeeBand: string;
  linkedinUrl: string | null;
  sourceClusterId: string;
  /** Which discovery source produced it, for auditability. */
  discoverySource: "apollo" | "exa" | "fixture";
  trustLabel: TrustLabel;
};

/** Result of scoring a candidate through the EXISTING deterministic scorer. */
export type ScoredCandidate = {
  candidate: LookalikeCandidate;
  nimbleScore: number;
  kylonScore: number;
  matchedSignals: SignalKey[];
  evidence: EvidenceRecord[];
  /** True only if it clears the same evidence gate real accounts must clear. */
  qualifiesForOutreach: boolean;
  warnings: string[];
};

// ---- Causal knowledge graph ----

export type CausalNodeType =
  | "ICP_Cluster"
  | "Account"
  | "PainPoint"
  | "BuyingReason" // why they bought
  | "ExpansionBlocker" // why they don't spend more / stay on free
  | "TriggerEvent" // event that preceded use/upgrade
  | "Capability" // product feature addressing the pain
  | "Evidence";

export type CausalNode = {
  id: string;
  type: CausalNodeType;
  label: string;
  clusterId: string;
  trustLabel: TrustLabel;
  /** Backing evidence/source ids from the dossier or live-web fetch. */
  sourceIds: string[];
};

export type CausalEdgeType =
  | "addressed_by" // PainPoint -> Capability
  | "precedes" // TriggerEvent -> BuyingReason
  | "blocks" // ExpansionBlocker -> Upgrade
  | "supported_by" // any claim -> Evidence
  | "belongs_to"; // Account -> ICP_Cluster

export type CausalEdge = {
  id: string;
  from: string;
  to: string;
  type: CausalEdgeType;
  trustLabel: TrustLabel;
};

export type CausalGraph = {
  clusterId: string;
  nodes: CausalNode[];
  edges: CausalEdge[];
  warnings: string[];
};

export type { Account, ClusterProfile };
