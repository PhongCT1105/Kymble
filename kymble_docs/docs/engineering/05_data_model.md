# Data Model and Scoring

## Goals

The schema must support four different kinds of truth:

- verified public customer and prospect evidence;
- AI inferences derived from that evidence;
- synthetic private CRM records used for the demo;
- cached copies of prior Nimble calls.

It must also support a visible organization: missions, agent runs, tasks, activities, approvals, and pipeline transitions.

## Shared enums

```ts
export type TrustLabel = "verified" | "inferred" | "synthetic" | "cached";

export type Playbook = "nimble" | "kylon" | "joint";

export type PipelineStage =
  | "discovered"
  | "researching"
  | "evidence_ready"
  | "qualified"
  | "strategy_ready"
  | "human_review"
  | "approved"
  | "contacted_simulated"
  | "replied_simulated"
  | "opportunity_simulated"
  | "rejected"
  | "insufficient_evidence";
```

## Tables

### `vendors`

| Column | Type | Notes |
|---|---|---|
| id | text PK | `nimble`, `kylon` |
| name | text | display name |
| website | text | official URL |
| product_summary | text | source-backed summary |
| trust_label | text | verified |

### `case_studies`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable case ID |
| vendor_id | text FK | Nimble for public cases |
| customer_name | text | Alta, Qodo, Grips Intelligence |
| title | text | official title |
| source_url | text | official case-study page |
| published_at | text nullable | when available |
| raw_content | text nullable | stored excerpt or normalized content |
| trust_label | text | verified |

### `case_study_facts`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable ID |
| case_study_id | text FK | source case |
| category | text | challenge, scale, capability, outcome |
| claim | text | normalized fact |
| supporting_excerpt | text | short evidence excerpt |
| trust_label | text | verified or inferred |

### `customer_dna`

| Column | Type | Notes |
|---|---|---|
| id | text PK | generated profile |
| case_study_id | text FK | source |
| customer_type | text | operational category |
| product_dependency_json | text | string array |
| challenges_json | text | structured facts |
| desired_outcomes_json | text | string array |
| capabilities_used_json | text | string array |
| likely_buyer_roles_json | text | may include inferred roles |
| created_at | text | ISO timestamp |

### `signal_definitions`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable ID |
| playbook | text | nimble, kylon, joint |
| name | text | signal label |
| private_condition | text | hidden pain learned from case |
| observable_proxy | text | public evidence to search |
| rationale | text | why it matters |
| search_queries_json | text | query templates |
| eligible_sources_json | text | product, docs, job, news, social |
| weight | integer | deterministic contribution |
| max_age_days | integer nullable | recency requirement |
| minimum_evidence | integer | minimum supported items |
| false_positive_risks_json | text | alternatives |

### `accounts`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable ID |
| name | text | company name |
| domain | text | company domain |
| description | text | summary |
| industry | text | category |
| employee_band | text | range |
| stage | text | pipeline state |
| nimble_fit_score | integer | 0–100 |
| kylon_fit_score | integer | 0–100 |
| engagement_score | integer | 0–20 |
| combined_priority | integer | derived |
| trust_label | text | synthetic or verified |

### `contacts`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable ID |
| account_id | text FK | account |
| full_name | text | fictional in seed data |
| title | text | buyer role |
| email | text | `.example` only for synthetic |
| linkedin_url | text nullable | null in synthetic seed |
| trust_label | text | synthetic |

### `engagements`

| Column | Type | Notes |
|---|---|---|
| id | text PK | event ID |
| account_id | text FK | company |
| contact_id | text FK nullable | person |
| type | text | form, event, content, email, social |
| occurred_at | text | ISO timestamp |
| details_json | text | payload |
| score_delta | integer | capped by service |
| trust_label | text | synthetic |


Seed files `synthetic_forms.json`, `synthetic_social_posts.json`, and `synthetic_product_usage.json` are normalized into `engagements` with `type` values `form`, `social`, and `product_usage`. Preserve the original payload in `details_json`.

### `meetings`

| Column | Type | Notes |
|---|---|---|
| id | text PK | meeting ID |
| account_id | text FK | account |
| title | text | explicitly synthetic title |
| occurred_at | text | ISO timestamp |
| transcript_json | text | fictional transcript |
| summary_json | text | extracted pains and next step |
| trust_label | text | synthetic |

### `account_signals`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable ID |
| account_id | text FK | company |
| signal_definition_id | text FK | signal type |
| interpretation | text | account-specific inference |
| confidence | integer | 0–100 |
| status | text | candidate, supported, weak, rejected |
| trust_label | text | inferred |

