# Kymble — The GTM Team for Nimble + Kylon

> **Kymble finds who needs you next—and shows the receipts.**

Kymble is a sponsor-track hackathon MVP built specifically for the **Nimble & Kylon GTM AI Employee Challenge**. It turns real Nimble customer stories into an operating GTM organization: one group of AI coworkers learns why customers bought, Nimble searches the live web for companies showing similar buying conditions, and Kylon coordinates the research, shared context, handoffs, and human approvals.

The custom application is not the “AI organization” by itself. It is the visual operating dashboard and lightweight CRM that makes the work completed through Nimble and Kylon easy to inspect during a three-minute demo.

## Challenge hierarchy

1. **Primary:** Nimble & Kylon sponsor track / GTM AI Employee Challenge
2. **Hackathon theme:** Build your AI organization
3. **General category:** Track 3 — AI Agent Company
4. **Optional secondary category:** Track 1 — AI SaaS Startup

Nimble and Kylon are mandatory product dependencies. Other sponsor tools are intentionally excluded from the MVP unless needed after the golden path works.

## Core demo thesis

> Most AI sales tools write messages after a lead list already exists. Kymble learns from a real customer win, discovers companies entering the same buying situation, verifies the evidence, and turns the result into an accountable team workflow.

## Sponsor-centered value

### For Nimble

Kymble identifies potential Nimble customers whose products depend on fresh, structured, reliable web data—such as GTM agents, code assistants, and large-scale market-intelligence platforms.

### For Kylon

Kymble provides a concrete showcase for a Kylon workspace: specialized AI coworkers share context, maintain structured account records, hand work to one another, and pause sensitive actions for human approval.

### For the joint sponsor motion

Kymble finds companies that need both:

- Nimble for live external intelligence;
- Kylon for organizing the agents and humans that act on that intelligence.

## Golden demo

1. Select Nimble’s real Alta case study.
2. Extract a verified customer DNA profile.
3. Convert the customer conditions into public buying-signal hypotheses.
4. Launch a GTM mission from the Kylon workspace or mirrored command center.
5. Use Nimble Search and Extract to research candidate companies.
6. Persist sources, timestamps, account scores, tasks, and pipeline stages.
7. Publish the strongest account and recommendation to Kylon.
8. Require a human to approve the next action.
9. Clearly simulate a positive reply and opportunity update.

## What is real versus simulated

- **Verified:** official Nimble product information and public customer case studies.
- **Live:** Nimble search and extraction results generated during the demo.
- **Inferred:** buying-signal and fit hypotheses derived from verified evidence.
- **Synthetic:** private CRM contacts, engagement events, meeting transcripts, replies, and opportunity amounts.
- **Cached:** prior live Nimble results used only when the live API is unavailable.

Never present synthetic records as real facts about a company or person.

## Recommended reading order

1. `AGENTS.md`
2. `docs/product/00_naming_and_brand.md`
3. `docs/product/01_product_brief.md`
4. `docs/product/02_nimble_kylon_gtm_playbooks.md`
5. `docs/product/03_dataset_and_demo_scenarios.md`
6. `docs/integration/kylon-capability-matrix.md`
7. `docs/integration/nimble-api-notes.md`
8. `docs/engineering/04_system_architecture.md`
9. `docs/engineering/05_data_model.md`
10. `docs/engineering/06_agent_contracts.md`
11. `docs/demo/07_frontend_and_demo_spec.md`
12. `docs/demo/08_pitch_submission.md`
13. `docs/product/09_sources_and_claims.md`
14. `docs/superpowers/specs/2026-07-13-kymble-design.md`
15. `docs/superpowers/plans/2026-07-13-kymble-implementation.md`

## Included seed datasets

- `data/vendors.json`
- `data/real_case_studies.json`
- `data/synthetic_accounts.json`
- `data/synthetic_contacts.json`
- `data/synthetic_engagements.json`
- `data/synthetic_meetings.json`
- `data/synthetic_events.json`
- `data/synthetic_forms.json`
- `data/synthetic_social_posts.json`
- `data/synthetic_product_usage.json`
- `data/signal_definitions.json`
- `data/expected_qualification.json`

## Sponsor setup

- Nimble signup: `https://online.nimbleway.com/signup`
- Kylon challenge workspace: `https://app.kylon.io/c/q_rBaZ_kIMG8yUdV2FpiISm-rfosOZkj`

Create the Nimble API key first. Then inspect the Kylon workspace for the exact capabilities, agent creation flow, tables, channels, and integration methods available to participants. The code must adapt to what is actually provided; never invent a Kylon API.
