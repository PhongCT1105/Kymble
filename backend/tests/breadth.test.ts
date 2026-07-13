import { describe, expect, it } from "vitest";

import { FixtureCrmRepository } from "../src/repositories/fixture-crm-repository.js";
import { buildCausalGraph } from "../src/breadth/build-causal-graph.js";
import {
  FixtureLookalikeSource,
  discoverAndScore,
} from "../src/breadth/discover-lookalikes.js";

const now = new Date("2026-07-13T00:00:00.000Z");

describe("breadth discovery", () => {
  it("scores look-alikes along the cluster's playbook direction", async () => {
    const repo = new FixtureCrmRepository();
    const clusters = await repo.listClusters();
    const nimbleCluster = clusters.find((c) => c.recommendedPlaybook === "nimble")!;
    const kylonCluster = clusters.find((c) => c.recommendedPlaybook === "kylon")!;
    const source = new FixtureLookalikeSource();

    const nimbleRes = await discoverAndScore(nimbleCluster, source, { now });
    const kylonRes = await discoverAndScore(kylonCluster, source, { now });

    expect(nimbleRes.scored[0]!.nimbleScore).toBeGreaterThan(0);
    expect(nimbleRes.scored[0]!.kylonScore).toBe(0);
    expect(kylonRes.scored[0]!.kylonScore).toBeGreaterThan(0);
    expect(kylonRes.scored[0]!.nimbleScore).toBe(0);
  });

  it("never qualifies a synthetic candidate for real outreach", async () => {
    const repo = new FixtureCrmRepository();
    const cluster = (await repo.listClusters())[0]!;
    const res = await discoverAndScore(cluster, new FixtureLookalikeSource(), { now });
    expect(res.mode).toBe("simulation");
    expect(res.scored.every((s) => s.qualifiesForOutreach === false)).toBe(true);
    expect(res.scored.every((s) => s.candidate.trustLabel === "synthetic")).toBe(true);
  });

  it("is deterministic", async () => {
    const repo = new FixtureCrmRepository();
    const cluster = (await repo.listClusters())[0]!;
    const src = new FixtureLookalikeSource();
    const a = await discoverAndScore(cluster, src, { now });
    const b = await discoverAndScore(cluster, src, { now });
    expect(a.scored.map((s) => s.candidate.id)).toEqual(
      b.scored.map((s) => s.candidate.id),
    );
  });
});

describe("causal graph", () => {
  it("extracts expansion blockers from real dossier data with trust labels", async () => {
    const repo = new FixtureCrmRepository();
    const clusters = await repo.listClusters();
    const trialCluster =
      clusters.find((c) => c.id === "cluster-trial-friction") ?? clusters[0]!;
    const accounts = await repo.listAccounts({ cluster: trialCluster.id });
    const dossiers = await Promise.all(
      accounts.slice(0, 3).map((a) => repo.getAccountDossier(a.id)),
    );
    const graph = buildCausalGraph(trialCluster, dossiers);

    expect(graph.nodes.some((n) => n.type === "ICP_Cluster")).toBe(true);
    const blockers = graph.nodes.filter((n) => n.type === "ExpansionBlocker");
    expect(blockers.length).toBeGreaterThan(0);
    // every node carries a valid trust label
    for (const n of graph.nodes) {
      expect(["verified", "inferred", "synthetic", "cached"]).toContain(n.trustLabel);
    }
    // every edge points at nodes that exist
    const ids = new Set(graph.nodes.map((n) => n.id));
    for (const e of graph.edges) {
      expect(ids.has(e.from)).toBe(true);
      expect(ids.has(e.to)).toBe(true);
    }
  });

  it("warns and degrades gracefully with no dossiers", async () => {
    const repo = new FixtureCrmRepository();
    const cluster = (await repo.listClusters())[0]!;
    const graph = buildCausalGraph(cluster, []);
    expect(graph.nodes.length).toBe(1);
    expect(graph.warnings.length).toBeGreaterThan(0);
  });
});
