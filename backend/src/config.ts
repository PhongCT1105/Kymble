import { z } from "zod";

export type ProviderModes = {
  insforge: "fixture" | "live";
  nimble: "fixture" | "live";
  hydra: "disabled" | "live";
  kylon: "workspace" | "native";
};

export type AppConfig = {
  host: string;
  port: number;
  frontendOrigin: string;
  providers: ProviderModes;
  insforge?: { baseUrl: string; anonKey: string };
  nimble?: { apiKey: string; baseUrl: string };
  hydra?: { apiKey: string; tenantId: string; baseUrl: string };
  kylon: { workspaceUrl: string; webhookUrl?: string };
};

const optionalValue = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const envSchema = z.object({
  HOST: z.string().trim().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  FRONTEND_ORIGIN: z.url().default("http://localhost:3000"),
  INSFORGE_BASE_URL: optionalValue,
  INSFORGE_ANON_KEY: optionalValue,
  NIMBLE_API_KEY: optionalValue,
  NIMBLE_BASE_URL: z.url().default("https://sdk.nimbleway.com/v1"),
  HYDRA_DB_API_KEY: optionalValue,
  HYDRA_DB_TENANT_ID: optionalValue,
  HYDRA_DB_BASE_URL: optionalValue,
  KYLON_MODE: z.enum(["workspace", "native"]).default("workspace"),
  KYLON_WORKSPACE_URL: z
    .url()
    .default("https://app.kylon.io/c/q_rBaZ_kIMG8yUdV2FpiISm-rfosOZkj"),
  KYLON_WEBHOOK_URL: optionalValue,
});

function requireGroup(
  groupName: string,
  values: Record<string, string | undefined>,
): boolean {
  const present = Object.values(values).filter(Boolean).length;
  if (present > 0 && present < Object.keys(values).length) {
    const missing = Object.entries(values)
      .filter(([, value]) => !value)
      .map(([key]) => key)
      .join(", ");
    throw new Error(`${groupName} configuration is incomplete; missing ${missing}`);
  }
  return present === Object.keys(values).length;
}

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const parsed = envSchema.parse(env);
  const insforgeLive = requireGroup("InsForge", {
    INSFORGE_BASE_URL: parsed.INSFORGE_BASE_URL,
    INSFORGE_ANON_KEY: parsed.INSFORGE_ANON_KEY,
  });
  const hydraLive = requireGroup("HydraDB", {
    HYDRA_DB_API_KEY: parsed.HYDRA_DB_API_KEY,
    HYDRA_DB_TENANT_ID: parsed.HYDRA_DB_TENANT_ID,
    HYDRA_DB_BASE_URL: parsed.HYDRA_DB_BASE_URL,
  });

  if (parsed.KYLON_MODE === "native" && !parsed.KYLON_WEBHOOK_URL) {
    throw new Error("KYLON_WEBHOOK_URL is required when KYLON_MODE=native");
  }

  const config: AppConfig = {
    host: parsed.HOST,
    port: parsed.PORT,
    frontendOrigin: parsed.FRONTEND_ORIGIN,
    providers: {
      insforge: insforgeLive ? "live" : "fixture",
      nimble: parsed.NIMBLE_API_KEY ? "live" : "fixture",
      hydra: hydraLive ? "live" : "disabled",
      kylon: parsed.KYLON_MODE,
    },
    kylon: {
      workspaceUrl: parsed.KYLON_WORKSPACE_URL,
      ...(parsed.KYLON_WEBHOOK_URL
        ? { webhookUrl: parsed.KYLON_WEBHOOK_URL }
        : {}),
    },
  };

  if (insforgeLive) {
    config.insforge = {
      baseUrl: parsed.INSFORGE_BASE_URL!,
      anonKey: parsed.INSFORGE_ANON_KEY!,
    };
  }
  if (parsed.NIMBLE_API_KEY) {
    config.nimble = {
      apiKey: parsed.NIMBLE_API_KEY,
      baseUrl: parsed.NIMBLE_BASE_URL,
    };
  }
  if (hydraLive) {
    config.hydra = {
      apiKey: parsed.HYDRA_DB_API_KEY!,
      tenantId: parsed.HYDRA_DB_TENANT_ID!,
      baseUrl: parsed.HYDRA_DB_BASE_URL!,
    };
  }

  return config;
}
