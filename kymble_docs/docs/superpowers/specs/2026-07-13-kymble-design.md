# Kymble Design Specification

## Summary

Kymble is an AI GTM organization built specifically for the Nimble & Kylon sponsor challenge. It uses real Nimble customer case studies as closed-won training examples, turns customer conditions into observable public signals, discovers evidence with Nimble, and uses Kylon as the organization, handoff, and human-approval layer.

The custom dashboard is a lightweight CRM and visual audit surface. It supports the Kylon workspace rather than replacing it.

## Brand

- Name: **Kymble**
- Pronunciation: **KIM-buhl**
- Tagline: **Kymble finds who needs you next—and shows the receipts.**
- Naming origin: Kylon + Nimble

## Challenge hierarchy

1. Nimble & Kylon GTM AI Employee Challenge
2. Build your AI organization theme
3. Track 3 — AI Agent Company as the general category
4. Track 1 as an optional secondary category

## User story

As a Nimble or Kylon GTM leader, I select a real customer story and ask the organization to find companies entering similar buying situations. I receive a ranked pipeline where every recommendation is backed by public evidence, each task has an owner, and sensitive execution waits for a human decision.

## Scope

### Included

- Kymble sponsor-centered brand and copy;
- three real Nimble customer case studies;
- Nimble, Kylon, and joint signal playbooks;
- hybrid real, inferred, synthetic, and cached data;
- live Nimble search and extraction;
- local relational CRM;
- six specialized AI coworker roles;
- Kylon workspace integration using observed capabilities;
- evidence verification;
- deterministic sponsor-specific scoring;
- human approval;
- clearly simulated downstream reply and opportunity.

### Excluded

- real outbound email or LinkedIn actions;
- authenticated social collection;
- production CRM synchronization;
- multi-tenant authentication;
- billing;
- learned scoring models;
- generic multi-industry configuration;
- unsupported Kylon API claims.

## UX requirements

The dashboard has five screens:

1. Command Center
2. Customer Proof
3. Signal Map
4. Pipeline
5. Evidence Room

The live Kylon workspace must appear in the presentation as the organization surface.

The demo must emphasize records and state changes rather than long generated prose.

## Functional requirements

### FR-1 Sponsor setup

The project documents the Nimble signup URL and Kylon challenge workspace URL. The implementation records the Kylon capabilities actually available before selecting an integration mode.

### FR-2 Case-study ingestion

The user can select Alta, Qodo, or Grips Intelligence. The system displays the official source and extracts validated customer DNA with evidence excerpts.

### FR-3 Signal generation

The system creates public-signal hypotheses with query templates, source types, weights, recency windows, and false-positive risks.

### FR-4 Nimble research

The system performs at least one live Nimble Search and Extract sequence. Raw provider responses and normalized evidence are persisted.

### FR-5 Evidence verification

Each candidate item becomes supported, weak, or rejected. Verification checks source support, recency, source independence, and alternative explanations.

### FR-6 Deterministic scoring

Nimble and Kylon scores are computed by TypeScript functions. A joint play requires both scores to meet their threshold, two supported public signals, two source domains, and one recent trigger.

### FR-7 Organization workflow

Every mission creates agent-run and activity records. The workflow publishes mission updates, structured account summaries, and the final approval request to the highest supported Kylon integration mode.

### FR-8 Human approval

The recommended action creates a pending approval. Only explicit human input can approve or reject it.

### FR-9 Demo simulation

After approval, the user can simulate a positive reply and opportunity. All resulting records must show a `synthetic` label.

### FR-10 Reset

A single action restores the seed dataset, clears missions and approvals, and returns the UI to the Alta starting state.

## Nonfunctional requirements

- Golden path completes in under 90 seconds.
- The path works from cached Nimble responses when APIs fail.
- Every external and model output is Zod validated.
- Every evidence item contains a source URL and retrieval time.
- All provider errors are visible in the activity log.
- No private or authenticated social data collection.
- The Kylon mode is always visible.

## Architecture decisions

- Next.js App Router and strict TypeScript.
- SQLite + Drizzle for demo reliability.
- Provider adapters for Nimble, Kylon, and structured models.
- Domain services contain business logic.
- Fixture fallback is a supported operating mode.
- Trust labels are mandatory throughout the data model and UI.
- Kylon modes are `native`, `workspace`, and `mirror`.

## Acceptance test

Given a reset database, selecting Alta and launching a joint mission must:

1. create validated customer DNA;
2. create signal hypotheses;
3. perform a live or cached Nimble search/extract sequence;
4. create at least one researched account;
5. accept at least two evidence items from two domains;
6. calculate deterministic Nimble and Kylon scores;
7. move the account to `human_review`;
8. publish the approval request through the active Kylon mode;
9. require human approval;
10. advance to a simulated opportunity only after approval.
