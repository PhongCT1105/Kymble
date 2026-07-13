import type { AccountAnalysis } from "../domain/types.js";
import type {
  FetchLike,
  KylonDelivery,
  KylonMissionPacket,
  OrganizationProvider,
} from "./types.js";

type KylonConfig = {
  mode: "workspace" | "native";
  workspaceUrl: string;
  webhookUrl?: string;
};

export class KylonProvider implements OrganizationProvider {
  readonly mode: "workspace" | "native";

  constructor(
    private readonly config: KylonConfig,
    private readonly fetcher: FetchLike = fetch,
  ) {
    this.mode = config.mode;
    if (config.mode === "native" && !config.webhookUrl) {
      throw new Error("A sponsor-confirmed Kylon webhook URL is required for native mode.");
    }
  }

  async createMissionPacket(analysis: AccountAnalysis): Promise<KylonDelivery> {
    const packet: KylonMissionPacket = {
      missionId: analysis.id,
      accountId: analysis.accountId,
      goal: "Turn known-account evidence into a trustworthy GTM decision.",
      handoffs: [
        {
          order: 1,
          role: "chief_of_staff",
          objective: "Frame the account decision and required evidence.",
          inputReferences: analysis.profileQuestions.flatMap((item) => item.referenceIds),
        },
        {
          order: 2,
          role: "account_analyst",
          objective: "Explain why, when, and how the account uses the product.",
          inputReferences: analysis.profileQuestions.flatMap((item) => item.referenceIds),
        },
        {
          order: 3,
          role: "evidence_verifier",
          objective: "Check source support, recency, and independence.",
          inputReferences: analysis.strongestEvidenceIds,
        },
        {
          order: 4,
          role: "account_strategist",
          objective: "Prepare the lifecycle-specific GTM recommendation for human review.",
          inputReferences: analysis.strongestEvidenceIds,
        },
      ],
      scores: { nimble: analysis.nimbleScore.total, kylon: analysis.kylonScore.total },
      playbook: analysis.recommendedPlaybook,
      evidenceIds: analysis.strongestEvidenceIds,
      proposedAction: analysis.actions[0] ?? null,
      approvalRequired: analysis.actions.some((action) => action.sensitive),
    };

    if (this.config.mode === "workspace") {
      return {
        mode: "workspace",
        delivered: false,
        workspaceUrl: this.config.workspaceUrl,
        packet,
        warnings: [
          "Kylon is in workspace mode; copy or import this packet into the sponsor workspace.",
        ],
      };
    }

    try {
      const response = await this.fetcher(this.config.webhookUrl!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(packet),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        mode: "native",
        delivered: true,
        workspaceUrl: this.config.workspaceUrl,
        packet,
        warnings: [],
      };
    } catch (error) {
      return {
        mode: "workspace",
        delivered: false,
        workspaceUrl: this.config.workspaceUrl,
        packet,
        warnings: [
          `Kylon native delivery failed and fell back to workspace mode: ${error instanceof Error ? error.message : "unknown error"}`,
        ],
      };
    }
  }
}
