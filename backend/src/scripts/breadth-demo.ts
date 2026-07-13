/**
 * Standalone demo of the ICP breadth + causal-graph slice.
 * Runs entirely on the fixture repository in simulation mode — no live calls,
 * no external contact. Proves: cluster -> look-alikes -> deterministic score,
 * and cluster -> causal knowledge graph, both reusing real types + gates.
 *
 * Run: pnpm tsx src/scripts/breadth-demo.ts
 */
import { FixtureCrmRepository } from "../repositories/fixture-crm-repository.js";
import { buildCausalGraph } from "../breadth/build-causal-graph.js";
import {
  FixtureLookalikeSource,
  discoverAndScore,
} from "../breadth/discover-lookalikes.js";

async function main() {
  const repo = new FixtureCrmRepository();
  const clusters = await repo.listClusters();
  const source = new FixtureLookalikeSource();
  const now = new Date("2026-07-13T00:00:00.000Z");

  console.log(`\n=== BREADTH + CAUSAL GRAPH DEMO (simulation) ===`);
  console.log(`Clusters: ${clusters.length}\n`);

  for (const cluster of clusters) {
    // --- Breadth: find + score look-alikes ---
    const breadth = await discoverAndScore(cluster, source, { limit: 4, now });
    console.log(`# ${cluster.name}  [${cluster.recommendedPlaybook}]`);
    console.log(`  breadth: ${breadth.scored.length} look-alikes (${breadth.mode})`);
    for (const s of breadth.scored.slice(0, 2)) {
      console.log(
        `    - ${s.candidate.name} (${s.candidate.domain}) N=${s.nimbleScore} K=${s.kylonScore} ` +
          `signals=[${s.matchedSignals.join(",")}] outreach=${s.qualifiesForOutreach}`,
      );
    }

    // --- Causal graph: from real cluster dossiers ---
    const accounts = await repo.listAccounts({ cluster: cluster.id });
    const dossiers = await Promise.all(
      accounts.slice(0, 3).map((a) => repo.getAccountDossier(a.id)),
    );
    const graph = buildCausalGraph(cluster, dossiers);
    const byType = graph.nodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.type] = (acc[n.type] ?? 0) + 1;
      return acc;
    }, {});
    console.log(
      `  graph: ${graph.nodes.length} nodes ${graph.edges.length} edges ` +
        `[${Object.entries(byType).map(([t, c]) => `${t}:${c}`).join(" ")}]`,
    );
    const blockers = graph.nodes.filter((n) => n.type === "ExpansionBlocker");
    for (const b of blockers.slice(0, 2)) {
      console.log(`    why-not-more: "${b.label}" (${b.trustLabel})`);
    }
    console.log("");
  }

  // Honesty check summary
  console.log("=== honesty guardrails ===");
  const oneBreadth = await discoverAndScore(clusters[0]!, source, { now });
  console.log(`  breadth warning: ${oneBreadth.warnings[0]}`);
  console.log(`  candidate warning: ${oneBreadth.scored[0]?.warnings[0]}`);
  console.log(`  none qualify for outreach in sim: ${oneBreadth.scored.every((s) => !s.qualifiesForOutreach)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
