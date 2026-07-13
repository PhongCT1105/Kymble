import { describe, expect, it } from "vitest";

import { FixtureCrmRepository } from "../src/repositories/fixture-crm-repository.js";
import { BreadthService } from "../src/breadth/breadth-service.js";

const now = () => new Date("2026-07-13T00:00:00.000Z");

describe("BreadthService.sweepAllClusters", () => {
  it("returns a simulation sweep across all clusters with honesty flags set", async () => {
    const svc = new BreadthService(new FixtureCrmRepository(), undefined, now);
    const res = await svc.sweepAllClusters();

    expect(res.mode).toBe("simulation");
    expect(res.clusterCount).toBeGreaterThan(0);
    expect(res.clusters.length).toBe(res.clusterCount);
    expect(res.honesty.allSyntheticLabeled).toBe(true);
    expect(res.honesty.noneQualifyForOutreach).toBe(true);
  });

  it("never marks a synthetic candidate as outreach-ready", async () => {
    const svc = new BreadthService(new FixtureCrmRepository(), undefined, now);
    const res = await svc.sweepAllClusters();
    for (const cluster of res.clusters) {
      for (const lk of cluster.lookalikes) {
        expect(lk.qualifiesForOutreach).toBe(false);
        expect(lk.trustLabel).toBe("synthetic");
      }
    }
  });

  it("surfaces expansion blockers with trust labels where the CRM has them", async () => {
    const svc = new BreadthService(new FixtureCrmRepository(), undefined, now);
    const res = await svc.sweepAllClusters();
    const withBlockers = res.clusters.filter(
      (c) => c.graph.expansionBlockers.length > 0,
    );
    expect(withBlockers.length).toBeGreaterThan(0);
    for (const c of withBlockers) {
      for (const b of c.graph.expansionBlockers) {
        expect(typeof b.label).toBe("string");
        expect(["verified", "inferred", "synthetic", "cached"]).toContain(
          b.trustLabel,
        );
      }
    }
  });
});
