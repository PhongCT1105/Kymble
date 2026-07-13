import { describe, expect, it } from "vitest";

import { analyzeAccount } from "../src/domain/analyze-account.js";
import { buildSeed } from "../src/fixtures/build-seed.js";
import { FixtureCrmRepository } from "../src/repositories/fixture-crm-repository.js";

describe("synthetic known-CRM seed", () => {
  it("contains enough linked records and lifecycle diversity to show cluster impact", () => {
    const seed = buildSeed();
    const totalRecords =
      seed.accounts.length +
      seed.contacts.length +
      seed.usage.length +
      seed.engagements.length +
      seed.forms.length +
      seed.meetings.length +
      seed.evidence.length;

    expect(seed.accounts).toHaveLength(40);
    expect(seed.contacts.length).toBeGreaterThanOrEqual(90);
    expect(totalRecords).toBeGreaterThan(200);
    expect(new Set(seed.accounts.map((account) => account.lifecycle))).toEqual(
      new Set(["paying", "trial", "evaluator", "dormant", "expansion", "rejected"]),
    );
    expect(seed.clusters).toHaveLength(6);
    expect(seed.accounts.map((account) => account.id)).toContain("acct-revpilot");
  });

  it("keeps all child records connected to a known account and contact", () => {
    const seed = buildSeed();
    const accountIds = new Set(seed.accounts.map((account) => account.id));
    const contactIds = new Set(seed.contacts.map((contact) => contact.id));

    for (const record of [
      ...seed.contacts,
      ...seed.usage,
      ...seed.engagements,
      ...seed.forms,
      ...seed.meetings,
      ...seed.evidence,
    ]) {
      expect(accountIds.has(record.accountId)).toBe(true);
    }
    for (const record of [...seed.engagements, ...seed.forms]) {
      if (record.contactId) expect(contactIds.has(record.contactId)).toBe(true);
    }
  });
});

describe("FixtureCrmRepository", () => {
  it("assembles a complete dossier and filters known accounts", async () => {
    const repository = new FixtureCrmRepository(buildSeed());

    const trials = await repository.listAccounts({ lifecycle: "trial" });
    const dossier = await repository.getAccountDossier("acct-revpilot");

    expect(trials.length).toBeGreaterThan(0);
    expect(trials.every((account) => account.lifecycle === "trial")).toBe(true);
    expect(dossier.contacts.length).toBe(3);
    expect(dossier.evidence.length).toBe(2);
  });

  it("persists analysis runs and human approval decisions", async () => {
    const repository = new FixtureCrmRepository(buildSeed());
    const dossier = await repository.getAccountDossier("acct-revpilot");
    const analysis = analyzeAccount(dossier, new Date("2026-07-13T12:00:00Z"));
    const approvalId = `approval-${analysis.id}`;

    await repository.saveAnalysisRun({
      analysis,
      approval: {
        id: approvalId,
        runId: analysis.id,
        accountId: analysis.accountId,
        status: "pending",
        action: analysis.actions[0]!,
        decidedAt: null,
        decisionNote: null,
      },
      audit: [],
      providerModes: {
        repository: "fixture",
        nimble: "fixture",
        hydra: "disabled",
        kylon: "workspace",
      },
      providerWarnings: [],
      kylonPacket: {},
    });

    await repository.recordApprovalDecision(
      approvalId,
      "approved",
      "Proceed with the workshop.",
      new Date("2026-07-13T12:05:00Z"),
    );
    const saved = await repository.getRun(analysis.id);

    expect(saved.approval?.status).toBe("approved");
    expect(saved.approval?.decisionNote).toBe("Proceed with the workshop.");
  });
});
