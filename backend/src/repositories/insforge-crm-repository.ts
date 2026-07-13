import { createClient } from "@insforge/sdk";
import { z } from "zod";

import {
  accountAnalysisSchema,
  accountSchema,
  auditEventSchema,
  contactSchema,
  engagementSchema,
  evidenceRecordSchema,
  formSubmissionSchema,
  gtmActionSchema,
  meetingRecordSchema,
  usageRecordSchema,
} from "../domain/schemas.js";
import type {
  Account,
  AccountDossier,
  AnalysisRun,
  Approval,
  ApprovalDecision,
} from "../domain/types.js";
import type { ClusterProfile, SyntheticSeed } from "../fixtures/build-seed.js";
import {
  RecordNotFoundError,
  type AccountFilters,
  type CrmRepository,
} from "./crm-repository.js";

export interface InsforgeGateway {
  select(table: string, filters?: Record<string, unknown>): Promise<unknown[]>;
  insert(table: string, records: unknown[]): Promise<void>;
  update(
    table: string,
    values: Record<string, unknown>,
    filters: Record<string, unknown>,
  ): Promise<unknown[]>;
}

export class InsforgeSdkGateway implements InsforgeGateway {
  readonly #client: ReturnType<typeof createClient>;

  constructor(config: { baseUrl: string; anonKey: string }) {
    this.#client = createClient(config);
  }

  async select(table: string, filters: Record<string, unknown> = {}): Promise<unknown[]> {
    let query: any = this.#client.database.from(table).select();
    for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async insert(table: string, records: unknown[]): Promise<void> {
    if (records.length === 0) return;
    const { error } = await this.#client.database.from(table).insert(records as any[]);
    if (error) throw error;
  }

  async update(
    table: string,
    values: Record<string, unknown>,
    filters: Record<string, unknown>,
  ): Promise<unknown[]> {
    let query: any = this.#client.database.from(table).update(values);
    for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
    const { data, error } = await query.select();
    if (error) throw error;
    return data ?? [];
  }
}

export async function seedInsforge(gateway: InsforgeGateway, seed: SyntheticSeed) {
  const batches: Array<[string, unknown[]]> = [
    [
      "icp_clusters",
      seed.clusters.map((cluster) => ({
        id: cluster.id,
        name: cluster.name,
        description: cluster.description,
        recommended_playbook: cluster.recommendedPlaybook,
      })),
    ],
    [
      "accounts",
      seed.accounts.map((account) => ({
        id: account.id,
        name: account.name,
        domain: account.domain,
        lifecycle: account.lifecycle,
        industry: account.industry,
        employee_band: account.employeeBand,
        current_products: account.currentProducts,
        trust_label: account.trustLabel,
        primary_cluster_id: seed.accountCluster[account.id] ?? null,
      })),
    ],
    [
      "contacts",
      seed.contacts.map((payload) => ({
        id: payload.id,
        account_id: payload.accountId,
        payload,
      })),
    ],
    [
      "usage_records",
      seed.usage.map((payload) => ({
        id: payload.id,
        account_id: payload.accountId,
        payload,
      })),
    ],
    [
      "engagements",
      seed.engagements.map((payload) => ({
        id: payload.id,
        account_id: payload.accountId,
        payload,
      })),
    ],
    [
      "form_submissions",
      seed.forms.map((payload) => ({
        id: payload.id,
        account_id: payload.accountId,
        payload,
      })),
    ],
    [
      "meetings",
      seed.meetings.map((payload) => ({
        id: payload.id,
        account_id: payload.accountId,
        payload,
      })),
    ],
    [
      "evidence_items",
      seed.evidence.map((payload) => ({
        id: payload.id,
        account_id: payload.accountId,
        payload,
      })),
    ],
  ];
  for (const [table, records] of batches) await gateway.insert(table, records);
  const counts = {
    clusters: seed.clusters.length,
    accounts: seed.accounts.length,
    contacts: seed.contacts.length,
    usage: seed.usage.length,
    engagements: seed.engagements.length,
    forms: seed.forms.length,
    meetings: seed.meetings.length,
    evidence: seed.evidence.length,
  };
  return {
    ...counts,
    total: Object.values(counts).reduce((sum, count) => sum + count, 0),
  };
}

const accountRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  lifecycle: z.enum(["paying", "trial", "evaluator", "dormant", "expansion", "rejected"]),
  industry: z.string(),
  employee_band: z.string(),
  current_products: z.array(z.enum(["nimble", "kylon"])),
  trust_label: z.enum(["verified", "inferred", "synthetic", "cached"]),
  primary_cluster_id: z.string().nullable().optional(),
});

