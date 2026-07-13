# AGENTS.md — Kymble Implementation Contract

## Mission

Build a trustworthy three-minute demo for the **Nimble & Kylon GTM AI Employee Challenge**.

Kymble must:

1. Learn a buying pattern from a real Nimble customer case study.
2. Convert that pattern into timestamped public buying-signal hypotheses.
3. Use Nimble for live discovery and page-level extraction.
4. Use the supplied Kylon workspace as the primary organization and approval layer whenever its available capabilities permit.
5. Store accounts, evidence, scores, tasks, approvals, and agent activity in a real operational database.
6. Show multiple specialized AI coworkers completing an end-to-end GTM mission.
7. Clearly distinguish verified, inferred, synthetic, and cached information.
8. Produce an evidence-backed pipeline action, not merely generated prose.

## Sponsor-first constraints

- The primary optimization target is the Nimble & Kylon sponsor challenge.
- Track 3 is only the general submission category.
- Nimble and Kylon must be visibly essential to the main demo.
- Do not add a third sponsor dependency until the full golden path works.
- The custom app supports Kylon; it must not pretend to replace the Kylon workspace.

## Non-negotiable trust rules

- Never claim synthetic meeting transcripts, contacts, form submissions, or replies are real.
- Every public claim must retain its source URL and retrieval timestamp.
- A qualified account requires at least two supported signals from two independent domains.
- At least one supported signal must be recent enough to establish “why now.”
- Scores are calculated by deterministic application code. Models may explain them but may not alter them.
- Do not scrape authenticated LinkedIn content or bypass access controls.
- Do not send real outbound email in the MVP.
- The demo must continue from cached Nimble evidence if the live API fails, with a visible cached label.
- Kylon integration must use only capabilities observed in the challenge workspace or explicitly documented by the sponsor.

## Required sponsor setup

```text
Nimble signup:
https://online.nimbleway.com/signup

Kylon challenge workspace:
https://app.kylon.io/c/q_rBaZ_kIMG8yUdV2FpiISm-rfosOZkj
```

Before implementation, record which Kylon capabilities are available:

- channels or conversations;
- AI coworkers or agent definitions;
- tables or structured records;
- tasks and ownership;
- approval controls;
- webhooks, APIs, or integrations;
- export/import options.

Select the highest supported integration mode:

1. `native` — direct Kylon action/API integration confirmed by the sponsor;
2. `workspace` — mission is operated manually or semi-manually in Kylon with structured packets from the app;
3. `mirror` — local activity mirror used only as a backup while the live Kylon workspace is shown separately.

## MVP scope

### Required

- Kymble naming and sponsor-focused copy.
- Case-study selector containing Alta, Qodo, and Grips Intelligence.
- Customer DNA extraction with evidence excerpts.
- Nimble, Kylon, and joint buyer playbooks.
- Five synthetic CRM accounts with forms, events, social-style posts, product usage, meetings, and engagement history.
- At least one live account researched through Nimble.
- Evidence cards with URLs, timestamps, confidence, and trust labels.
- Separate deterministic Nimble-fit and Kylon-fit scores.
- Pipeline stage transitions and a visible activity audit trail.
- Mission handoffs visible in Kylon.
- Human approval before the recommended external action.
- Clearly simulated positive reply and opportunity creation.
- One-click reset for repeated demos.

### Explicitly excluded

- Production authentication or multi-tenancy.
- Billing.
- Sending real email or LinkedIn messages.
- Authenticated social scraping.
- Full HubSpot or Salesforce synchronization.
- Machine-learned lead scoring.
- Generic support for every industry.
- More than six AI coworker roles.

## Recommended stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- SQLite + Drizzle ORM for deterministic local demo behavior
- Nimble Search and Extract APIs
- Kylon challenge workspace
- Zod for every external and model output
- Vitest for unit/integration tests
- Playwright for the golden demo flow

A cloud database may replace SQLite only after the local golden path passes three times.

## Shared trust type

```ts
export type TrustLabel = "verified" | "inferred" | "synthetic" | "cached";
```

Required UI labels:

- `Verified public source`
- `AI inference from verified evidence`
- `Synthetic demo record`
- `Cached from a previous Nimble retrieval`

## AI coworker roster

- `chief_of_staff` — plans the mission, manages handoffs, and requests approval.
- `case_analyst` — extracts customer DNA from verified case studies.
- `signal_architect` — maps customer pain to public buying signals.
- `web_scout` — uses Nimble Search and Extract.
- `evidence_verifier` — checks support, recency, and source independence.
- `account_strategist` — explains scores and recommends the next action.

Approval is a workflow state controlled by a human, not a seventh autonomous agent.

## Definition of done

A clean reset must complete this path in under 90 seconds:

1. Select Alta.
2. Extract customer DNA.
3. Generate sponsor-specific signal hypotheses.
4. Launch a joint Nimble + Kylon mission.
5. Add one live or cached researched account.
6. Attach at least two accepted evidence items from different domains.
7. Calculate Nimble and Kylon scores in code.
8. Move the account into `human_review`.
9. Publish or display the matching Kylon mission update.
10. Approve the next action as a human.
11. Simulate a reply and move the account to a simulated opportunity.
