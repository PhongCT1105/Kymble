import { describe, expect, it } from "vitest";

import { analyzeAccount } from "../src/domain/analyze-account.js";
import { buildSeed } from "../src/fixtures/build-seed.js";
import { LiveHydraProvider } from "../src/providers/hydra-provider.js";
import { KylonProvider } from "../src/providers/kylon-provider.js";
import { LiveNimbleProvider } from "../src/providers/nimble-provider.js";
import { FixtureCrmRepository } from "../src/repositories/fixture-crm-repository.js";
import {
  InsforgeCrmRepository,
  seedInsforge,
  type InsforgeGateway,
} from "../src/repositories/insforge-crm-repository.js";

type RecordedCall = { url: string; init?: RequestInit };

function queuedFetch(payloads: unknown[], calls: RecordedCall[]) {
  return async (url: string, init?: RequestInit): Promise<Response> => {
    calls.push({ url, ...(init ? { init } : {}) });
    const payload = payloads.shift();
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}

describe("LiveNimbleProvider", () => {
  it("searches and extracts only in the context of a known account", async () => {
    const calls: RecordedCall[] = [];
    const provider = new LiveNimbleProvider(
      { apiKey: "nimble-key", baseUrl: "https://sdk.nimbleway.com/v1" },
      queuedFetch(
        [
          {
            total_results: 1,
            request_id: "search-1",
            results: [
              {
                title: "RevPilot launch",
                description: "New agent workflow",
                url: "https://revpilot.example/launch",
                content: null,
                metadata: { published_date: "2026-07-01" },
              },
            ],
          },
          {
            url: "https://revpilot.example/launch",
            status: "success",
            data: { markdown: "# Launch\nRevPilot coordinates research agents with current account data." },
          },
        ],
        calls,
      ),
    );

    const result = await provider.enrichKnownAccount(
      {
        id: "acct-revpilot",
        name: "RevPilot AI",
        domain: "revpilot.example",
        lifecycle: "trial",
        industry: "AI Software",
        employeeBand: "21-50",
        currentProducts: ["nimble", "kylon"],
        trustLabel: "synthetic",
      },
      ["What changed in the product recently?"],
    );

    expect(calls.map((call) => call.url)).toEqual([
      "https://sdk.nimbleway.com/v1/search",
      "https://sdk.nimbleway.com/v1/extract",
    ]);
    const searchBody = JSON.parse(String(calls[0]?.init?.body));
    expect(searchBody.query).toContain("RevPilot AI");
    expect(searchBody.query).toContain("revpilot.example");
    expect(searchBody.query).toContain("What changed in the product recently?");
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0]?.decision).toBe("weak");
    expect(result.evidence[0]?.trustLabel).toBe("verified");
  });

  it("refuses enrichment without a known account ID and domain", async () => {
    const provider = new LiveNimbleProvider(
      { apiKey: "nimble-key", baseUrl: "https://sdk.nimbleway.com/v1" },
      queuedFetch([], []),
    );

    await expect(
      provider.enrichKnownAccount(
        {
          id: "",
          name: "Unknown",
          domain: "",
          lifecycle: "evaluator",
          industry: "Unknown",
          employeeBand: "Unknown",
          currentProducts: [],
          trustLabel: "synthetic",
        },
        ["Why now?"],
      ),
    ).rejects.toThrow(/known account ID and domain/);
  });
});

describe("LiveHydraProvider", () => {
  it("stores account memory in an isolated sub-tenant and recalls it", async () => {
    const calls: RecordedCall[] = [];
    const repository = new FixtureCrmRepository(buildSeed());
    const dossier = await repository.getAccountDossier("acct-revpilot");
    const provider = new LiveHydraProvider(
      {
        apiKey: "hydra-key",
        tenantId: "kymble",
        baseUrl: "https://api.hydradb.com",
      },
      queuedFetch(
        [
          { success: true, results: [{ source_id: "acct-revpilot", status: "queued" }] },
          { chunks: [{ text: "Uses current web data before campaign launches." }], sources: [] },
        ],
        calls,
      ),
    );

    const result = await provider.rememberAndRecall(dossier);

    expect(calls.map((call) => call.url)).toEqual([
      "https://api.hydradb.com/memories/add_memory",
      "https://api.hydradb.com/recall/recall_preferences",
    ]);
    const memoryBody = JSON.parse(String(calls[0]?.init?.body));
    expect(memoryBody.tenant_id).toBe("kymble");
    expect(memoryBody.sub_tenant_id).toBe("acct-revpilot");
    expect(result.context).toHaveLength(1);
    expect(result.warnings).toEqual([]);
  });
});