const payloadRowSchema = z.object({ payload: z.unknown() });
const clusterRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  recommended_playbook: z.enum(["nimble", "kylon", "joint", "none"]),
});
const runRowSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  analysis_json: z.unknown(),
  provider_modes_json: z.unknown(),
  provider_warnings_json: z.unknown(),
  kylon_packet_json: z.unknown(),
});
const approvalRowSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  account_id: z.string(),
  status: z.enum(["pending", "approved", "rejected", "more_research"]),
  action_json: z.unknown(),
  decided_at: z.string().nullable(),
  decision_note: z.string().nullable(),
});
const providerModesSchema = z.object({
  repository: z.enum(["fixture", "insforge"]),
  nimble: z.enum(["fixture", "live", "cached"]),
  hydra: z.enum(["disabled", "live"]),
  kylon: z.enum(["workspace", "native"]),
});

function mapAccount(row: unknown): Account {
  const parsed = accountRowSchema.parse(row);
  return accountSchema.parse({
    id: parsed.id,
    name: parsed.name,
    domain: parsed.domain,
    lifecycle: parsed.lifecycle,
    industry: parsed.industry,
    employeeBand: parsed.employee_band,
    currentProducts: parsed.current_products,
    trustLabel: parsed.trust_label,
  });
}

function parsePayloads<T>(rows: unknown[], schema: z.ZodType<T>): T[] {
  return rows.map((row) => schema.parse(payloadRowSchema.parse(row).payload));
}

export class InsforgeCrmRepository implements CrmRepository {
  readonly mode = "insforge" as const;

  constructor(private readonly gateway: InsforgeGateway) {}

  static fromConfig(config: { baseUrl: string; anonKey: string }) {
    return new InsforgeCrmRepository(new InsforgeSdkGateway(config));
  }

  async listAccounts(filters: AccountFilters = {}): Promise<Account[]> {
    const query: Record<string, unknown> = {};
    if (filters.lifecycle) query.lifecycle = filters.lifecycle;
    if (filters.cluster) query.primary_cluster_id = filters.cluster;
    return (await this.gateway.select("accounts", query)).map(mapAccount);
  }

  async listClusters(): Promise<ClusterProfile[]> {
    return (await this.gateway.select("icp_clusters")).map((row) => {
      const parsed = clusterRowSchema.parse(row);
      return {
        id: parsed.id,
        name: parsed.name,
        description: parsed.description,
        recommendedPlaybook: parsed.recommended_playbook,
      };
    });
  }

  async getAccountDossier(accountId: string): Promise<AccountDossier> {
    const [accounts, contacts, usage, engagements, forms, meetings, evidence] =
      await Promise.all([
        this.gateway.select("accounts", { id: accountId }),
        this.gateway.select("contacts", { account_id: accountId }),
        this.gateway.select("usage_records", { account_id: accountId }),
        this.gateway.select("engagements", { account_id: accountId }),
        this.gateway.select("form_submissions", { account_id: accountId }),
        this.gateway.select("meetings", { account_id: accountId }),
        this.gateway.select("evidence_items", { account_id: accountId }),
      ]);
    if (!accounts[0]) throw new RecordNotFoundError("Account", accountId);
    return {
      account: mapAccount(accounts[0]),
      contacts: parsePayloads(contacts, contactSchema),
      usage: parsePayloads(usage, usageRecordSchema),
      engagements: parsePayloads(engagements, engagementSchema),
      forms: parsePayloads(forms, formSubmissionSchema),
      meetings: parsePayloads(meetings, meetingRecordSchema),
      evidence: parsePayloads(evidence, evidenceRecordSchema),
    };
  }

