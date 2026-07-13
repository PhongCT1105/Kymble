import { z } from "zod";

import type { AccountDossier } from "../domain/types.js";
import type {
  FetchLike,
  HydraProvider,
  HydraRecall,
} from "./types.js";

const memoryResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(z.object({ source_id: z.string(), status: z.string() })),
});
const recallResponseSchema = z.object({
  chunks: z.array(z.unknown()),
  sources: z.array(z.unknown()).default([]),
});

async function postHydra(
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
  if (!response.ok) throw new Error(`HydraDB request failed with HTTP ${response.status}`);
  return response.json();
}

export class DisabledHydraProvider implements HydraProvider {
  readonly mode = "disabled" as const;

  async rememberAndRecall(): Promise<HydraRecall> {
    return {
      mode: "disabled",
      context: [],
      warnings: ["HydraDB is not configured; the analysis used the current CRM dossier only."],
    };
  }
}

export class LiveHydraProvider implements HydraProvider {
  readonly mode = "live" as const;

  constructor(
    private readonly config: {
      apiKey: string;
      tenantId: string;
      baseUrl: string;
    },
    private readonly fetcher: FetchLike = fetch,
  ) {}

  async rememberAndRecall(dossier: AccountDossier): Promise<HydraRecall> {
    const baseUrl = this.config.baseUrl.replace(/\/$/, "");
    try {
      const memoryText = JSON.stringify({
        account: dossier.account,
        usage: dossier.usage.map(({ product, interpretation, metrics }) => ({
          product,
          interpretation,
          metrics,
        })),
        profileResponses: dossier.forms.map((form) => form.responses),
        meetingSummaries: dossier.meetings.map((meeting) => meeting.summary),
        evidenceReferences: dossier.evidence.map((item) => ({
          id: item.id,
          sourceUrl: item.sourceUrl,
          excerpt: item.excerpt,
          trustLabel: item.trustLabel,
        })),
      });
      memoryResponseSchema.parse(
        await postHydra(
          this.fetcher,
          `${baseUrl}/memories/add_memory`,
          this.config.apiKey,
          {
            tenant_id: this.config.tenantId,
            sub_tenant_id: dossier.account.id,
            upsert: true,
            memories: [
              {
                source_id: `crm-profile-${dossier.account.id}`,
                title: `${dossier.account.name} CRM profile`,
                text: memoryText,
                infer: true,
                metadata: { account_id: dossier.account.id },
                additional_metadata: {
                  lifecycle: dossier.account.lifecycle,
                  trust_label: dossier.account.trustLabel,
                },
              },
            ],
          },
        ),
      );
      const recalled = recallResponseSchema.parse(
        await postHydra(
          this.fetcher,
          `${baseUrl}/recall/recall_preferences`,
          this.config.apiKey,
          {
            tenant_id: this.config.tenantId,
            sub_tenant_id: dossier.account.id,
            query: "Why, when, and how does this account use the product, and what blocks its next commitment?",
            max_results: 8,
            mode: "fast",
            alpha: 0.8,
            recency_bias: 1,
            graph_context: true,
            search_forceful_relations: true,
          },
        ),
      );
      return { mode: "live", context: recalled.chunks, warnings: [] };
    } catch (error) {
      return {
        mode: "live",
        context: [],
        warnings: [
          `HydraDB memory was unavailable: ${error instanceof Error ? error.message : "unknown error"}`,
        ],
      };
    }
  }
}