describe("KylonProvider", () => {
  it("creates a copy-ready workspace packet without claiming native delivery", async () => {
    const repository = new FixtureCrmRepository(buildSeed());
    const dossier = await repository.getAccountDossier("acct-revpilot");
    const analysis = analyzeAccount(dossier, new Date("2026-07-13T12:00:00Z"));
    const provider = new KylonProvider({
      mode: "workspace",
      workspaceUrl: "https://app.kylon.io/c/demo",
    });

    const result = await provider.createMissionPacket(analysis);

    expect(result.mode).toBe("workspace");
    expect(result.delivered).toBe(false);
    expect(result.workspaceUrl).toBe("https://app.kylon.io/c/demo");
    expect(result.packet.handoffs.map((handoff) => handoff.role)).toEqual([
      "chief_of_staff",
      "account_analyst",
      "evidence_verifier",
      "account_strategist",
    ]);
  });
});

describe("InsforgeCrmRepository", () => {
  it("maps InsForge table records into the shared CRM repository contract", async () => {
    const seed = buildSeed();
    const account = seed.accounts[0]!;
    const rows: Record<string, unknown[]> = {
      accounts: [
        {
          id: account.id,
          name: account.name,
          domain: account.domain,
          lifecycle: account.lifecycle,
          industry: account.industry,
          employee_band: account.employeeBand,
          current_products: account.currentProducts,
          trust_label: account.trustLabel,
          primary_cluster_id: seed.accountCluster[account.id],
        },
      ],
      contacts: seed.contacts
        .filter((item) => item.accountId === account.id)
        .map((payload) => ({ account_id: account.id, payload })),
      usage_records: seed.usage
        .filter((item) => item.accountId === account.id)
        .map((payload) => ({ account_id: account.id, payload })),
      engagements: seed.engagements
        .filter((item) => item.accountId === account.id)
        .map((payload) => ({ account_id: account.id, payload })),
      form_submissions: seed.forms
        .filter((item) => item.accountId === account.id)
        .map((payload) => ({ account_id: account.id, payload })),
      meetings: seed.meetings
        .filter((item) => item.accountId === account.id)
        .map((payload) => ({ account_id: account.id, payload })),
      evidence_items: seed.evidence
        .filter((item) => item.accountId === account.id)
        .map((payload) => ({ account_id: account.id, payload })),
      icp_clusters: [],
    };
    const inserts: Array<{ table: string; records: unknown[] }> = [];
    const gateway: InsforgeGateway = {
      async select(table) {
        return rows[table] ?? [];
      },
      async insert(table, records) {
        inserts.push({ table, records });
      },
      async update() {
        return [];
      },
    };
    const repository = new InsforgeCrmRepository(gateway);

    const dossier = await repository.getAccountDossier(account.id);
    const analysis = analyzeAccount(dossier, new Date("2026-07-13T12:00:00Z"));
    await repository.saveAnalysisRun({
      analysis,
      approval: null,
      audit: [],
      providerModes: {
        repository: "insforge",
        nimble: "fixture",
        hydra: "disabled",
        kylon: "workspace",
      },
      providerWarnings: [],
      kylonPacket: {},
    });

    expect(dossier.account.id).toBe("acct-revpilot");
    expect(dossier.contacts).toHaveLength(3);
    expect(inserts.map((insert) => insert.table)).toContain("analysis_runs");
  });

  it("seeds every fixture record into InsForge in foreign-key order", async () => {
    const inserts: Array<{ table: string; records: unknown[] }> = [];
    const gateway: InsforgeGateway = {
      async select() {
        return [];
      },
      async insert(table, records) {
        inserts.push({ table, records });
      },
      async update() {
        return [];
      },
    };

    const counts = await seedInsforge(gateway, buildSeed());

    expect(inserts[0]?.table).toBe("icp_clusters");
    expect(inserts[1]?.table).toBe("accounts");
    expect(counts.total).toBeGreaterThan(200);
    expect(counts.accounts).toBe(40);
  });
});
