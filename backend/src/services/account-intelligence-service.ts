import { analyzeAccount } from "../domain/analyze-account.js";
import type {
  AnalysisRun,
  Approval,
  AuditEvent,
} from "../domain/types.js";
import type { HydraProvider, NimbleProvider, OrganizationProvider } from "../providers/types.js";
import type { CrmRepository } from "../repositories/crm-repository.js";

export class AccountIntelligenceService {
  constructor(
    private readonly repository: CrmRepository,
    private readonly nimble: NimbleProvider,
    private readonly hydra: HydraProvider,
    private readonly kylon: OrganizationProvider,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async analyzeKnownAccount(
    accountId: string,
    options: { enrich: boolean; questions: string[] },
  ): Promise<AnalysisRun> {
    const dossier = await this.repository.getAccountDossier(accountId);
    const audit: AuditEvent[] = [];
    const addAudit = (
      type: string,
      message: string,
      trustLabel: AuditEvent["trustLabel"] = "verified",
    ) => {
      audit.push({
        id: `event-${audit.length + 1}-${accountId}-${this.now().valueOf()}`,
        runId: "pending",
        accountId,
        occurredAt: this.now().toISOString(),
        type,
        message,
        trustLabel,
      });
    };

    addAudit("analysis_started", `Started known-account analysis for ${dossier.account.name}.`);

    const nimbleResult = options.enrich
      ? await this.nimble.enrichKnownAccount(dossier.account, options.questions)
      : {
          mode: this.nimble.mode,
          evidence: [],
          rawResponseIds: [],
          warnings: ["Nimble enrichment was not requested for this run."],
        };
    dossier.evidence.push(...nimbleResult.evidence);
    addAudit(
      "nimble_enrichment",
      options.enrich
        ? `Nimble returned ${nimbleResult.evidence.length} account-scoped source${nimbleResult.evidence.length === 1 ? "" : "s"}.`
        : "Used the existing CRM evidence without a new Nimble request.",
      options.enrich ? "verified" : "synthetic",
    );

    const hydraResult = await this.hydra.rememberAndRecall(dossier);
    addAudit(
      "memory_recall",
      hydraResult.mode === "live"
        ? `HydraDB recalled ${hydraResult.context.length} context item${hydraResult.context.length === 1 ? "" : "s"}.`
        : "HydraDB is disabled; used the current dossier only.",
    );

    const analysis = analyzeAccount(dossier, this.now());
    for (const event of audit) event.runId = analysis.id;
    addAudit(
      "analysis_completed",
      `Calculated Nimble ${analysis.nimbleScore.total}/100, Kylon ${analysis.kylonScore.total}/100, playbook ${analysis.recommendedPlaybook}.`,
      "inferred",
    );
    audit[audit.length - 1]!.runId = analysis.id;

    const kylonResult = await this.kylon.createMissionPacket(analysis);
    addAudit(
      "kylon_packet_created",
      kylonResult.delivered
        ? "Delivered the structured mission packet through the configured Kylon integration."
        : "Created a copy-ready Kylon workspace mission packet.",
    );
    audit[audit.length - 1]!.runId = analysis.id;

    const sensitiveAction = analysis.actions.find((action) => action.sensitive);
    const approval: Approval | null = sensitiveAction
      ? {
          id: `approval-${analysis.id}`,
          runId: analysis.id,
          accountId,
          status: "pending",
          action: sensitiveAction,
          decidedAt: null,
          decisionNote: null,
        }
      : null;
    if (approval) {
      addAudit("approval_requested", `Human approval requested for: ${approval.action.title}`);
      audit[audit.length - 1]!.runId = analysis.id;
    }

    const run: AnalysisRun = {
      analysis,
      approval,
      audit,
      providerModes: {
        repository: this.repository.mode,
        nimble: nimbleResult.mode,
        hydra: hydraResult.mode,
        kylon: kylonResult.mode,
      },
      providerWarnings: [
        ...nimbleResult.warnings,
        ...hydraResult.warnings,
        ...kylonResult.warnings,
      ],
      kylonPacket: kylonResult,
    };
    await this.repository.saveAnalysisRun(run);
    return run;
  }
}
