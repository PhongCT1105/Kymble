# Dataset and Demo Scenarios

## Goal

Give the AI coworkers enough realistic context to execute an end-to-end GTM mission while remaining honest about which information is public, inferred, or synthetic.

Kymble uses a hybrid dataset because no single source contains the full buying journey:

1. real Nimble customer case studies teach the demand pattern;
2. real public web evidence demonstrates live account research;
3. synthetic CRM records simulate private information a GTM team would normally possess;
4. cached Nimble responses keep the demo repeatable.

## Trust metadata

Every record that could be mistaken for a real-world fact must include:

```json
{
  "trust_label": "verified | inferred | synthetic | cached",
  "source_url": null,
  "observed_at": "2026-07-13T18:00:00Z",
  "notes": "Human-readable disclosure"
}
```

## Layer 1 — Real customer-proof dataset

### Nimble / Alta

Use the official public case study as the primary demo input.

Extracted pattern:

- agentic GTM platform;
- requires deep structured prospect and company context;
- processes web data at very high volume;
- uses the data for sales narratives, competitive context, enrichment, and buying signals;
- values depth and reliability.

### Nimble / Qodo

Use as a secondary case demonstrating:

- freshness-sensitive technical context;
- stale embedding or index risk;
- need for more than search snippets;
- live page understanding for AI quality.

### Nimble / Grips Intelligence

Use as a secondary case demonstrating:

- large-scale collection across many sites and brands;
- product and pricing intelligence;
- normalization and coverage as core product requirements.

### Kylon

Use only sponsor-provided or publicly verified product information. Do not invent a Kylon customer and describe it as closed-won.

Store Kylon pattern records with:

```json
{
  "evidence_basis": "public_product_positioning | sponsor_provided | synthetic_demo",
  "trust_label": "verified | inferred | synthetic"
}
```

## Layer 2 — Synthetic private CRM dataset

Synthetic records are necessary because real private CRM data is unavailable. They should feel realistic enough to show how internal and external signals combine.

### Account 1 — RevPilot AI

**Purpose:** strongest joint Nimble + Kylon opportunity.

```text
Company: RevPilot AI
Industry: Sales technology
Employees: 21–50
Product: Autonomous account research and AI SDR platform
Private data status: Synthetic
```

#### Synthetic public-style triggers

- launched an autonomous account-research agent;
- posted a Senior Web Data Engineer role;
- product description mentions company research across many sources.

#### Synthetic first-party engagement

- attended an “Agentic GTM” webinar;
- submitted a form saying: “Our agents need reliable company data”;
- selected daily page volume `100k–1m`;
- confirmed that customer-facing actions need human approval;
- viewed a “Reliable Web Data for Agents” asset twice.

#### Synthetic discovery transcript

```text
CEO: We combine three providers because no single source gives us complete company context.
CTO: Our agents fail when page formats change and extracted fields are inconsistent.
CEO: Research, messaging, and CRM agents each keep separate context.
COO: Anything customer-facing must be approved by a human.
```

#### Expected interpretation

- Nimble pain: provider fragmentation, extraction instability, incomplete context;
- Kylon pain: separate agent context, handoff friction, human approval;
- recommended action: joint architecture workshop;
- expected scores: Nimble 80–95, Kylon 75–90.

### Account 2 — CodeCurrent

**Purpose:** strong Nimble-only freshness opportunity.

```text
Company: CodeCurrent
Industry: Developer tools
Product: AI code-security and review platform
Private data status: Synthetic
```

Signals:

- publishes about offline package indexes becoming stale;
- validates code against current dependencies;
- hires retrieval or technical knowledge engineers;
- little evidence of multi-agent organizational complexity.

Expected action: `Freshness Gap Report`.

### Account 3 — ShelfPulse

**Purpose:** Grips-like Nimble data-scale opportunity.

Signals:

- pricing-intelligence product;
- expands to two new markets;
- tracks many retailer pages;
- weak Kylon need.

