# Known CRM Intelligence Backend Design

## Product decision

Kymble starts with every account and contact already known to the company: paying customers, trials, evaluators, dormant accounts, expansion candidates, and rejected or low-fit accounts. It does not build lists by crawling random companies.

The backend answers four questions for each known account:

1. Who is using or evaluating the product?
2. Why, when, and how are they using it?
3. Which behavior and evidence patterns repeat across similar accounts?
4. What GTM decision follows for this account and this cluster?

The strongest demo use cases remain Nimble and Kylon. A recommendation can be Nimble-only, Kylon-only, joint, or neither; the system must not force sponsor fit.

## First implementation slice

The backend exposes a complete vertical workflow for synthetic CRM data:

```text
known CRM records
  -> normalized account dossier
  -> missing-question detection
  -> account-scoped Nimble evidence enrichment
  -> HydraDB memory write/recall
  -> deterministic ICP and lifecycle analysis
  -> cited GTM recommendations
  -> Kylon mission/approval packet
  -> persisted run and audit events in InsForge
```

The service operates in `fixture` mode without credentials. Each sponsor adapter reports its real mode and never presents a fallback as a live integration.

## Architecture

The backend is an independent TypeScript service in `backend/`. This avoids conflicts with the Next.js frontend and gives the frontend a stable HTTP contract.

Modules have narrow boundaries:

- `domain`: validated entities, scoring rules, cluster rules, and action policies;
- `repositories`: account data and analysis-run persistence;
- `providers/nimble`: searches and extracts evidence only for a supplied known account;
- `providers/hydra`: writes account observations as memory and recalls cluster context;
- `providers/kylon`: creates a structured workspace packet; native delivery exists only when a documented webhook is configured;
- `services`: coordinates the analysis workflow without provider-specific logic;
- `http`: routes, request validation, and serialized errors.

## Sponsor fit

### Nimble

Nimble supplies current public evidence for questions that first-party CRM data cannot answer. Queries include the account name or domain and a concrete question such as product launch timing, current AI workflow, public reliability pain, or governance requirements. Search uses `POST /v1/search`; extraction uses `POST /v1/extract` only for selected public URLs.

### Kylon

Kylon is the human-agent organization surface. Until a documented API or webhook is available, the backend returns a `workspace` mission packet with role handoffs, evidence references, proposed action, and a pending approval. It does not invent native synchronization.

### HydraDB

HydraDB is appropriate for persistent contextual memory, not the transactional source of truth. Each account is isolated by sub-tenant, while its ICP cluster is stored as shared knowledge. Recall augments the dossier with previous observations and relationships; deterministic application code still owns classification and scoring.

### InsForge

InsForge is appropriate as the operational backend: Postgres records accounts, contacts, evidence, runs, recommendations, approvals, and audit events. The initial code uses a repository interface and a fixture implementation for tests. The InsForge implementation activates when `INSFORGE_BASE_URL` and `INSFORGE_ANON_KEY` are configured.

## Analysis contract

An account analysis returns:

- lifecycle: `paying`, `trial`, `evaluator`, `dormant`, `expansion`, or `rejected`;
- use-case profile: Nimble, Kylon, joint, or non-fit;
- answered and missing profile questions;
- evidence references with source, timestamp, and trust label;
- deterministic Nimble and Kylon scores with contribution rows;
- primary ICP cluster and similar account IDs;
- findings that explain observed behavior;
- recommended GTM actions tailored to lifecycle and use case;
- a Kylon mission packet with a pending human decision when an external action is proposed;
- provider modes and warnings so the UI can distinguish live, cached, workspace, and fixture behavior.

## Decision policy

- Trial accounts receive a conversion diagnosis only when the dossier shows friction; trial status alone is not the strategy.
- Paying accounts can receive adoption, retention, expansion, or customer-proof actions.
- Strong repeated use cases can create a cluster-level play such as a benchmark, workshop, case study, or product investment decision.
- Accounts with insufficient or contradictory evidence receive a research action rather than a fit claim.
- Low-fit accounts remain useful negative controls for improving the ICP.

## Trust and safety

- Scores and classification are deterministic.
- Every external claim keeps its URL and retrieval time.
- Synthetic CRM data remains labeled `synthetic`.
- Provider responses are schema-validated.
- No authenticated social scraping and no real outbound messaging.
- Missing sponsor credentials produce explicit fallback modes, not fabricated success.

## API surface

- `GET /health` returns service and provider readiness.
- `GET /api/v1/accounts` lists known accounts and supports lifecycle/cluster filters.
- `GET /api/v1/accounts/:accountId/profile` returns the assembled dossier.
- `POST /api/v1/accounts/:accountId/analyze` runs the workflow and persists the result.
- `GET /api/v1/clusters` returns ICP clusters and aggregate observations.
- `GET /api/v1/runs/:runId` returns a completed analysis and audit trail.
- `POST /api/v1/approvals/:approvalId/decision` records a human decision; no external action is sent.

## Acceptance criteria

1. Tests can analyze a paying, trial, joint-fit, and negative-control account without network access.
2. Every analysis contains cited evidence or an explicit missing-evidence warning.
3. Provider modes are visible in health and analysis responses.
4. A trial and a paying account with similar product fit receive different recommended actions.
5. Nimble enrichment cannot run without a known account ID and domain.
6. HydraDB and InsForge failures degrade to explicit warnings without corrupting the deterministic result.
7. Kylon workspace mode produces a structured, copy-ready mission packet and pending approval.

