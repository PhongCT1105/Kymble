# Known CRM Intelligence Backend Implementation Plan

> **For agentic workers:** Execute inline in the shared working tree. Do not switch branches or commit other workers' frontend changes.

**Goal:** Build a standalone TypeScript API that analyzes known CRM accounts, learns evidence-backed ICP clusters, and produces lifecycle-specific GTM decisions with real sponsor adapters.

**Architecture:** A Fastify HTTP layer calls one orchestration service. Domain functions are deterministic and provider-agnostic; repository and sponsor interfaces have fixture fallbacks plus InsForge, Nimble, HydraDB, and Kylon implementations selected from validated environment configuration.

**Tech Stack:** Node.js 24, TypeScript strict mode, Fastify, Zod, Vitest, native `fetch`, InsForge TypeScript SDK where configured.

## Global Constraints

- Never generate random prospect lists.
- Nimble research requires an existing account ID and domain.
- Preserve `verified`, `inferred`, `synthetic`, and `cached` trust labels.
- Do not claim native Kylon delivery without a documented configured endpoint.
- Do not send real outbound communication.
- Scores and lifecycle actions are deterministic.
- Keep the backend inside `backend/` to avoid frontend file conflicts.

---

### Task 1: Service shell and configuration

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/.env.example`
- Create: `backend/src/config.ts`
- Test: `backend/tests/config.test.ts`

**Interfaces:**
- Produces `loadConfig(env): AppConfig`, including explicit provider modes and validated URLs.

- [ ] Write tests that reject a partial InsForge or HydraDB configuration and default Nimble/Kylon/InsForge/HydraDB to fallback modes.
- [ ] Run the test and observe a missing-module failure.
- [ ] Implement the strict Zod configuration schema and package scripts.
- [ ] Run the test and typecheck.

### Task 2: Domain contracts and deterministic analysis

**Files:**
- Create: `backend/src/domain/types.ts`
- Create: `backend/src/domain/schemas.ts`
- Create: `backend/src/domain/analyze-account.ts`
- Create: `backend/src/domain/action-policy.ts`
- Test: `backend/tests/analyze-account.test.ts`

**Interfaces:**
- Consumes `AccountDossier`.
- Produces `AccountAnalysis` with profile questions, score contributions, cluster, findings, and recommended actions.

- [ ] Write tests proving a trial account and paying account with the same joint product fit receive different GTM actions.
- [ ] Write a test proving negative-control evidence cannot produce sponsor qualification.
- [ ] Run the tests and observe missing-module failures.
- [ ] Implement only the rules required by those tests.
- [ ] Run tests and typecheck.

### Task 3: Fixture CRM repository and 200+ record seed

**Files:**
- Create: `backend/src/repositories/crm-repository.ts`
- Create: `backend/src/repositories/fixture-crm-repository.ts`
- Create: `backend/src/fixtures/build-seed.ts`
- Test: `backend/tests/fixture-repository.test.ts`

**Interfaces:**
- Produces `listAccounts`, `getAccountDossier`, `saveAnalysisRun`, `getRun`, and `recordApprovalDecision`.

- [ ] Write tests requiring at least 40 accounts, 90 contacts, mixed lifecycle states, six ICP clusters, and more than 200 related records.
- [ ] Run the tests and observe failure.
- [ ] Implement deterministic seed generation that retains the five existing anchor accounts and builds realistic forms, usage, meetings, engagements, and evidence.
- [ ] Run repository and domain tests.

### Task 4: Sponsor provider adapters

**Files:**
- Create: `backend/src/providers/types.ts`
- Create: `backend/src/providers/nimble-provider.ts`
- Create: `backend/src/providers/hydra-provider.ts`
- Create: `backend/src/providers/kylon-provider.ts`
- Create: `backend/src/repositories/insforge-crm-repository.ts`
- Create: `backend/insforge/migrations/001_initial_schema.sql`
- Test: `backend/tests/providers.test.ts`

**Interfaces:**
- `NimbleProvider.enrichKnownAccount(account, questions)` rejects accounts without an ID or domain.
- `HydraProvider.rememberAndRecall(dossier)` returns recalled context plus warnings.
- `KylonProvider.createMissionPacket(analysis)` returns workspace/native delivery metadata.
- `InsForgeCrmRepository` maps the repository contract to InsForge tables.

- [ ] Write fetch-injected tests for request URLs, authorization headers, schemas, and fallback warnings.
- [ ] Run the tests and observe missing-module failures.
- [ ] Implement Nimble `/v1/search` and `/v1/extract` with account-scoped queries.
- [ ] Implement HydraDB memory and preference recall with tenant/sub-tenant scoping.
- [ ] Implement Kylon workspace packets and optional documented webhook delivery.
- [ ] Implement InsForge CRUD mappings and a versioned Postgres migration.
- [ ] Run provider tests and typecheck.

### Task 5: Workflow and HTTP API

**Files:**
- Create: `backend/src/services/account-intelligence-service.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Test: `backend/tests/api.test.ts`

**Interfaces:**
- Produces the `/health`, accounts, profile, analyze, clusters, runs, and approval routes from the design.

- [ ] Write API tests for health, list/profile, analysis, run retrieval, and human approval.
- [ ] Run the tests and observe missing-module failures.
- [ ] Implement the orchestration service and Fastify routes with Zod request validation.
- [ ] Ensure provider failures become warnings and audit events while deterministic analysis persists.
- [ ] Run the full test suite, typecheck, and build.

### Task 6: Frontend handoff and operational documentation

**Files:**
- Create: `backend/README.md`
- Create: `backend/openapi.yaml`
- Modify: `kymble_docs/docs/integration/nimble-api-notes.md`
- Modify: `kymble_docs/docs/integration/kylon-capability-matrix.md`

**Interfaces:**
- Produces exact local startup commands, environment variables, provider truth labels, and frontend request/response contracts.

- [ ] Document fixture startup and sponsor credential setup.
- [ ] Document that Kylon remains workspace mode until its API is confirmed.
- [ ] Validate OpenAPI syntax and compare its routes to API tests.
- [ ] Run final tests, typecheck, build, and `git diff --check`.

