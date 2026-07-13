import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";

import type { AppConfig } from "./config.js";
import { loadConfig } from "./config.js";
import {
  accountIdParamsSchema,
  accountListQuerySchema,
  analyzeAccountRequestSchema,
  approvalDecisionSchema,
  approvalIdParamsSchema,
  runIdParamsSchema,
} from "./domain/schemas.js";
import type { HydraProvider, NimbleProvider, OrganizationProvider } from "./providers/types.js";
import { DisabledHydraProvider, LiveHydraProvider } from "./providers/hydra-provider.js";
import { KylonProvider } from "./providers/kylon-provider.js";
import { FixtureNimbleProvider, LiveNimbleProvider } from "./providers/nimble-provider.js";
import type { CrmRepository } from "./repositories/crm-repository.js";
import { RecordNotFoundError } from "./repositories/crm-repository.js";
import { FixtureCrmRepository } from "./repositories/fixture-crm-repository.js";
import { InsforgeCrmRepository } from "./repositories/insforge-crm-repository.js";
import { AccountIntelligenceService } from "./services/account-intelligence-service.js";

type BuildAppOptions = {
  config?: AppConfig;
  repository?: CrmRepository;
  nimble?: NimbleProvider;
  hydra?: HydraProvider;
  kylon?: OrganizationProvider;
  now?: () => Date;
};

function providers(config: AppConfig) {
  const repository = config.insforge
    ? InsforgeCrmRepository.fromConfig(config.insforge)
    : new FixtureCrmRepository();
  const nimble = config.nimble
    ? new LiveNimbleProvider(config.nimble)
    : new FixtureNimbleProvider();
  const hydra = config.hydra
    ? new LiveHydraProvider(config.hydra)
    : new DisabledHydraProvider();
  const kylon = new KylonProvider({
    mode: config.providers.kylon,
    workspaceUrl: config.kylon.workspaceUrl,
    ...(config.kylon.webhookUrl ? { webhookUrl: config.kylon.webhookUrl } : {}),
  });
  return { repository, nimble, hydra, kylon };
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const config = options.config ?? loadConfig(process.env);
  const defaults = providers(config);
  const repository = options.repository ?? defaults.repository;
  const nimble = options.nimble ?? defaults.nimble;
  const hydra = options.hydra ?? defaults.hydra;
  const kylon = options.kylon ?? defaults.kylon;
  const service = new AccountIntelligenceService(
    repository,
    nimble,
    hydra,
    kylon,
    options.now,
  );
  const app = Fastify({ logger: false });

  void app.register(cors, {
    origin: config.frontendOrigin,
    methods: ["GET", "POST", "OPTIONS"],
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_error",
        message: "Request validation failed",
        issues: error.issues,
      });
    }
    if (error instanceof RecordNotFoundError) {
      return reply.status(404).send({ error: "not_found", message: error.message });
    }
    app.log.error(error);
    return reply.status(500).send({
      error: "internal_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  });

  app.get("/health", async () => ({
    status: "ok",
    providers: config.providers,
    knownAccounts: (await repository.listAccounts()).length,
  }));

  app.get("/api/v1/accounts", async (request) => {
    const query = accountListQuerySchema.parse(request.query);
    return { accounts: await repository.listAccounts(query) };
  });

  app.get("/api/v1/accounts/:accountId/profile", async (request) => {
    const { accountId } = accountIdParamsSchema.parse(request.params);
    return repository.getAccountDossier(accountId);
  });

  app.post("/api/v1/accounts/:accountId/analyze", async (request, reply) => {
    const { accountId } = accountIdParamsSchema.parse(request.params);
    const body = analyzeAccountRequestSchema.parse(request.body ?? {});
    const run = await service.analyzeKnownAccount(accountId, body);
    return reply.status(201).send(run);
  });

  app.get("/api/v1/clusters", async () => ({
    clusters: await repository.listClusters(),
  }));

  app.get("/api/v1/runs/:runId", async (request) => {
    const { runId } = runIdParamsSchema.parse(request.params);
    return repository.getRun(runId);
  });

  app.post("/api/v1/approvals/:approvalId/decision", async (request) => {
    const { approvalId } = approvalIdParamsSchema.parse(request.params);
    const body = approvalDecisionSchema.parse(request.body ?? {});
    return repository.recordApprovalDecision(
      approvalId,
      body.decision,
      body.note,
      options.now?.() ?? new Date(),
    );
  });

  return app;
}
