# Kymble Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Kymble, a reliable three-minute sponsor-track demo that learns from real Nimble customer stories, discovers evidence with Nimble, and operates the AI GTM team and human approvals through Kylon.

**Architecture:** The Kylon challenge workspace is the primary organization surface; a Next.js App Router dashboard mirrors the operational CRM and audit trail. Nimble powers live discovery and extraction, SQLite/Drizzle guarantees deterministic state, and provider adapters support `native`, `workspace`, and `mirror` Kylon modes without inventing unsupported capabilities.

**Tech Stack:** Next.js, TypeScript strict mode, Tailwind CSS, shadcn/ui, Drizzle ORM, SQLite, Zod, Vitest, Playwright.

## Global Constraints

- Use the trust labels `verified`, `inferred`, `synthetic`, and `cached` everywhere.
- Never send real outbound communication.
- Do not scrape authenticated LinkedIn content.
- Qualification requires two supported signals, two independent domains, and one recent trigger.
- Scores must be deterministic TypeScript functions.
- Every external and model response must be Zod validated.
- The golden demo must run without external APIs by using cached fixtures.
- Nimble and Kylon must be visibly essential to the primary demo.
- The Kylon workspace URL and active capability mode must be documented and visible.
- Do not add another sponsor dependency until the golden path passes.

---

## Planned file structure

```text
app/
  page.tsx
  cases/page.tsx
  signals/page.tsx
  pipeline/page.tsx
  accounts/[accountId]/page.tsx
  api/demo/reset/route.ts
  api/missions/route.ts
  api/missions/[missionId]/run/route.ts
  api/accounts/[accountId]/approve/route.ts
  api/accounts/[accountId]/simulate-reply/route.ts
components/
  organization-chart.tsx
  agent-status-rail.tsx
  evidence-timeline.tsx
  score-breakdown.tsx
  trust-badge.tsx
  pipeline-table.tsx
lib/
  db/client.ts
  db/schema.ts
  db/seed.ts
  domain/types.ts
  domain/case-study-service.ts
  domain/signal-service.ts
  domain/qualification-service.ts
  domain/mission-service.ts
  domain/evidence-service.ts
  domain/demo-service.ts
  providers/web-intelligence.ts
  providers/nimble-provider.ts
  providers/fixture-web-provider.ts
  providers/organization-workspace.ts
  providers/workspace-mirror.ts
  providers/kylon-workspace.ts
  validation/schemas.ts
prompts/
  case-analyst.md
  signal-architect.md
  evidence-verifier.md
  account-strategist.md
tests/
  unit/qualification-service.test.ts
  unit/evidence-service.test.ts
  unit/demo-service.test.ts
  integration/mission-flow.test.ts
  e2e/golden-demo.spec.ts
```

---

### Task 0: Confirm sponsor capabilities and freeze the golden path

**Files:**
- Review and modify: `docs/integration/kylon-capability-matrix.md`
- Review and modify: `docs/integration/nimble-api-notes.md`
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Produces: a confirmed `KYLON_MODE`, the exact Nimble operations used by the demo, and a sponsor capability record that every later task relies on.

- [ ] **Step 1: Create the Nimble participant account**

Open:

```text
https://online.nimbleway.com/signup
```

Create an API key and store it only in `.env.local`:

```bash
NIMBLE_API_KEY=<participant-key>
NIMBLE_MODE=live
```

Expected: the key is never committed.

- [ ] **Step 2: Inspect the Kylon challenge workspace**

Open:

```text
https://app.kylon.io/c/q_rBaZ_kIMG8yUdV2FpiISm-rfosOZkj
```

Record the presence or absence of:

```markdown
| Capability | Available | Evidence / Notes |
|---|---:|---|
| Channels or conversations | yes/no | |
| Agent or coworker creation | yes/no | |
| Structured tables/records | yes/no | |
| Task ownership | yes/no | |
| Human approval | yes/no | |
| Webhook/API | yes/no | |
| Export/import | yes/no | |
```

- [ ] **Step 3: Select the Kylon integration mode**

Use this decision:

```text
confirmed API/webhook actions → native
workspace supports manual/semi-structured operation → workspace
workspace cannot support the golden flow → mirror
```

