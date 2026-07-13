import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const apps: Array<ReturnType<typeof buildApp>> = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

function testApp() {
  const app = buildApp({
    config: loadConfig({}),
    now: () => new Date("2026-07-13T12:00:00Z"),
  });
  apps.push(app);
  return app;
}

describe("Kymble backend API", () => {
  it("reports honest provider readiness", async () => {
    const response = await testApp().inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      providers: {
        insforge: "fixture",
        nimble: "fixture",
        hydra: "disabled",
        kylon: "workspace",
      },
      knownAccounts: 40,
    });
  });

  it("lists and filters existing CRM accounts", async () => {
    const response = await testApp().inject({
      method: "GET",
      url: "/api/v1/accounts?lifecycle=trial",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.accounts.length).toBeGreaterThan(0);
    expect(body.accounts.every((account: { lifecycle: string }) => account.lifecycle === "trial")).toBe(true);
  });

  it("returns the deep account profile used by the analysis", async () => {
    const response = await testApp().inject({
      method: "GET",
      url: "/api/v1/accounts/acct-revpilot/profile",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      account: { id: "acct-revpilot", lifecycle: "paying" },
    });
    expect(response.json().contacts).toHaveLength(3);
  });

  it("runs the real workflow, persists the run, and requests human approval", async () => {
    const app = testApp();
    const analyzed = await app.inject({
      method: "POST",
      url: "/api/v1/accounts/acct-revpilot/analyze",
      payload: { enrich: false },
    });

    expect(analyzed.statusCode).toBe(201);
    const run = analyzed.json();
    expect(run.analysis.recommendedPlaybook).toBe("joint");
    expect(run.analysis.actions[0].type).toBe("expand_joint_adoption");
    expect(run.approval.status).toBe("pending");
    expect(run.providerModes).toEqual({
      repository: "fixture",
      nimble: "fixture",
      hydra: "disabled",
      kylon: "workspace",
    });
    expect(run.kylonPacket.packet.handoffs).toHaveLength(4);

    const fetched = await app.inject({
      method: "GET",
      url: `/api/v1/runs/${run.analysis.id}`,
    });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.json().analysis.id).toBe(run.analysis.id);
  });

  it("records a human approval decision without sending outbound", async () => {
    const app = testApp();
    const analyzed = await app.inject({
      method: "POST",
      url: "/api/v1/accounts/acct-revpilot/analyze",
      payload: {},
    });
    const run = analyzed.json();

    const decided = await app.inject({
      method: "POST",
      url: `/api/v1/approvals/${run.approval.id}/decision`,
      payload: { decision: "approved", note: "Proceed with a workshop." },
    });

    expect(decided.statusCode).toBe(200);
    expect(decided.json().approval.status).toBe("approved");
    expect(decided.json().audit.at(-1).type).toBe("approval_decided");
  });

  it("returns a structured 404 for an unknown CRM account", async () => {
    const response = await testApp().inject({
      method: "GET",
      url: "/api/v1/accounts/acct-missing/profile",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: "not_found",
      message: "Account acct-missing was not found",
    });
  });
});
