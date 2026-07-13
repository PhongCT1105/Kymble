# Kymble Backend

Kymble's backend turns known CRM accounts into evidence-backed ICP learning and lifecycle-specific GTM decisions. It never generates a random prospect list.

## What runs today

The service implements this workflow:

```text
known account dossier
  -> optional account-scoped Nimble enrichment
  -> HydraDB memory write and recall
  -> deterministic Nimble/Kylon scoring and ICP clustering
  -> lifecycle-specific GTM actions
  -> Kylon mission packet and human approval
  -> InsForge run and audit persistence
```

Without credentials, it runs honestly in fixture mode with 40 accounts, 120 contacts, six ICP clusters, and 420 linked CRM/evidence records. Synthetic evidence can drive a simulated qualification, but the result carries a warning and must not be presented as verified customer evidence.

## Local start

```bash
cd backend
pnpm install
pnpm dev
```

The API listens on `http://127.0.0.1:8787`. The frontend can set:

```bash
NEXT_PUBLIC_KYMBLE_API_URL=http://127.0.0.1:8787
```

Useful requests:

```bash
curl http://127.0.0.1:8787/health
curl http://127.0.0.1:8787/api/v1/accounts
curl http://127.0.0.1:8787/api/v1/accounts/acct-revpilot/profile
curl -X POST http://127.0.0.1:8787/api/v1/accounts/acct-revpilot/analyze \
  -H 'content-type: application/json' \
  -d '{"enrich":false}'
```

The complete frontend contract is in [`openapi.yaml`](./openapi.yaml).

## Sponsor configuration

Copy `.env.example` to a private environment file or export the variables before starting the service. Do not commit keys.

### Nimble

Set `NIMBLE_API_KEY`. Kymble calls the official `POST /v1/search` and `POST /v1/extract` endpoints. Every search query contains the existing account's name and domain plus a concrete unanswered profile question. New results remain `weak` until a verifier maps the excerpt to a signal; a live API response cannot silently change a deterministic score.

### HydraDB

Set `HYDRA_DB_API_KEY`, `HYDRA_DB_TENANT_ID`, and `HYDRA_DB_BASE_URL`. Account memory uses `sub_tenant_id = accountId`, which isolates each account inside the Kymble tenant. The backend calls `POST /memories/add_memory` and `POST /recall/recall_preferences`. HydraDB augments context; it is not the transactional source of truth and cannot alter scores.

### Kylon

The default is `KYLON_MODE=workspace`. Every run returns a copy-ready mission packet containing four role handoffs, score references, evidence IDs, the proposed action, and approval requirements.

Only set `KYLON_MODE=native` and `KYLON_WEBHOOK_URL` after the sponsor confirms that endpoint. If native delivery fails, the response visibly falls back to workspace mode.

### InsForge

InsForge is the cloud operational database. The repository uses the official `@insforge/sdk`; the schema is versioned in `insforge/migrations/001_initial_schema.sql`.

Connect a project using the sponsor's canonical CLI workflow:

```bash
npx @insforge/cli login
npx @insforge/cli link
npx @insforge/cli current
npx @insforge/cli db migrations list
npx @insforge/cli db migrations up --all
```

Then set `INSFORGE_BASE_URL` and `INSFORGE_ANON_KEY` and seed a fresh project once:

```bash
pnpm db:seed:insforge
```

The seed command inserts the cluster and account parents before all child records. It is intentionally not an upsert; run it once on a fresh demo database so duplicate IDs cannot hide setup mistakes.

## API summary

- `GET /health` — service state and honest provider modes.
- `GET /api/v1/accounts` — known accounts, filterable by `lifecycle` or `cluster`.
- `GET /api/v1/accounts/:accountId/profile` — complete account dossier.
- `POST /api/v1/accounts/:accountId/analyze` — run and persist the workflow.
- `GET /api/v1/clusters` — the six testable ICP clusters.
- `GET /api/v1/runs/:runId` — analysis, provider modes, Kylon packet, approval, and audit trail.
- `POST /api/v1/approvals/:approvalId/decision` — record `approved`, `rejected`, or `more_research`; it never sends outbound.

## Quality gates

```bash
pnpm test
pnpm typecheck
pnpm build
```

Tests inject HTTP providers, so they never consume sponsor credits or depend on the network.
