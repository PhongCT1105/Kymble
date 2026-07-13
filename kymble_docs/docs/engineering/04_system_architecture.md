# System Architecture — Kymble

## Architectural goal

Build a reliable sponsor-centered demo where:

- Nimble supplies real-time external intelligence;
- Kylon is the visible AI-organization and approval workspace;
- a local operational CRM persists structured records and makes state changes easy to inspect;
- cached fixtures guarantee a successful three-minute presentation.

## System context

```text
Human GTM Director
        │
        ▼
Kylon workspace
Mission, coworkers, shared context, approval
        │
        ▼
Kymble orchestration service
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
Nimble  Structured      Operational CRM
Search  model calls     SQLite / Drizzle
Extract
        │
        ▼
Evidence, scores, pipeline, next action
        │
        └──────────────► Kylon approval update
```

## Product surfaces

### 1. Kylon workspace — primary organization surface

Use the sponsor-provided workspace for:

- mission creation;
- AI coworker roles;
- team channels or conversations;
- task ownership and handoffs;
- shared customer and account context;
- final human approval.

Kylon’s exact capabilities must be inspected at implementation time. Never assume unsupported APIs or workflow primitives.

### 2. Kymble web app — visual operations surface

Five views:

1. Command Center
2. Case Study Lab
3. Signal Blueprint
4. Account Pipeline
5. Evidence Room

The app mirrors work performed by the AI organization and provides a clear CRM-style demo for judges.

### 3. Nimble — live intelligence surface

Nimble Search and Extract are mandatory in the main workflow.

```ts
export interface WebIntelligenceProvider {
  search(input: SearchInput): Promise<SearchResult[]>;
  extract(input: ExtractInput): Promise<ExtractedPage>;
}
```

Implementations:

- `NimbleWebIntelligenceProvider`
- `FixtureWebIntelligenceProvider`

The provider must store raw responses before normalization.

### 4. Operational CRM

Use SQLite + Drizzle for the hackathon golden path.

Reasons:

- deterministic reset;
- no extra sponsor or network dependency;
- enough relational behavior for pipeline, tasks, approvals, and audit history;
- easy migration to Postgres after the event.

### 5. Structured model adapter

```ts
export interface StructuredModel {
  generateObject<T>(input: StructuredPrompt<T>): Promise<T>;
}
```

All outputs must pass Zod validation. After two validation failures, use a fixture result and log the fallback.

## Domain services

```text
case-study-service      verified case input → customer DNA
signal-service          customer DNA → signal hypotheses
nimble-service          search/extract provider orchestration
evidence-service        evidence normalization and verification
qualification-service   deterministic Nimble/Kylon scoring
strategy-service        score explanation and next action
mission-service         stage orchestration and activity events
workspace-service       Kylon publishing and approval integration
demo-service            reset, fixture mode, and simulated outcome
```

Route handlers and React components may not contain qualification or verification logic.

## Kylon integration modes

### Mode 1 — `native`

Use only when the challenge workspace exposes confirmed APIs, webhooks, or executable agent actions.

Capabilities may include:

```ts
export interface OrganizationWorkspace {
  publishMission(event: MissionEvent): Promise<void>;
  publishAgentUpdate(event: AgentUpdateEvent): Promise<void>;
  upsertStructuredRecord(record: WorkspaceRecord): Promise<void>;
  requestApproval(request: ApprovalRequest): Promise<ApprovalReceipt>;
}
```

### Mode 2 — `workspace`

Preferred fallback. The human runs or observes the organization in the Kylon workspace while Kymble generates structured mission packets, evidence summaries, and approval payloads that are pasted, imported, or posted through available controls.

The demo should still show the live Kylon workspace.

### Mode 3 — `mirror`

Emergency fallback. Kymble displays the organization activity locally while the Kylon workspace remains open as sponsor context. This mode must be visibly labeled and should not be described as a native integration.

## Mission state machine

```text
created
→ analyzing_case
→ designing_signals
→ discovering_accounts
→ extracting_evidence
→ verifying_evidence
→ scoring_accounts
→ preparing_strategy
→ awaiting_approval
→ completed
```

Recoverable terminal state:

```text
failed_recoverable
```

A retry resumes from the last completed stage.

## Account pipeline state machine

```text
discovered
→ researching
→ evidence_ready
→ qualified
→ strategy_ready
→ human_review
→ approved
→ contacted_simulated
→ replied_simulated
→ opportunity_simulated
```

Other terminal states:

- `rejected`
- `insufficient_evidence`

## Golden mission data flow

1. User selects Alta.
2. Case Analyst returns validated customer DNA.
3. Signal Architect creates sponsor-specific public proxies.
4. Chief of Staff records the mission and publishes it to Kylon.
5. Web Scout runs Nimble discovery queries.
6. Nimble Extract retrieves the strongest source pages.
7. Evidence Verifier accepts, weakens, or rejects each claim.
8. Qualification service calculates Nimble and Kylon scores.
9. Account Strategist produces a next-best action without changing scores.
10. CRM stage advances to `human_review`.
11. Kylon receives the recommendation and approval request.
12. A human approves or rejects.
13. The app may then simulate a reply and opportunity.

## Reliability requirements

### Nimble failure

- retry 429 and 5xx responses with exponential backoff;
- fall back to cached data after the retry budget;
- preserve the error in the activity log;
- display `Cached from a previous Nimble retrieval`.

### Kylon capability unavailable

- switch to `workspace` or `mirror` mode;
- produce a structured mission packet;
- show the exact mode in the UI;
- never claim native automation.

### Model output invalid

- validate with Zod;
- retry once with schema-error feedback;
- use fixture output after a second failure;
- record the fallback.

### Duplicate sources

- normalize domains;
- deduplicate identical URLs;
- do not count two pages from the same domain as independent proof unless they add different evidence and the gate explicitly permits it.

## Security and privacy

- keep API keys server-side;
- use `.example` domains for synthetic contacts;
- do not collect authenticated LinkedIn data;
- do not expose sensitive infrastructure findings in outreach;
- do not send external communication from the demo;
- preserve only short supporting excerpts, not unnecessary full-page copies.

## Observability

Every mission stage writes an `activity_event` with:

```ts
interface ActivityEvent {
  id: string;
  missionId: string;
  accountId?: string;
  actor: string;
  eventType: string;
  message: string;
  trustLabel: TrustLabel;
  createdAt: string;
}
```

The Command Center streams or polls these events to make the organization visibly active.
