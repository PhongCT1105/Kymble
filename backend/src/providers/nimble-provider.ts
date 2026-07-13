import { createHash } from "node:crypto";

import { z } from "zod";

import type { Account, EvidenceRecord } from "../domain/types.js";
import type {
  FetchLike,
  NimbleEnrichment,
  NimbleProvider,
} from "./types.js";

const searchResponseSchema = z.object({
  total_results: z.number().int().nonnegative(),
  request_id: z.string().min(1),
  results: z.array(
    z.object({
      title: z.string().default("Untitled source"),
      description: z.string().nullable().optional(),
      url: z.url(),
      content: z.string().nullable().optional(),
      metadata: z
        .object({ published_date: z.string().optional() })
        .passthrough()
        .optional(),
    }),
  ),
});

const extractResponseSchema = z.object({
  url: z.url().optional(),
  status: z.string().optional(),
  data: z.object({
    markdown: z.string().optional(),
    text: z.string().optional(),
    html: z.string().optional(),
  }),
});

async function postJson(
  fetcher: FetchLike,
  url: string,
  apiKey: string,
  body: unknown,
): Promise<unknown> {
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Nimble request failed with HTTP ${response.status}`);
  }
  return response.json();
}

function toIso(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

export class FixtureNimbleProvider implements NimbleProvider {
  readonly mode = "fixture" as const;

  async enrichKnownAccount(account: Account): Promise<NimbleEnrichment> {
    if (!account.id || !account.domain) {
      throw new Error("Nimble enrichment requires a known account ID and domain.");
    }
    return {
      mode: "fixture",
      evidence: [],
      rawResponseIds: [],
      warnings: ["Nimble credentials are absent; existing synthetic evidence was used."],
    };
  }
}

export class LiveNimbleProvider implements NimbleProvider {
  readonly mode = "live" as const;

  constructor(
    private readonly config: { apiKey: string; baseUrl: string },
    private readonly fetcher: FetchLike = fetch,
  ) {}

  async enrichKnownAccount(
    account: Account,
    questions: string[],
  ): Promise<NimbleEnrichment> {
    if (!account.id || !account.domain) {
      throw new Error("Nimble enrichment requires a known account ID and domain.");
    }

    const scopedQuestions = (
      questions.length > 0
        ? questions
        : [
            "What product or workflow changed recently?",
            "What current data, agent, or approval problem is publicly documented?",
          ]
    ).slice(0, 4);
    const evidence: EvidenceRecord[] = [];
    const rawResponseIds: string[] = [];
    const warnings: string[] = [];

    for (const [questionIndex, question] of scopedQuestions.entries()) {
      try {
        const search = searchResponseSchema.parse(
          await postJson(
            this.fetcher,
            `${this.config.baseUrl.replace(/\/$/, "")}/search`,
            this.config.apiKey,
            {
              query: `"${account.name}" "${account.domain}" ${question}`,
              focus: "general",
              max_results: 3,
              search_depth: "fast",
              include_answer: false,
            },
          ),
        );
        rawResponseIds.push(search.request_id);
        const strongest = search.results[0];
        if (!strongest) continue;

        const extracted = extractResponseSchema.parse(
          await postJson(
            this.fetcher,
            `${this.config.baseUrl.replace(/\/$/, "")}/extract`,
            this.config.apiKey,
            { url: strongest.url, formats: ["markdown", "text"], render: true },
          ),
        );
        const excerpt =
          extracted.data.markdown ??
          extracted.data.text ??
          strongest.content ??
          strongest.description ??
          "";
        const url = new URL(strongest.url);
        const evidenceId = `nimble-${createHash("sha256")
          .update(`${account.id}:${strongest.url}:${questionIndex}`)
          .digest("hex")
          .slice(0, 12)}`;
        evidence.push({
          id: evidenceId,
          accountId: account.id,
          sourceUrl: strongest.url,
          sourceTitle: strongest.title,
          sourceDomain: url.hostname,
          publishedAt: toIso(strongest.metadata?.published_date),
          retrievedAt: new Date().toISOString(),
          excerpt: excerpt.replace(/\s+/g, " ").trim().slice(0, 1_000),
          decision: "weak",
          signalKeys: [],
          trustLabel: "verified",
        });
      } catch (error) {
        warnings.push(
          `Nimble could not answer "${question}": ${error instanceof Error ? error.message : "unknown error"}`,
        );
      }
    }

    if (evidence.length > 0) {
      warnings.push(
        "New Nimble sources remain weak until a verifier maps each excerpt to a specific signal.",
      );
    }
    return { mode: "live", evidence, rawResponseIds, warnings };
  }
}
