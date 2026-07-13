import { describe, expect, it } from "vitest";

import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("uses honest fallback modes when sponsor credentials are absent", () => {
    const config = loadConfig({});

    expect(config.providers).toEqual({
      insforge: "fixture",
      nimble: "fixture",
      hydra: "disabled",
      kylon: "workspace",
    });
    expect(config.port).toBe(8787);
  });

  it("rejects partial InsForge configuration", () => {
    expect(() =>
      loadConfig({ INSFORGE_BASE_URL: "https://demo.insforge.app" }),
    ).toThrow(/INSFORGE_ANON_KEY/);
  });

  it("rejects partial HydraDB configuration", () => {
    expect(() =>
      loadConfig({
        HYDRA_DB_API_KEY: "secret",
        HYDRA_DB_TENANT_ID: "kymble",
      }),
    ).toThrow(/HYDRA_DB_BASE_URL/);
  });

  it("enables live modes only with complete credential groups", () => {
    const config = loadConfig({
      INSFORGE_BASE_URL: "https://demo.insforge.app",
      INSFORGE_ANON_KEY: "anon_demo",
      NIMBLE_API_KEY: "nimble_demo",
      HYDRA_DB_API_KEY: "hydra_demo",
      HYDRA_DB_TENANT_ID: "kymble",
      HYDRA_DB_BASE_URL: "https://api.hydradb.com",
      KYLON_MODE: "native",
      KYLON_WEBHOOK_URL: "https://kylon.example/webhook",
    });

    expect(config.providers).toEqual({
      insforge: "live",
      nimble: "live",
      hydra: "live",
      kylon: "native",
    });
  });
});
