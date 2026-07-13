import type {
  Account,
  AccountAnalysis,
  AccountDossier,
  EvidenceRecord,
} from "../domain/types.js";

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export type NimbleEnrichment = {
  mode: "fixture" | "live" | "cached";
  evidence: EvidenceRecord[];
  rawResponseIds: string[];
  warnings: string[];
};

export interface NimbleProvider {
  readonly mode: "fixture" | "live";
  enrichKnownAccount(account: Account, questions: string[]): Promise<NimbleEnrichment>;
}

export type HydraRecall = {
  mode: "disabled" | "live";
  context: unknown[];
  warnings: string[];
};

export interface HydraProvider {
  readonly mode: "disabled" | "live";
  rememberAndRecall(dossier: AccountDossier): Promise<HydraRecall>;
}

export type KylonHandoff = {
  order: number;
  role:
    | "chief_of_staff"
    | "account_analyst"
    | "evidence_verifier"
    | "account_strategist";
  objective: string;
  inputReferences: string[];
};

export type KylonMissionPacket = {
  missionId: string;
  accountId: string;
  goal: string;
  handoffs: KylonHandoff[];
  scores: { nimble: number; kylon: number };
  playbook: AccountAnalysis["recommendedPlaybook"];
  evidenceIds: string[];
  proposedAction: AccountAnalysis["actions"][number] | null;
  approvalRequired: boolean;
};

export type KylonDelivery = {
  mode: "workspace" | "native";
  delivered: boolean;
  workspaceUrl: string;
  packet: KylonMissionPacket;
  warnings: string[];
};

export interface OrganizationProvider {
  readonly mode: "workspace" | "native";
  createMissionPacket(analysis: AccountAnalysis): Promise<KylonDelivery>;
}