Write the selected value to `.env.local`:

```bash
KYLON_MODE=workspace
KYLON_WORKSPACE_URL=https://app.kylon.io/c/q_rBaZ_kIMG8yUdV2FpiISm-rfosOZkj
```

- [ ] **Step 4: Verify the minimum sponsor demo**

The frozen golden path must include:

```text
real Nimble case study
→ Nimble live search
→ Nimble page extraction
→ evidence and score in CRM
→ Kylon mission/account update
→ human approval
→ clearly simulated outcome
```

Remove any feature that does not support this path.

- [ ] **Step 5: Commit only documentation**

```bash
git add docs/integration README.md .env.example
git commit -m "docs: confirm Nimble and Kylon sponsor capabilities"
```

Do not commit `.env.local`.


### Task 1: Scaffold the application and quality gates

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

**Interfaces:**
- Produces a bootable Next.js application and test commands used by all later tasks.

- [ ] **Step 1: Create the project**

Run:

```bash
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias='@/*'
```

Expected: Next.js project files are created.

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm add drizzle-orm better-sqlite3 zod clsx tailwind-merge lucide-react
pnpm add -D drizzle-kit @types/better-sqlite3 vitest @vitest/coverage-v8 playwright @playwright/test tsx
```

Expected: dependency installation succeeds.

- [ ] **Step 3: Add scripts**

Set scripts in `package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "db:generate": "drizzle-kit generate",
  "db:seed": "tsx lib/db/seed.ts"
}
```

- [ ] **Step 4: Verify the baseline**

Run:

```bash
pnpm typecheck && pnpm build
```

Expected: both commands succeed.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold Kymble application"
```

---

### Task 2: Define domain types and validation schemas

**Files:**
- Create: `lib/domain/types.ts`
- Create: `lib/validation/schemas.ts`
- Test: `tests/unit/validation.test.ts`

**Interfaces:**
- Produces: `TrustLabel`, `PipelineStage`, `MissionStatus`, `CustomerDNA`, `SignalHypothesis`, `EvidenceCandidate`, `VerificationResult`, and their Zod schemas.

- [ ] **Step 1: Write a failing validation test**

```ts
import { describe, expect, it } from "vitest";
import { evidenceCandidateSchema } from "@/lib/validation/schemas";

describe("evidenceCandidateSchema", () => {
  it("rejects evidence without a source URL", () => {
    const result = evidenceCandidateSchema.safeParse({
      accountName: "RevPilot AI",
      accountDomain: "revpilot.example",
      signalDefinitionId: "agent-web-data-need",
      sourceTitle: "Launch",
      sourceType: "news",
      publishedAt: null,
      retrievedAt: "2026-07-13T18:00:00Z",
      excerpt: "Launched an autonomous account research agent"
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test**

```bash
pnpm vitest run tests/unit/validation.test.ts
```

Expected: FAIL because the schema does not exist.

- [ ] **Step 3: Implement exact enums and schemas**

Create strict Zod enums for:

```ts
export const trustLabelSchema = z.enum(["verified", "inferred", "synthetic", "cached"]);
export const pipelineStageSchema = z.enum([
  "discovered",
  "researching",
  "evidence_ready",
  "qualified",
  "strategy_ready",
  "human_review",
  "approved",
  "contacted_simulated",
  "replied_simulated",
  "opportunity_simulated",
  "rejected",
  "insufficient_evidence"
]);
```

Implement the evidence schema with `sourceUrl: z.string().url()`.

- [ ] **Step 4: Verify**

```bash
pnpm vitest run tests/unit/validation.test.ts && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/domain lib/validation tests/unit/validation.test.ts
git commit -m "feat: define trusted domain schemas"
```

---

### Task 3: Create the relational schema and seed data

**Files:**
- Create: `lib/db/client.ts`
- Create: `lib/db/schema.ts`
- Create: `lib/db/seed.ts`
- Create: `drizzle.config.ts`
- Test: `tests/unit/demo-service.test.ts`

**Interfaces:**
- Produces: `db`, all schema tables, and `resetDemoData(): Promise<DashboardMetrics>`.

- [ ] **Step 1: Write the reset test**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { resetDemoData } from "@/lib/domain/demo-service";

describe("resetDemoData", () => {
  it("restores five synthetic accounts and three verified cases", async () => {
    const metrics = await resetDemoData();
    expect(metrics.accountCount).toBe(5);
    expect(metrics.caseStudyCount).toBe(3);
    expect(metrics.pendingApprovals).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test**

```bash
pnpm vitest run tests/unit/demo-service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement schema**

