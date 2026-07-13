import type {
  Account,
  AccountDossier,
  AnalysisRun,
  ApprovalDecision,
} from "../domain/types.js";
import { buildSeed, type SyntheticSeed } from "../fixtures/build-seed.js";
import {
  RecordNotFoundError,
  type AccountFilters,
  type CrmRepository,
} from "./crm-repository.js";

export class FixtureCrmRepository implements CrmRepository {
  readonly mode = "fixture" as const;
  readonly #seed: SyntheticSeed;
  readonly #runs = new Map<string, AnalysisRun>();

  constructor(seed = buildSeed()) {
    this.#seed = seed;
  }

  async listAccounts(filters: AccountFilters = {}): Promise<Account[]> {
    return this.#seed.accounts.filter((account) => {
      if (filters.lifecycle && account.lifecycle !== filters.lifecycle) return false;
      if (filters.cluster && this.#seed.accountCluster[account.id] !== filters.cluster) {
        return false;
      }
      return true;
    });
  }

  async listClusters() {
    return this.#seed.clusters.map((cluster) => ({ ...cluster }));
  }

  async getAccountDossier(accountId: string): Promise<AccountDossier> {
    const account = this.#seed.accounts.find((item) => item.id === accountId);
    if (!account) throw new RecordNotFoundError("Account", accountId);
    return {
      account,
      contacts: this.#seed.contacts.filter((item) => item.accountId === accountId),
      usage: this.#seed.usage.filter((item) => item.accountId === accountId),
      engagements: this.#seed.engagements.filter((item) => item.accountId === accountId),
      forms: this.#seed.forms.filter((item) => item.accountId === accountId),
      meetings: this.#seed.meetings.filter((item) => item.accountId === accountId),
      evidence: this.#seed.evidence.filter((item) => item.accountId === accountId),
    };
  }

  async saveAnalysisRun(run: AnalysisRun): Promise<void> {
    this.#runs.set(run.analysis.id, run);
  }

  async getRun(runId: string): Promise<AnalysisRun> {
    const run = this.#runs.get(runId);
    if (!run) throw new RecordNotFoundError("Analysis run", runId);
    return run;
  }

  async recordApprovalDecision(
    approvalId: string,
    decision: ApprovalDecision,
    note: string,
    decidedAt = new Date(),
  ): Promise<AnalysisRun> {
    const run = [...this.#runs.values()].find(
      (candidate) => candidate.approval?.id === approvalId,
    );
    if (!run?.approval) throw new RecordNotFoundError("Approval", approvalId);
    run.approval.status = decision;
    run.approval.decisionNote = note;
    run.approval.decidedAt = decidedAt.toISOString();
    run.audit.push({
      id: `event-${run.audit.length + 1}-${run.analysis.id}`,
      runId: run.analysis.id,
      accountId: run.analysis.accountId,
      occurredAt: decidedAt.toISOString(),
      type: "approval_decided",
      message: `Human decision recorded: ${decision}.`,
      trustLabel: "verified",
    });
    return run;
  }
}
