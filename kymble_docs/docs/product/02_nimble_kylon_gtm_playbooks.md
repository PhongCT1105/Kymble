# Nimble + Kylon GTM Playbooks

## Purpose

Kymble does not use one generic lead score. It carries three related playbooks:

1. find the next Nimble customer;
2. find the next Kylon customer;
3. find a joint Nimble + Kylon opportunity.

Each playbook defines the customer pattern, public evidence, scoring inputs, false-positive risks, buyer roles, and the useful asset or next action to recommend.

---

# Playbook A — Find the Next Nimble Customer

## A1. Alta-like agentic GTM platform

### Verified pattern

The customer’s product requires deep external context about prospects, products, competitors, customer stories, technographics, and buying signals. Multiple agents consume the data, and shallow snippets or unstable extraction reduce product quality.

### Public buying signals

- launches an AI SDR, GTM agent, account-research agent, or enrichment product;
- product pages promise current company, competitor, or buyer intelligence;
- documentation describes browsing, web research, or multi-source enrichment;
- engineering or hiring pages mention web extraction, browser automation, data normalization, or search infrastructure;
- public posts discuss stale enrichment, blocked sources, incomplete coverage, or vendor fragmentation;
- recent funding or product launch indicates scale urgency;
- the company claims high-volume enrichment or many automated research runs.

### High-value source types

1. official product launch;
2. product documentation;
3. engineering blog;
4. job page;
5. founder or company post;
6. reputable launch or funding coverage.

### Likely buyers

- CTO or technical cofounder;
- VP Engineering;
- Head of Data;
- Head of AI;
- product leader for research or enrichment.

### Recommended asset

**Web Intelligence Reliability Audit**

Contents:

- external data types the product appears to require;
- likely freshness, extraction, and normalization risks;
- sample structured output generated through Nimble;
- recommended Search, Extract, Crawl, Map, or agent workflow;
- suggested technical validation session.

### False-positive risks

- “AI sales assistant” may use only internal CRM data;
- a web-data engineer role may support a non-core internal project;
- a launch announcement may describe future intent, not production usage.

---

## A2. Qodo-like freshness-sensitive AI product

### Verified pattern

The AI product needs current information from rapidly changing technical or regulated sources. Static indexes or embeddings become stale, and search snippets are insufficient for page-level reasoning.

### Public buying signals

- evaluates or generates code against current libraries;
- depends on current regulations, standards, advisories, or product documentation;
- publishes about stale RAG, outdated recommendations, or retraining frequency;
- support or release notes mention outdated answers;
- hires retrieval, browsing, search, or knowledge-infrastructure engineers;
- launches a capability that must reason over frequently changing sources.

### Recommended asset

**Freshness Gap Report**

Contents:

- sources that change most often;
- likely lag in the current retrieval design;
- one live Nimble extraction example;
- proposed refresh and validation policy.

### False-positive risks

- the product may already use another reliable live-web provider;
- the relevant corpus may be fully available through official APIs;
- freshness may be a minor rather than purchase-driving concern.

---

## A3. Grips-like web-data product

### Verified pattern

The business collects data from many sites, categories, or geographies. Coverage, reliability, and normalized extraction are part of the core product rather than a one-time research task.

### Public buying signals

- sells pricing, catalog, travel, property, digital shelf, or market intelligence;
- advertises coverage across thousands of pages, brands, locations, or domains;
- expands into new categories or countries;
- hires scraping, browser, anti-bot, ETL, or data-quality engineers;
- public status, docs, or reviews mention data gaps or freshness problems;
- customers depend on daily or near-real-time updates.

### Recommended asset

**Coverage and Scale Benchmark**

Contents:

- sample target sites;
- fields required per page;
- live extraction success sample;
- estimated refresh and normalization workflow;
- proposed proof of concept.

---

# Playbook B — Find the Next Kylon Customer

## Evidence status

Kylon’s public positioning can support a market hypothesis, but it should not be presented as a proven closed-won pattern unless the sponsor provides customer examples inside the challenge workspace.

## Hypothesized customer pattern

The company has several AI agents or automations operating across business tools. Agents and humans repeatedly reconstruct context, ownership is unclear, and sensitive actions need approval, auditability, or scoped permissions.

## Public buying signals

- launches several specialized agents rather than one assistant;
- publishes multi-agent architecture or agent-operations content;
- agents act across Slack, email, GitHub, CRM, support, or internal documents;
- hiring includes AI operations, automation, agent platform, or workflow roles;
- product or security materials mention human-in-the-loop approval;
- employees mention duplicated prompting, context handoff, or disconnected tools;
- the company is adding AI workflows across multiple departments;
- governance, observability, or permission requirements become visible.

## Strong synthetic private signals

These are appropriate for the demo CRM when labeled synthetic:

- form answer: “Our teams repeatedly explain context to separate agents”;
- event attendance: “Building an AI workforce” webinar;
- discovery-call statement: “Anything customer-facing must be approved”;
- repeated views of agent governance or shared-memory content;
- an internal note that sales, support, and research agents use separate state.

## Likely buyers

- COO;
- Head of AI Operations;
- VP Operations;
- CTO;
- Chief of Staff;
- automation or internal-platform leader.

## Recommended asset

**Agent Organization Readiness Map**

Contents:

- current people, agents, and systems;
- proposed Kylon channels or workspaces;
- shared data objects;
- ownership and handoff rules;
- autonomous versus approval-required actions;
- suggested pilot team and success metrics.

## False-positive risks

- multiple “agents” may only be marketing labels for one chatbot;
- the company may have a strong internal orchestration platform already;
- human approval may be needed only for a narrow regulated workflow;
- context fragmentation may not yet be costly enough to create urgency.

---

# Playbook C — Joint Nimble + Kylon Opportunity

## Best target

An AI-native company whose agents require live external web intelligence and whose human teams need to coordinate, verify, and approve the resulting work.

## Joint signal pattern

A strong joint opportunity usually includes:

- one live-web dependency;
- one structured extraction or freshness need;
- evidence of multiple agents or cross-functional automation;
- a shared-context, approval, or governance requirement;
- one recent trigger such as a launch, hiring push, expansion, or funding event.

## Example buying hypothesis

> The company recently launched an autonomous account-research agent, is hiring for resilient web-data infrastructure, and describes several agents acting across research, messaging, and CRM. Nimble can improve the live intelligence feeding the agents; Kylon can organize the coworkers, records, handoffs, and approvals around that intelligence.

## Joint deliverable

**AI GTM Organization Opportunity Brief**

Sections:

1. recent trigger timeline;
2. external data requirements;
3. source-backed Nimble pain hypothesis;
4. source-backed or synthetic Kylon workflow hypothesis;
5. separate score breakdowns;
6. proposed agent organization;
7. recommended pilot;
8. evidence, uncertainty, and alternative explanations;
9. human-approved next action.

## Joint qualification gate

Recommend a joint play only when:

```text
nimble_fit_score >= 70
kylon_fit_score >= 70
supported_public_signals >= 2
independent_source_domains >= 2
recent_trigger_count >= 1
```

If only one sponsor score is high, route the account to the corresponding sponsor-specific play rather than forcing a joint recommendation.