Create the tables defined in `docs/engineering/05_data_model.md`. Use text IDs and ISO timestamp strings to keep the seed deterministic.

- [ ] **Step 4: Implement seed loading**

Read every JSON fixture from `data/` and insert records in a transaction. Normalize forms, social-style posts, and product-usage summaries into `engagements`. Ensure `.example` email domains for all synthetic contacts.

- [ ] **Step 5: Verify**

```bash
pnpm db:generate
pnpm db:seed
pnpm vitest run tests/unit/demo-service.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/db lib/domain/demo-service.ts drizzle.config.ts data tests/unit/demo-service.test.ts
git commit -m "feat: add deterministic CRM database and seeds"
```

---

### Task 4: Implement deterministic qualification

**Files:**
- Create: `lib/domain/qualification-service.ts`
- Test: `tests/unit/qualification-service.test.ts`

**Interfaces:**
- Produces: `calculateNimbleFit(input)`, `calculateKylonFit(input)`, and `qualifyAccount(input)`.

- [ ] **Step 1: Write the failing qualification tests**

```ts
import { describe, expect, it } from "vitest";
import { qualifyAccount } from "@/lib/domain/qualification-service";

describe("qualifyAccount", () => {
  it("qualifies a high-score account with independent recent evidence", () => {
    const result = qualifyAccount({
      score: 78,
      supportedSignalCount: 3,
      independentDomainCount: 2,
      hasRecentTrigger: true
    });
    expect(result).toBe("qualify");
  });

  it("requests more research when source independence is missing", () => {
    const result = qualifyAccount({
      score: 90,
      supportedSignalCount: 3,
      independentDomainCount: 1,
      hasRecentTrigger: true
    });
    expect(result).toBe("research_more");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
pnpm vitest run tests/unit/qualification-service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement formulas**

Copy the exact weights and gates from `docs/engineering/05_data_model.md`. Clamp all scores between 0 and 100.

- [ ] **Step 4: Verify**

```bash
pnpm vitest run tests/unit/qualification-service.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/domain/qualification-service.ts tests/unit/qualification-service.test.ts
git commit -m "feat: add transparent account qualification"
```

---

### Task 5: Implement evidence verification

**Files:**
- Create: `lib/domain/evidence-service.ts`
- Test: `tests/unit/evidence-service.test.ts`

**Interfaces:**
- Produces: `verifyEvidence(candidate, definition, existingEvidence): VerificationResult` and `countIndependentDomains(items): number`.

- [ ] **Step 1: Write tests for weak and duplicate evidence**

Test that:

- an expired job post is weak;
- an excerpt that lacks the signal keyword is rejected;
- two pages from the same root domain count as one independent source.

- [ ] **Step 2: Run tests**

```bash
pnpm vitest run tests/unit/evidence-service.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement verification**

Use deterministic checks first:

1. valid URL;
2. recency;
3. minimum excerpt length of 40 characters;
4. source-domain independence;
5. required term overlap from the signal definition.

Leave model-based semantic verification behind an optional interface; the deterministic path must pass alone.

- [ ] **Step 4: Verify and commit**

```bash
pnpm vitest run tests/unit/evidence-service.test.ts
git add lib/domain/evidence-service.ts tests/unit/evidence-service.test.ts
git commit -m "feat: verify evidence quality and independence"
```

---

### Task 6: Add Nimble and fixture web-intelligence providers

**Files:**
- Create: `lib/providers/web-intelligence.ts`
- Create: `lib/providers/nimble-provider.ts`
- Create: `lib/providers/fixture-web-provider.ts`
- Create: `data/cached_nimble_response.json`
- Test: `tests/unit/web-provider.test.ts`

**Interfaces:**
- Produces: `createWebIntelligenceProvider(env): WebIntelligenceProvider`.

- [ ] **Step 1: Write provider-selection tests**

