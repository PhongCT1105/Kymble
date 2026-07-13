import type { CrmRepository } from "../repositories/crm-repository.js";
import { buildCausalGraph } from "./build-causal-graph.js";
import {
  FixtureLookalikeSource,
  discoverAndScore,
  type LookalikeSource,
} from "./discover-lookalikes.js";
import type { CausalNodeType } from "./types.js";

export type ClusterSweepResult = {
  clusterId: string;
  clusterName: string;
  recommendedPlaybook: string;
  mode: "simulation" | "live";
  lookalikes: Array<{
    name: string;
    domain: string;
    linkedinUrl: string | null;
    nimbleScore: number;
    kylonScore: number;
    matchedSignals: string[];
    qualifiesForOutreach: boolean;
    trustLabel: string;
  }>;
  graph: {
    nodeCount: number;
    edgeCount: number;
    nodesByType: Partial<Record<CausalNodeType, number>>;
    expansionBlockers: Array<{ label: string; trustLabel: string }>;
    buyingReasons: Array<{ label: string; trustLabel: string }>;
  };
  warnings: string[];
};

export type BreadthSweepResponse = {
  mode: "simulation" | "live";
  generatedAt: string;
  clusterCount: number;
  honesty: {
    allSyntheticLabeled: boolean;
    noneQualifyForOutreach: boolean;
  };
  clusters: ClusterSweepResult[];
  warnings: string[];
};

/**
 * Runs the breadth + causal-graph sweep across ALL clusters and returns a
 * frontend-friendly JSON payload. Simulation-only unless a live LookalikeSource
 * is injected. Never returns a candidate flagged for outreach in simulation.
 */
export class BreadthService {
  constructor(
    private readonly repository: CrmRepository,
    private readonly source: LookalikeSource = new FixtureLookalikeSource(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  async sweepAllClusters(options: { limit?: number } = {}): Promise<BreadthSweepResponse> {
    const now = this.now();
    const clusters = await this.repository.listClusters();
    const results: ClusterSweepResult[] = [];

    for (const cluster of clusters) {
      const breadth = await discoverAndScore(cluster, this.source, {
        ...(options.limit !== undefined ? { limit: options.limit } : {}),
        now,
      });
      const accounts = await this.repository.listAccounts({ cluster: cluster.id });
      const dossiers = await Promise.all(
        accounts.slice(0, 3).map((a) => this.repository.getAccountDossier(a.id)),
      );
      const graph = buildCausalGraph(cluster, dossiers);

      const nodesByType = graph.nodes.reduce<Partial<Record<CausalNodeType, number>>>(
        (acc, n) => {
          acc[n.type] = (acc[n.type] ?? 0) + 1;
          return acc;
        },
        {},
      );

      results.push({
        clusterId: cluster.id,
        clusterName: cluster.name,
        recommendedPlaybook: cluster.recommendedPlaybook,
        mode: breadth.mode,
        lookalikes: breadth.scored.map((s) => ({
          name: s.candidate.name,
          domain: s.candidate.domain,
          linkedinUrl: s.candidate.linkedinUrl,
          nimbleScore: s.nimbleScore,
          kylonScore: s.kylonScore,
          matchedSignals: s.matchedSignals,
          qualifiesForOutreach: s.qualifiesForOutreach,
          trustLabel: s.candidate.trustLabel,
        })),
        graph: {
          nodeCount: graph.nodes.length,
          edgeCount: graph.edges.length,
          nodesByType,
          expansionBlockers: graph.nodes
            .filter((n) => n.type === "ExpansionBlocker")
            .map((n) => ({ label: n.label, trustLabel: n.trustLabel })),
          buyingReasons: graph.nodes
            .filter((n) => n.type === "BuyingReason")
            .map((n) => ({ label: n.label, trustLabel: n.trustLabel })),
        },
        warnings: [...breadth.warnings, ...graph.warnings],
      });
    }

    const mode: "simulation" | "live" =
      results.every((r) => r.mode === "simulation") ? "simulation" : "live";
    const allSyntheticLabeled = results.every((r) =>
      r.lookalikes.every(
        (l) => r.mode !== "simulation" || l.trustLabel === "synthetic",
      ),
    );
    const noneQualifyForOutreach =
      mode === "simulation"
        ? results.every((r) => r.lookalikes.every((l) => !l.qualifiesForOutreach))
        : true;

    const warnings: string[] = [];
    if (mode === "simulation") {
      warnings.push(
        "Breadth sweep ran in simulation mode. Look-alikes are synthetic and no real prospect was contacted or verified.",
      );
    }

    return {
      mode,
      generatedAt: now.toISOString(),
      clusterCount: results.length,
      honesty: { allSyntheticLabeled, noneQualifyForOutreach },
      clusters: results,
      warnings,
    };
  }
}
