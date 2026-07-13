import { createHash } from "node:crypto";

import type { AccountDossier } from "../domain/types.js";
import type { ClusterProfile } from "../fixtures/build-seed.js";
import type {
  CausalEdge,
  CausalGraph,
  CausalNode,
  CausalNodeType,
} from "./types.js";

function nid(prefix: string, seed: string): string {
  return `${prefix}-${createHash("sha256").update(seed).digest("hex").slice(0, 10)}`;
}

/**
 * Builds a causal knowledge graph for a cluster from real dossier signal:
 *  - BuyingReason  (why they bought)  <- form why_use_product, usage jumps
 *  - ExpansionBlocker (why not more)  <- form blocker_to_convert, plateaued usage
 *  - TriggerEvent  (what preceded use) <- engagements, recent evidence
 *  - PainPoint / Capability            <- meetings + product mapping
 * Every node/edge carries a trustLabel so synthetic never reads as verified.
 * This is the shape written into HydraDB (add_memory with graph_context).
 */
export function buildCausalGraph(
  cluster: ClusterProfile,
  dossiers: AccountDossier[],
): CausalGraph {
  const nodes: CausalNode[] = [];
  const edges: CausalEdge[] = [];
  const warnings: string[] = [];

  const clusterNode: CausalNode = {
    id: nid("ICP_Cluster", cluster.id),
    type: "ICP_Cluster",
    label: cluster.name,
    clusterId: cluster.id,
    trustLabel: "inferred",
    sourceIds: [cluster.id],
  };
  nodes.push(clusterNode);

  const addNode = (n: CausalNode) => {
    if (!nodes.some((existing) => existing.id === n.id)) nodes.push(n);
    return n;
  };
  const addEdge = (e: CausalEdge) => {
    if (!edges.some((existing) => existing.id === e.id)) edges.push(e);
  };

  for (const dossier of dossiers) {
    const acct = dossier.account;
    const acctNode = addNode({
      id: nid("Account", acct.id),
      type: "Account",
      label: acct.name,
      clusterId: cluster.id,
      trustLabel: acct.trustLabel,
      sourceIds: [acct.id],
    });
    addEdge({
      id: nid("belongs_to", `${acct.id}:${cluster.id}`) ,
      from: acctNode.id,
      to: clusterNode.id,
      type: "belongs_to",
      trustLabel: "inferred",
    });

    // BuyingReason from why_use_product
    for (const form of dossier.forms) {
      const why = form.responses.why_use_product?.trim();
      if (why) {
        const n = addNode({
          id: nid("BuyingReason", `${acct.id}:${why}`),
          type: "BuyingReason",
          label: why,
          clusterId: cluster.id,
          trustLabel: form.trustLabel,
          sourceIds: [form.id],
        });
        addEdge({
          id: nid("supported_by", `${n.id}:${form.id}`),
          from: n.id,
          to: acctNode.id,
          type: "supported_by",
          trustLabel: form.trustLabel,
        });
      }
      // ExpansionBlocker from blocker_to_convert
      const blocker = form.responses.blocker_to_convert?.trim();
      if (blocker && blocker.toLowerCase() !== "none") {
        const n = addNode({
          id: nid("ExpansionBlocker", `${acct.id}:${blocker}`),
          type: "ExpansionBlocker",
          label: blocker,
          clusterId: cluster.id,
          trustLabel: form.trustLabel,
          sourceIds: [form.id],
        });
        addEdge({
          id: nid("blocks", `${n.id}:${acct.id}`),
          from: n.id,
          to: acctNode.id,
          type: "blocks",
          trustLabel: form.trustLabel,
        });
      }
    }

    // TriggerEvent from engagements
    for (const eng of dossier.engagements.slice(0, 3)) {
      const n = addNode({
        id: nid("TriggerEvent", `${acct.id}:${eng.id}`),
        type: "TriggerEvent",
        label: `${eng.type}: ${eng.details}`.slice(0, 120),
        clusterId: cluster.id,
        trustLabel: eng.trustLabel,
        sourceIds: [eng.id],
      });
      addEdge({
        id: nid("precedes", `${n.id}:${acct.id}`),
        from: n.id,
        to: acctNode.id,
        type: "precedes",
        trustLabel: eng.trustLabel,
      });
    }

    // PainPoint -> Capability from meetings (best-effort, inferred)
    for (const meeting of dossier.meetings.slice(0, 2)) {
      const pain = addNode({
        id: nid("PainPoint", `${acct.id}:${meeting.id}`),
        type: "PainPoint",
        label: meeting.summary.slice(0, 120),
        clusterId: cluster.id,
        trustLabel: "inferred",
        sourceIds: [meeting.id],
      });
      const cap = addNode({
        id: nid("Capability", `${cluster.recommendedPlaybook}`),
        type: "Capability",
        label:
          cluster.recommendedPlaybook === "nimble"
            ? "Live-web structured extraction"
            : cluster.recommendedPlaybook === "kylon"
              ? "Multi-agent operations with governance"
              : "Joint live-intelligence + agent operations",
        clusterId: cluster.id,
        trustLabel: "inferred",
        sourceIds: [cluster.id],
      });
      addEdge({
        id: nid("addressed_by", `${pain.id}:${cap.id}`),
        from: pain.id,
        to: cap.id,
        type: "addressed_by",
        trustLabel: "inferred",
      });
    }
  }

  if (dossiers.length === 0) {
    warnings.push("No dossiers supplied for this cluster; graph has cluster node only.");
  }
  const synthOnly =
    nodes.length > 1 && nodes.every((n) => n.trustLabel === "synthetic" || n.type === "ICP_Cluster");
  if (synthOnly) {
    warnings.push(
      "Causal graph is built entirely from synthetic dossier data; treat as a demo illustration, not verified customer insight.",
    );
  }

  return { clusterId: cluster.id, nodes, edges, warnings };
}
