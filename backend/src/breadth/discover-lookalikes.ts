import { createHash } from "node:crypto";

import type { EvidenceRecord, SignalKey } from "../domain/types.js";
import type { ClusterProfile } from "../fixtures/build-seed.js";
import type { LookalikeCandidate, ScoredCandidate } from "./types.js";

function hashId(prefix: string, seed: string): string {
  return `${prefix}-${createHash("sha256").update(seed).digest("hex").slice(0, 10)}`;
}

/**
 * Discovery source seam. The fixture source is demo-safe and deterministic.
 * A live Apollo/Exa adapter implements the same interface; swapping it in is
 * the ONLY change needed to go from simulation to live breadth.
 */
export interface LookalikeSource {
  readonly name: "apollo" | "exa" | "fixture";
  find(cluster: ClusterProfile, limit: number): Promise<LookalikeCandidate[]>;
}

/**
 * Deterministic fixture source. Produces plausible look-alikes per cluster so
 * the whole breadth->score flow is testable without live calls. Every record
 * is labeled "synthetic" so it can never be mistaken for verified data.
 */
export class FixtureLookalikeSource implements LookalikeSource {
  readonly name = "fixture" as const;

  async find(cluster: ClusterProfile, limit: number): Promise<LookalikeCandidate[]> {
    const stems: Array<[string, string, string]> = [
      ["Northbeam Signals", "northbeam-signals.example", "Marketing Technology"],
      ["Cadence Fresh", "cadencefresh.example", "Retail Intelligence"],
      ["Orbit Extract", "orbitextract.example", "Data Infrastructure"],
      ["Handoff Labs", "handofflabs.example", "AI Operations"],
      ["Ledger Pulse", "ledgerpulse.example", "Revenue Operations"],
      ["Verity Crawl", "veritycrawl.example", "Web Intelligence"],
    ];
    return stems.slice(0, limit).map(([name, domain, industry]) => ({
      id: hashId("cand", `${cluster.id}:${domain}`),
      name,
      domain,
      industry,
      employeeBand: "51-200",
      linkedinUrl: `https://www.linkedin.com/company/${domain.split(".")[0]}`,
      sourceClusterId: cluster.id,
      discoverySource: "fixture",
      trustLabel: "synthetic",
    }));
  }
}

/**
 * Maps a cluster's recommended playbook to the signal keys a look-alike would
 * need evidence for. This mirrors the real scorer's weight tables.
 */
function expectedSignals(cluster: ClusterProfile): SignalKey[] {
  const nimble: SignalKey[] = [
    "nimble_live_data_need",
    "nimble_structured_extraction",
    "nimble_scale",
    "nimble_ai_dependency",
    "nimble_reliability_pain",
    "nimble_recent_trigger",
  ];
  const kylon: SignalKey[] = [
    "kylon_multi_agent",
    "kylon_fragmented_context",
    "kylon_human_collaboration",
    "kylon_governance",
    "kylon_cross_functional",
    "kylon_recent_trigger",
  ];
  if (cluster.recommendedPlaybook === "nimble") return nimble;
  if (cluster.recommendedPlaybook === "kylon") return kylon;
  if (cluster.recommendedPlaybook === "joint") return [...nimble, ...kylon];
  return [];
}

/**
 * Turns raw candidates into synthetic evidence for simulation. In live mode a
 * Nimble/Exa verifier replaces this and returns real EvidenceRecords with real
 * source URLs and trustLabel "verified" or "inferred".
 */
function simulateEvidence(
  candidate: LookalikeCandidate,
  signals: SignalKey[],
  now: Date,
): EvidenceRecord[] {
  // Simulation deterministically "supports" the first two expected signals so
  // the scorer has something to act on, but keeps trustLabel synthetic.
  return signals.slice(0, 2).map((key, index) => ({
    id: hashId("cand-ev", `${candidate.id}:${key}`),
    accountId: candidate.id,
    sourceUrl: `https://${candidate.domain}/newsroom/item-${index + 1}`,
    sourceTitle: `${candidate.name} public signal ${index + 1}`,
    sourceDomain: index === 0 ? candidate.domain : `press.${candidate.domain}`,
    publishedAt: new Date(now.getTime() - index * 86_400_000).toISOString(),
    retrievedAt: now.toISOString(),
    excerpt: `Simulated public indicator of ${key} for ${candidate.name}.`,
    decision: "supported",
    signalKeys: [key],
    trustLabel: "synthetic",
  }));
}

export type BreadthResult = {
  clusterId: string;
  source: LookalikeSource["name"];
  mode: "simulation" | "live";
  scored: ScoredCandidate[];
  warnings: string[];
};

/**
 * Breadth sweep: cluster -> look-alikes -> evidence -> deterministic score,
 * reusing the same evidence-gate rules the depth pipeline enforces.
 */
export async function discoverAndScore(
  cluster: ClusterProfile,
  source: LookalikeSource,
  options: { limit?: number; now?: Date } = {},
): Promise<BreadthResult> {
  const limit = options.limit ?? 6;
  const now = options.now ?? new Date();
  const signals = expectedSignals(cluster);
  const candidates = await source.find(cluster, limit);
  const mode: "simulation" | "live" = source.name === "fixture" ? "simulation" : "live";

  const scored: ScoredCandidate[] = candidates.map((candidate) => {
    const evidence =
      source.name === "fixture" ? simulateEvidence(candidate, signals, now) : [];
    const supported = evidence.filter((e) => e.decision === "supported");
    const domains = new Set(supported.map((e) => e.sourceDomain));
    const recentCutoff = new Date(now);
    recentCutoff.setUTCDate(recentCutoff.getUTCDate() - 180);
    const hasRecent = supported.some((e) => {
      const d = e.publishedAt ? new Date(e.publishedAt) : null;
      return d !== null && !Number.isNaN(d.valueOf()) && d >= recentCutoff;
    });
    // SAME gate as analyze-account.ts: >=2 supported items, >=2 domains, recent.
    const gate = supported.length >= 2 && domains.size >= 2 && hasRecent;
    const matched = [...new Set(supported.flatMap((e) => e.signalKeys))];
    const nimbleScore = supported
      .filter((e) => e.signalKeys.some((k) => k.startsWith("nimble_")))
      .length > 0
      ? matched.filter((k) => k.startsWith("nimble_")).length * 20
      : 0;
    const kylonScore = supported
      .filter((e) => e.signalKeys.some((k) => k.startsWith("kylon_")))
      .length > 0
      ? matched.filter((k) => k.startsWith("kylon_")).length * 20
      : 0;
    const warnings: string[] = [];
    if (candidate.trustLabel === "synthetic") {
      warnings.push(
        "Synthetic look-alike from simulation; not a verified prospect. Do not contact based on this alone.",
      );
    }
    return {
      candidate,
      nimbleScore: Math.min(nimbleScore, 100),
      kylonScore: Math.min(kylonScore, 100),
      matchedSignals: matched,
      evidence,
      qualifiesForOutreach: gate && candidate.trustLabel !== "synthetic",
      warnings,
    };
  });

  const warnings =
    mode === "simulation"
      ? ["Breadth ran in simulation mode. No live prospects were contacted or verified."]
      : [];

  return { clusterId: cluster.id, source: source.name, mode, scored, warnings };
}