Expected action: `Coverage and Scale Benchmark`.

### Account 4 — AgentMesh Labs

**Purpose:** strong Kylon-only opportunity.

Signals:

- several department-specific agents;
- Head of AI Operations opening;
- form statement that teams repeatedly explain context to separate agents;
- human approval required for sensitive actions;
- limited live-web dependency.

Expected action: `Agent Organization Readiness Map`.

### Account 5 — MarketAtlas

**Purpose:** negative control.

Signals:

- traditional analytics consultancy;
- no meaningful agent product;
- no live-web scale requirement;
- no multi-agent organization pain.

Expected decision: reject or insufficient evidence.

## Layer 3 — Live Nimble research dataset

During the demo, research at least one real company that publicly shows one or more relevant signals.

Every live evidence item stores:

```json
{
  "account_name": "Real company name",
  "account_domain": "example.com",
  "signal_definition_id": "agent-web-data-need",
  "source_url": "https://...",
  "source_title": "...",
  "source_type": "product | docs | job | news | engineering_blog | social",
  "published_at": null,
  "retrieved_at": "2026-07-13T18:00:00Z",
  "supporting_excerpt": "Short excerpt",
  "verification_status": "supported | weak | rejected",
  "trust_label": "verified"
}
```

A live account must not be qualified from a search snippet alone when the underlying page can be extracted.

## Layer 4 — Cached Nimble dataset

Cache one successful response for every step required in the golden path:

- search result list;
- extracted product or documentation page;
- extracted job or launch page;
- normalized evidence objects.

When cache is used, show:

> `Cached from a previous Nimble retrieval`

Do not silently represent cache as a live call.

## Event model

Kymble should demonstrate more than passive web research. Use the following event types in the CRM:

```text
case_study_selected
customer_dna_extracted
signal_blueprint_created
mission_launched
account_discovered
source_extracted
evidence_supported
evidence_rejected
score_calculated
strategy_ready
approval_requested
approval_granted
reply_simulated
opportunity_simulated
```

## Example inbound form

```json
{
  "company": "RevPilot AI",
  "role": "Co-founder and CEO",
  "product_type": "AI SDR and account research",
  "daily_pages": "100k-1m",
  "current_data_problem": "Our agents need reliable company data",
  "number_of_agents": 3,
  "systems_used": ["CRM", "team chat", "email", "research tools"],
  "needs_human_approval": true,
  "trust_label": "synthetic"
}
```

## Example meeting summary

```json
{
  "nimble_pain": [
    "multiple providers",
    "format instability",
    "incomplete account context"
  ],
  "kylon_pain": [
    "research, messaging, and CRM agents hold separate context",
    "customer-facing actions require approval"
  ],
  "recommended_next_step": "joint architecture workshop",
  "trust_label": "synthetic"
}
```

## Qualification expectations

| Account | Nimble fit | Kylon fit | Decision | Play |
|---|---:|---:|---|---|
| RevPilot AI | 80–95 | 75–90 | Qualify joint | Joint architecture workshop |
| CodeCurrent | 75–90 | 35–60 | Qualify Nimble | Freshness Gap Report |
| ShelfPulse | 70–88 | 15–40 | Qualify Nimble | Coverage and Scale Benchmark |
| AgentMesh Labs | 35–60 | 82–96 | Qualify Kylon | Agent Organization Readiness Map |
| MarketAtlas | 0–35 | 0–35 | Reject | None |

## Demo reset state

A reset must restore:

- 3 verified Nimble case studies;
- 5 synthetic accounts;
- 3 synthetic contacts;
- 4 synthetic engagement records;
- 5 synthetic events;
- 2 detailed synthetic forms;
- 3 synthetic social-style posts;
- 2 synthetic product-usage summaries;
- 1 synthetic meeting;
- 8 signal definitions;
- zero approvals;
- zero simulated opportunities;
- no active mission.
