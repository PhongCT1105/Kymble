# Kymble Frontend (Design + Demo) — Spec

**Date:** 2026-07-13
**Scope:** Frontend-only. No backend, no database, no real Nimble/Kylon API calls. All screens read the existing `kymble_docs/data/*.json` fixtures as mock data. This is the real Next.js app shell from the full implementation plan, so a backend can drop in later without a rewrite.

## Goal

Build a beautiful, bright, working frontend for **Kymble** — the AI GTM organization for Nimble + Kylon — that carries the full 3-minute judge demo. "Launch GTM mission" runs a deterministic client-side simulation of the whole team working: agents flip state, an activity console streams, the pipeline moves, scores count up, and a human approves a next action.

## Design system — "Fresh SaaS bright"

**Thesis:** This is a *team at work*, not a chatbot. The one thing it's remembered by is **the receipts** — every piece of evidence is a monospace receipt/ticket card with its source and timestamp stamped on it ("Kymble finds who needs you next, and shows the receipts").

**Color tokens**
- `--canvas` `#F7F8FA`, `--surface` `#FFFFFF`, `--surface-2` `#FBFCFE`
- `--ink` `#0B1020`, `--muted` `#5B6478`, `--line` `#E7E9F0`
- `--nimble` `#3B5BFF` (electric blue — Nimble fit), `--kylon` `#7A4DFF` (violet — Kylon fit)
- Hero/CTA gradient: blue `#3B5BFF` → violet `#7A4DFF` (used sparingly)
- Trust labels (consistent everywhere): verified `#12A150`, inferred `#F5A524`, synthetic `#8B8AA6` (violet-grey), cached `#64748B` (slate)

**Type**
- Display: **Space Grotesk** — headings, hero, big metric numbers (used with restraint)
- Body: **Inter** — UI copy
- Utility/mono: **JetBrains Mono** — activity console lines, evidence receipts, timestamps, score breakdowns. Tabular figures so counting-up numbers don't jitter.

**Surface & motion**
- 12–14px card radius, hairline `--line` borders, restrained shadows, generous whitespace.
- Motion only on real state changes: agent state flips, score count-ups, pipeline row stage transitions, activity lines streaming in, approval badge pulse. Respect `prefers-reduced-motion`.

**Signature elements**
1. **Receipt/evidence card** — mono, source + published/retrieved timestamps stamped, trust badge, subtle perforated top edge.
2. **Live operations console** — the activity feed, streaming timestamped lines like an ops terminal.
3. **Agent org strip** — six coworkers you watch light up in sequence.

## App shell

Persistent header: Kymble wordmark, nav (Command Center | Customer Proof | Signal Map | Pipeline | Evidence Room), Kylon mode pill (`Native`/`Workspace`/`Mirror` — visual), Nimble mode pill (`Live`/`Cached` — visual, pulses during scout), `Reset Demo`, `Powered by Nimble + Kylon`.

## Screens

1. **Command Center** (`/`) — hero mission card + `Launch GTM mission`; six-coworker org strip with live states (waiting/running/completed/blocked/needs approval); six KPI tiles (cases learned, candidates found, evidence accepted, accounts qualified, pending approvals, simulated pipeline value); streaming activity console; pipeline snapshot.
2. **Customer Proof** (`/cases`) — three real case studies (Alta selected). Left: title, source link, customer, verified excerpts, trust badge. Right: 8 Customer DNA cards; inferred items labeled. `Build the buying pattern` CTA.
3. **Signal Map** (`/signals`) — rows/cards: condition → public proxy → Nimble query → source → weight → false-positive risk. Nimble / Kylon / Joint playbook toggle.
4. **Pipeline** (`/pipeline`) — sortable table: Account, Stage, Nimble, Kylon, Priority, Evidence, Why now. Rows animate through Discovered → Researching → Evidence Ready → Qualified → Human Review during a mission.
5. **Evidence Room** (`/accounts/[accountId]`) — account summary; trigger timeline; accepted / weak / rejected evidence receipts; split Nimble & Kylon score breakdowns; buying hypothesis + alternative explanations; human controls (Approve next action, Request more research, Reject, Open Kylon workspace, Simulate positive reply — disabled until approved); audit trail.

## Mission simulation (client-side, deterministic)

A single `useMissionSimulation` store/hook drives all screens. `Launch GTM mission` steps a ~30–40s timeline; each step: sets an agent running → completes it → appends activity line(s) → mutates derived state (DNA, signals, candidate accounts, evidence, scores, stages, KPIs). Order follows the six agents (Chief of Staff → Case Analyst → Signal Architect → Web Scout → Evidence Verifier → Account Strategist → Chief of Staff requests approval). Final state matches `data/expected_qualification.json` (e.g. RevPilot AI → Nimble 88 / Kylon 82, Human Review, pending approval). `Reset Demo` returns to the clean pre-mission state. State is in-memory only.

Human flow post-mission: `Approve next action` (Human Review → Approved) → `Simulate positive reply` (enabled only after approval → Opportunity, clearly `Synthetic`-labeled).

## Tech

Next.js (App Router) + TypeScript strict + Tailwind. shadcn/ui primitives (button, card, badge, table, tabs, tooltip) styled to the tokens above; Magic MCP / shadcn MCP may generate component starting points. Mock data read from `kymble_docs/data/*.json` via a typed `lib/mock` layer. Zustand (or React context) for the simulation store. lucide-react icons. Framer Motion for state-change animation.

## Out of scope

Real backend/DB, real Nimble/Kylon integration, auth, outbound anything, tests beyond a typecheck/build gate. `Live`/`Cached` and Kylon mode are visual pills only.

## Verify

`pnpm typecheck && pnpm build` pass; `pnpm dev` runs the golden path: Launch → watch the team work → open strongest account → Approve → Simulate reply → Synthetic opportunity; Reset returns clean.