Test that missing `NIMBLE_API_KEY` returns the fixture provider and that a configured key returns the Nimble provider.

- [ ] **Step 2: Implement the interface**

```ts
export interface WebIntelligenceProvider {
  search(input: SearchInput): Promise<SearchResult[]>;
  extract(input: ExtractInput): Promise<ExtractedPage>;
  mode: "live" | "fixture";
}
```

- [ ] **Step 3: Implement Nimble calls**

Use server-side `fetch`. Read base URL from `NIMBLE_API_BASE_URL` and key from `NIMBLE_API_KEY`. Send only documented Search and Extract request fields confirmed from sponsor credentials.

- [ ] **Step 4: Implement fallback**

On timeout, non-2xx response, or validation error, load the cached response and set `trustLabel` to `cached`.

- [ ] **Step 5: Verify and commit**

```bash
pnpm vitest run tests/unit/web-provider.test.ts
git add lib/providers data/cached_nimble_response.json tests/unit/web-provider.test.ts
git commit -m "feat: add resilient Nimble web intelligence"
```

---

### Task 7: Implement organization workspace adapters

**Files:**
- Create: `lib/providers/organization-workspace.ts`
- Create: `lib/providers/workspace-mirror.ts`
- Create: `lib/providers/kylon-workspace.ts`
- Test: `tests/unit/workspace-provider.test.ts`

**Interfaces:**
- Produces: `createOrganizationWorkspace(config): OrganizationWorkspace`.

- [ ] **Step 1: Write the workspace mirror test**

Assert that publishing an agent update creates an activity row and returns an acknowledgement ID.

- [ ] **Step 2: Implement the workspace mirror**

The workspace mirror writes mission, agent, and approval events into `activity_events` and returns acknowledgement IDs.

- [ ] **Step 3: Implement Kylon capability mode**

Read `KYLON_MODE`:

- `native` uses only sponsor-confirmed fields and endpoint configuration.
- `workspace` creates a structured mission packet and exposes copy/open actions for the supplied challenge workspace.
- `mirror` uses the local activity mirror as an emergency fallback.

Read `KYLON_WORKSPACE_URL` from the environment and default it to the challenge workspace URL documented in `.env.example`. Do not hard-code an undocumented API endpoint.

- [ ] **Step 4: Verify and commit**

```bash
pnpm vitest run tests/unit/workspace-provider.test.ts
git add lib/providers tests/unit/workspace-provider.test.ts
git commit -m "feat: add capability-based Kylon workspace adapter"
```

---

### Task 8: Implement the mission orchestrator

**Files:**
- Create: `lib/domain/mission-service.ts`
- Create: `lib/domain/case-study-service.ts`
- Create: `lib/domain/signal-service.ts`
- Test: `tests/integration/mission-flow.test.ts`

**Interfaces:**
- Produces: `createMission(request)`, `runMission(missionId)`, and `getMissionSnapshot(missionId)`.

- [ ] **Step 1: Write the golden integration test**

The test must:

1. reset data;
2. create an Alta joint mission;
3. run it with fixture providers;
4. assert one account reaches `human_review`;
5. assert at least two supported evidence items from two domains;
6. assert one pending approval.

- [ ] **Step 2: Run the test**

