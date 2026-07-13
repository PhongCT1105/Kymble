import type {
  Account,
  AccountDossier,
  AnalysisRun,
  ApprovalDecision,
  Lifecycle,
} from "../domain/types.js";
import type { ClusterProfile } from "../fixtures/build-seed.js";

export type AccountFilters = {
  lifecycle?: Lifecycle | undefined;
  cluster?: string | undefined;
};

export interface CrmRepository {
  readonly mode: "fixture" | "insforge";
  listAccounts(filters?: AccountFilters): Promise<Account[]>;
  listClusters(): Promise<ClusterProfile[]>;
  getAccountDossier(accountId: string): Promise<AccountDossier>;
  saveAnalysisRun(run: AnalysisRun): Promise<void>;
  getRun(runId: string): Promise<AnalysisRun>;
  recordApprovalDecision(
    approvalId: string,
    decision: ApprovalDecision,
    note: string,
    decidedAt?: Date,
  ): Promise<AnalysisRun>;
}

export class RecordNotFoundError extends Error {
  constructor(recordType: string, id: string) {
    super(`${recordType} ${id} was not found`);
    this.name = "RecordNotFoundError";
  }
}