### `evidence_items`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable ID |
| account_signal_id | text FK | signal |
| source_url | text | page URL |
| source_title | text | page title |
| source_type | text | product, docs, job, news, social |
| published_at | text nullable | source date |
| retrieved_at | text | Nimble retrieval time |
| supporting_excerpt | text | short passage |
| source_domain | text | independence check |
| verification_status | text | supported, weak, rejected |
| trust_label | text | verified or cached |
| raw_provider_response_id | text nullable | traceability |

### `provider_responses`

| Column | Type | Notes |
|---|---|---|
| id | text PK | raw response ID |
| provider | text | nimble or fixture |
| operation | text | search or extract |
| request_json | text | sanitized request |
| response_json | text | raw provider response |
| retrieved_at | text | timestamp |
| trust_label | text | verified or cached |

### `qualification_runs`

| Column | Type | Notes |
|---|---|---|
| id | text PK | stable ID |
| account_id | text FK | account |
| playbook | text | nimble, kylon, joint |
| score | integer | deterministic |
| evidence_count | integer | supported count |
| independent_domain_count | integer | diversity |
| recent_trigger_count | integer | why-now gate |
| breakdown_json | text | contribution rows |
| decision | text | qualify, reject, research_more |
| created_at | text | timestamp |

### `missions`

| Column | Type | Notes |
|---|---|---|
| id | text PK | mission ID |
| reference_case_study_id | text FK | starting case |
| goal | text | human instruction |
| playbook | text | nimble, kylon, joint |
| status | text | mission state |
| maximum_accounts | integer | scope |
| minimum_score | integer | threshold |
| started_at | text nullable | time |
| completed_at | text nullable | time |
| workspace_mode | text | native, workspace, mirror |

### `agent_runs`

| Column | Type | Notes |
|---|---|---|
| id | text PK | run ID |
| mission_id | text FK | mission |
| agent_role | text | role key |
| task | text | assignment |
| status | text | queued, running, completed, failed |
| input_json | text | validated input |
| output_json | text | validated output |
| started_at | text nullable | time |
| completed_at | text nullable | time |

### `activity_events`

| Column | Type | Notes |
|---|---|---|
| id | text PK | event ID |
| mission_id | text FK | mission |
| account_id | text FK nullable | affected account |
| actor | text | coworker or human |
| event_type | text | machine-readable event |
| message | text | short UI status |
| trust_label | text | data status |
| created_at | text | time |

### `approvals`

| Column | Type | Notes |
|---|---|---|
| id | text PK | approval ID |
| mission_id | text FK | mission |
| account_id | text FK | company |
| requested_action | text | next action |
| rationale | text | evidence-based reason |
| status | text | pending, approved, rejected |
| decided_by | text nullable | human |
| decided_at | text nullable | time |
| kylon_receipt_json | text nullable | workspace acknowledgement |

## Deterministic Nimble fit

```text
Live or frequently changing data need       20
Structured page-level extraction need       20
High-volume or multi-source workflow         20
AI-agent or data-product dependency          15
Freshness or reliability pain                15
Recent urgency trigger                       10
-----------------------------------------------
Maximum                                    100
```

Nimble qualification gates:

- score at least 65;
- two supported signals;
- two independent source domains;
- one recent trigger in the past 180 days.

## Deterministic Kylon fit

```text
Multiple agents or AI workflows              20
Context spread across systems                20
Human-agent collaboration need               20
Approval or governance requirement           15
Cross-functional automation                  15
Recent AI-organization trigger               10
-----------------------------------------------
Maximum                                    100
```

Kylon public evidence may be combined with synthetic first-party CRM evidence, but the UI must show the trust label for every contribution.

## Joint play gate

```ts
const qualifiesJoint =
  nimbleFit >= 70 &&
  kylonFit >= 70 &&
  supportedPublicSignals >= 2 &&
  independentDomains >= 2 &&
  recentTriggerCount >= 1;
```

## Combined priority

```text
round(max(nimble_fit, kylon_fit) * 0.55
    + min(nimble_fit, kylon_fit) * 0.25
    + engagement_score * 1.0)
```

Engagement score is capped at 20.

## Score explanation contract

Every score must return contribution rows:

```ts
interface ScoreContribution {
  key: string;
  label: string;
  points: number;
  maximum: number;
  evidenceIds: string[];
  trustLabels: TrustLabel[];
}
```

The model may explain this breakdown but may not change points.
