# Frontend and Three-Minute Demo Specification

## UX goal

Make Kymble feel like a small GTM team actively operating a business—not a chatbot returning a long answer.

The judge should see:

- a real customer story;
- distinct AI coworkers;
- live Nimble research;
- evidence entering a CRM;
- transparent sponsor-specific scores;
- a Kylon handoff;
- a human approval;
- a visible business outcome.

## Visual direction

Kymble should feel warm, slightly playful, and operational.

- use the name **Kymble**, not a long AI acronym;
- favor concise status copy such as `Scout found 3 sources`;
- use rounded cards, clear stage pills, and visible evidence trails;
- avoid neon “AI brain” visuals and decorative agent graphs with no meaning;
- animate only actual state changes;
- place trust badges beside claims, not in a distant disclaimer.

## Navigation

```text
Kymble
Command Center | Customer Proof | Signal Map | Pipeline | Evidence Room
```

Persistent header controls:

- active Kylon mode: `Native`, `Workspace`, or `Mirror`;
- Nimble mode: `Live` or `Cached`;
- `Reset Demo`;
- sponsor labels: `Powered by Nimble + Kylon`.

## Screen 1 — Command Center

### Purpose

Show the AI organization, active mission, live progress, and business metrics.

### Hero

```text
Find the next company that needs Nimble + Kylon

Learn from: Alta customer story
Goal: Find 5 AI-native companies with live-web and agent-coordination needs
Minimum score: 70
Required public evidence: 2 sources
```

Primary action:

> **Launch GTM mission**

### Organization strip

Show six coworkers with state:

- Chief of Staff
- Case Analyst
- Signal Architect
- Web Scout
- Evidence Verifier
- Account Strategist

States:

- waiting;
- running;
- completed;
- blocked;
- needs approval.

### Metrics

- case studies learned from;
- candidate accounts found;
- evidence items accepted;
- accounts qualified;
- pending approvals;
- simulated pipeline value.

### Activity feed

Examples:

```text
11:34:02 Case Analyst extracted 5 verified conditions from Alta
11:34:06 Signal Architect created 6 public proxies
11:34:11 Web Scout started 4 Nimble searches
11:34:18 Verifier rejected a generic company-description claim
11:34:21 RevPilot AI scored Nimble 88 / Kylon 82
11:34:25 Chief of Staff requested human approval in Kylon
```

## Screen 2 — Customer Proof

### Purpose

Show how a real case study becomes structured GTM intelligence.

### Left panel

- official case title;
- source link;
- customer name;
- verified excerpts;
- trust badge.

### Right panel

Customer DNA cards:

- customer type;
- product dependency;
- operational challenge;
- likely trigger;
- desired outcome;
- capability used;
- measurable result;
- likely buyer roles.

Every inferred item must be labeled.

Primary action:

> **Build the buying pattern**

## Screen 3 — Signal Map

### Purpose

Show the reasoning step from hidden pain to observable public evidence.

Use rows or connected cards:

```text
Customer condition
→ public proxy
→ Nimble query
→ preferred source
→ weight
→ false-positive risk
```

Example:

```text
Agents require deep current prospect context
→ company launches autonomous account research
→ "company autonomous account research agent launch"
→ product launch + docs
→ +20 Nimble fit
→ may rely only on internal CRM data
```

Allow toggles:

- Nimble playbook;
- Kylon playbook;
- Joint playbook.

## Screen 4 — Pipeline

### Purpose

Show records moving through a real state machine.

Recommended table:

| Account | Stage | Nimble | Kylon | Priority | Evidence | Why now |
|---|---|---:|---:|---:|---:|---|
| RevPilot AI | Human review | 88 | 82 | 86 | 4 | Agent launch + web-data hiring |
| CodeCurrent | Qualified | 84 | 48 | 70 | 3 | Freshness post |
| AgentMesh Labs | Strategy ready | 46 | 91 | 73 | 3 | AI operations hiring |

Visible transitions:

```text
Discovered → Researching → Evidence Ready → Qualified → Human Review
```

Rows should update as activity events arrive.

## Screen 5 — Evidence Room

### Purpose

Make the account recommendation auditable.

Sections:

1. account summary;
2. recent trigger timeline;
3. accepted, weak, and rejected evidence;
4. Nimble score breakdown;
5. Kylon score breakdown;
6. buying hypothesis and alternative explanations;
7. recommended sponsor play;
8. Kylon approval status;
9. activity audit trail.

### Evidence card

```text
Supported signal
Launched an autonomous account-research agent

Source: Official product launch
Published: June 28, 2026
Retrieved with Nimble: July 13, 2026
Excerpt: ...
Trust: Verified public source
```

### Score breakdown

```text
Nimble fit
Live web dependency          +20
Structured extraction need   +20
High-volume workflow         +20
Reliability pain             +15
Recent launch                +10
Other                         +3
Total                         88
```

### Human controls

- `Approve next action`
- `Request more research`
- `Reject account`
- `Open Kylon workspace`
- `Simulate positive reply` — disabled until approved

## Kylon experience

The presentation should open the real challenge workspace at least once.

### Preferred demonstration

1. mission exists in Kylon;
2. AI coworkers or channels show handoffs;
3. strongest account is posted as a structured update;
4. human approval is requested;
5. approval state is reflected in the Kymble dashboard.

### Workspace fallback

When direct integration is unavailable:

- generate a compact `Kylon Mission Packet`;
- paste or import it into the workspace;
- show the resulting team interaction;
- display `Workspace mode` in Kymble.

Do not hide the fallback or call it native automation.

## Three-minute presentation

### 0:00–0:20 — Problem

> “Most AI sales tools start with a list and automate the message. The harder question is who actually needs your product now—and what proves it?”

### 0:20–0:45 — Real customer proof

Open Alta.

> “Kymble begins with a real Nimble customer story and learns the conditions behind the purchase.”

Click **Build the buying pattern**.

### 0:45–1:05 — Public signal design

Show the Signal Map.

> “The team converts private customer pain into public, timestamped signals we can search before contacting anyone.”

### 1:05–1:35 — Nimble live intelligence

Launch the mission.

Show Nimble searching and extracting at least one source.

> “Nimble is Kymble’s eyes on the live web. Every recommendation keeps its source and timestamp.”

### 1:35–2:05 — Operational pipeline

Show accounts entering and moving in the CRM. Open the strongest account and show the evidence and separate scores.

> “The account qualifies because multiple independent signals support the same buying hypothesis—not because a model produced a match percentage.”

### 2:05–2:35 — Kylon organization and approval

Open Kylon or the confirmed integration view.

> “Kylon is where the AI coworkers share context, hand work off, and pause the next action for a human decision.”

Approve the architecture workshop.

### 2:35–2:50 — Simulated outcome

Click `Simulate positive reply`.

Show the pipeline and task update with a visible synthetic label.

### 2:50–3:00 — Close

> “Kymble uses Nimble to find live demand and Kylon to turn that demand into an accountable AI GTM organization.”

## Demo reliability checklist

- cache one successful Nimble search and two extraction responses;
- verify all source links before the event;
- test Kylon access in the presentation browser profile;
- keep the workspace already open in a tab;
- add a one-click database reset;
- complete the golden path three times;
- record a backup demo video;
- stop adding features 30 minutes before submission.