  async saveAnalysisRun(run: AnalysisRun): Promise<void> {
    await this.gateway.insert("analysis_runs", [
      {
        id: run.analysis.id,
        account_id: run.analysis.accountId,
        analysis_json: run.analysis,
        provider_modes_json: run.providerModes,
        provider_warnings_json: run.providerWarnings,
        kylon_packet_json: run.kylonPacket,
        created_at: run.analysis.analyzedAt,
      },
    ]);
    if (run.approval) {
      await this.gateway.insert("approvals", [
        {
          id: run.approval.id,
          run_id: run.approval.runId,
          account_id: run.approval.accountId,
          status: run.approval.status,
          action_json: run.approval.action,
          decided_at: run.approval.decidedAt,
          decision_note: run.approval.decisionNote,
        },
      ]);
    }
    await this.gateway.insert(
      "audit_events",
      run.audit.map((event) => ({
        id: event.id,
        run_id: event.runId,
        account_id: event.accountId,
        occurred_at: event.occurredAt,
        payload: event,
      })),
    );
  }

  async getRun(runId: string): Promise<AnalysisRun> {
    const rows = await this.gateway.select("analysis_runs", { id: runId });
    if (!rows[0]) throw new RecordNotFoundError("Analysis run", runId);
    const row = runRowSchema.parse(rows[0]);
    const [approvalRows, auditRows] = await Promise.all([
      this.gateway.select("approvals", { run_id: runId }),
      this.gateway.select("audit_events", { run_id: runId }),
    ]);
    const approval = approvalRows[0]
      ? (() => {
          const parsed = approvalRowSchema.parse(approvalRows[0]);
          return {
            id: parsed.id,
            runId: parsed.run_id,
            accountId: parsed.account_id,
            status: parsed.status,
            action: gtmActionSchema.parse(parsed.action_json),
            decidedAt: parsed.decided_at,
            decisionNote: parsed.decision_note,
          } satisfies Approval;
        })()
      : null;
    return {
      analysis: accountAnalysisSchema.parse(row.analysis_json),
      approval,
      audit: parsePayloads(auditRows, auditEventSchema),
      providerModes: providerModesSchema.parse(row.provider_modes_json),
      providerWarnings: z.array(z.string()).parse(row.provider_warnings_json),
      kylonPacket: row.kylon_packet_json,
    };
  }

  async recordApprovalDecision(
    approvalId: string,
    decision: ApprovalDecision,
    note: string,
    decidedAt = new Date(),
  ): Promise<AnalysisRun> {
    const rows = await this.gateway.update(
      "approvals",
      {
        status: decision,
        decision_note: note,
        decided_at: decidedAt.toISOString(),
      },
      { id: approvalId },
    );
    const updated = rows[0] ? approvalRowSchema.parse(rows[0]) : null;
    if (!updated) throw new RecordNotFoundError("Approval", approvalId);
    await this.gateway.insert("audit_events", [
      {
        id: `event-approval-${approvalId}-${decidedAt.valueOf()}`,
        run_id: updated.run_id,
        account_id: updated.account_id,
        occurred_at: decidedAt.toISOString(),
        payload: {
          id: `event-approval-${approvalId}-${decidedAt.valueOf()}`,
          runId: updated.run_id,
          accountId: updated.account_id,
          occurredAt: decidedAt.toISOString(),
          type: "approval_decided",
          message: `Human decision recorded: ${decision}.`,
          trustLabel: "verified",
        },
      },
    ]);
    return this.getRun(updated.run_id);
  }
}