```bash
pnpm vitest run tests/integration/mission-flow.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement stage-by-stage orchestration**

At each stage:

- create an `agent_run`;
- set it running;
- perform one domain action;
- persist validated output;
- mark complete;
- publish activity to the workspace adapter.

- [ ] **Step 4: Add restartability**

Before running a stage, check whether a completed agent run already exists. Skip completed stages.

- [ ] **Step 5: Verify and commit**

```bash
pnpm vitest run tests/integration/mission-flow.test.ts
git add lib/domain tests/integration/mission-flow.test.ts
git commit -m "feat: orchestrate end-to-end GTM missions"
```

---

### Task 9: Create API routes and demo actions

**Files:**
- Create: `app/api/demo/reset/route.ts`
- Create: `app/api/missions/route.ts`
- Create: `app/api/missions/[missionId]/run/route.ts`
- Create: `app/api/accounts/[accountId]/approve/route.ts`
- Create: `app/api/accounts/[accountId]/simulate-reply/route.ts`
- Test: `tests/integration/api-routes.test.ts`

**Interfaces:**
- Produces JSON APIs consumed by the UI.

- [ ] **Step 1: Write route tests**

Test:

- reset returns 200 and starting metrics;
- mission creation rejects invalid playbook;
- approval changes `human_review` to `approved`;
- simulated reply is rejected before approval;
- simulated reply changes approved account to `opportunity_simulated`.

- [ ] **Step 2: Implement thin routes**

Each route:

1. parses with Zod;
2. calls a domain service;
3. returns typed JSON;
4. maps known errors to 400 or 409;
5. returns 500 without leaking secrets.

- [ ] **Step 3: Verify and commit**

```bash
pnpm vitest run tests/integration/api-routes.test.ts
git add app/api tests/integration/api-routes.test.ts
git commit -m "feat: expose mission and approval APIs"
```

---

### Task 10: Build the shared UI components

**Files:**
- Create: `components/trust-badge.tsx`
- Create: `components/organization-chart.tsx`
- Create: `components/agent-status-rail.tsx`
- Create: `components/evidence-timeline.tsx`
- Create: `components/score-breakdown.tsx`
- Create: `components/pipeline-table.tsx`
- Test: `tests/unit/trust-badge.test.tsx`

**Interfaces:**
- Produces reusable components for all screens.

- [ ] **Step 1: Write the trust badge test**

Assert that `synthetic` renders `Synthetic demo record` and `cached` renders `Cached from a previous live retrieval`.

- [ ] **Step 2: Implement accessible components**

Requirements:

- semantic headings;
- keyboard-accessible rows and actions;
- visible text labels, not color-only state;
- no animated layout shift in tables.

- [ ] **Step 3: Verify and commit**

```bash
pnpm vitest run tests/unit/trust-badge.test.tsx
pnpm typecheck
git add components tests/unit/trust-badge.test.tsx
git commit -m "feat: add evidence-first interface components"
```

---

### Task 11: Build the five product screens

**Files:**
- Modify: `app/page.tsx`
- Create: `app/cases/page.tsx`
- Create: `app/signals/page.tsx`
- Create: `app/pipeline/page.tsx`
- Create: `app/accounts/[accountId]/page.tsx`

**Interfaces:**
- Consumes the APIs from Task 9 and components from Task 10.

- [ ] **Step 1: Build Command Center**

Show mission, agents, KPIs, pipeline snapshot, API modes, and activity feed.

- [ ] **Step 2: Build Case Study Lab**

Render three official case studies and customer DNA with trust labels.

- [ ] **Step 3: Build Signal Blueprint**

Render condition → proxy → source → rule mappings and launch action.

- [ ] **Step 4: Build Pipeline**

Render sortable rows with Nimble fit, Kylon fit, priority, evidence, and stage.

- [ ] **Step 5: Build Evidence Room**

Render timeline, score breakdown, strategy, risks, and approval controls.

- [ ] **Step 6: Verify**

```bash
pnpm typecheck && pnpm build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app
git commit -m "feat: build Kymble operating interface"
```

---

### Task 12: Add the golden Playwright demo and final verification

**Files:**
- Create: `tests/e2e/golden-demo.spec.ts`
- Create: `scripts/demo-check.sh`

**Interfaces:**
- Produces a repeatable final acceptance check.

- [ ] **Step 1: Write the golden E2E test**

The Playwright test must:

1. reset demo;
2. open Alta;
3. launch joint mission;
4. wait for RevPilot AI to reach human review;
5. open Evidence Room;
6. verify at least two supported evidence cards;
7. approve next action;
8. simulate positive reply;
9. verify Opportunity and `Synthetic` labels.

- [ ] **Step 2: Run the E2E test**

```bash
pnpm dev
pnpm test:e2e --grep "golden demo"
```

Expected: PASS in under 90 seconds with fixture mode.

- [ ] **Step 3: Create the final verification script**

`scripts/demo-check.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e --grep "golden demo"
```

- [ ] **Step 4: Run final verification**

```bash
bash scripts/demo-check.sh
```

Expected: all commands pass.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e scripts/demo-check.sh
git commit -m "test: verify complete Kymble demo flow"
```
