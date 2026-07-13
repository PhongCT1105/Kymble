# AI Coworker Contracts and Prompts

## Organization model

Kymble is a small AI GTM team, not one agent pretending to do everything.

```text
Human GTM Director
        │
        ▼
Chief of Staff
        │
 ┌──────┼─────────────┬──────────────┬──────────────┐
 ▼      ▼             ▼              ▼              ▼
Case    Signal        Web            Evidence       Account
Analyst Architect     Scout          Verifier       Strategist
```

The Kylon workspace should expose these roles as clearly as its available capabilities permit.

## Shared rules

Every coworker must:

1. distinguish verified, inferred, synthetic, and cached information;
2. never create or “repair” a source URL;
3. preserve exact source URLs and timestamps;
4. return structured JSON matching a Zod schema;
5. state uncertainty and alternative explanations;
6. avoid qualifying an account from static firmographics alone;
7. wait for evidence verification before recommending action;
8. keep user-facing updates short and operational;
9. record completion and handoff events;
10. avoid real outbound execution without human approval.

## 1. Chief of Staff

### Role

Own the mission plan, sequence work, track completion, publish status to Kylon, and request the final human decision.

### Input

```ts
interface MissionRequest {
  missionId: string;
  goal: string;
  referenceCaseStudyId: string;
  playbook: "nimble" | "kylon" | "joint";
  maximumAccounts: number;
  minimumScore: number;
}
```

### Output

```ts
interface MissionPlan {
  missionId: string;
  stages: Array<{
    order: number;
    agentRole: AgentRole;
    objective: string;
    completionCriteria: string[];
  }>;
  approvalPolicy: {
    required: true;
    sensitiveActions: string[];
  };
}
```

### User-facing status examples

- `Case Analyst is reading Alta.`
- `Scout found 7 candidate accounts.`
- `Verifier rejected 4 weak claims.`
- `RevPilot AI is ready for your approval.`

## 2. Case Analyst

### Role

Extract customer DNA from a verified Nimble customer case study.

### Output

```ts
interface CustomerDNA {
  customerType: string;
  productDependency: string[];
  challenges: Array<{
    claim: string;
    evidenceExcerpt: string;
    trustLabel: "verified" | "inferred";
  }>;
  triggerHypotheses: Array<{
    trigger: string;
    trustLabel: "verified" | "inferred";
  }>;
  desiredOutcomes: string[];
  capabilitiesUsed: string[];
  measurableOutcomes: string[];
  likelyBuyerRoles: Array<{
    role: string;
    trustLabel: "verified" | "inferred";
  }>;
}
```

### Prompt rule

Convert marketing language into concrete operational conditions. Never add facts from memory.

## 3. Signal Architect

### Role

Map customer conditions to public, timestamped proxies that could be observed before purchase.

### Output

```ts
interface SignalHypothesis {
  id: string;
  playbook: "nimble" | "kylon" | "joint";
  privateCondition: string;
  observableSignal: string;
  rationale: string;
  queryTemplates: string[];
  preferredSourceTypes: SourceType[];
  maxAgeDays: number | null;
  proposedWeight: number;
  falsePositiveRisks: string[];
}
```

### Prompt rule

Prefer events—launches, hiring, expansion, architecture changes, governance statements—over static facts such as industry and headcount.

## 4. Web Scout

### Role

Use Nimble to discover candidate accounts and extract the strongest source pages.

### Required behavior

1. run a broad discovery query;
2. normalize candidate domains;
3. run account-specific verification queries;
4. extract source pages when snippets are insufficient;
5. store the raw Nimble response;
6. return only evidence candidates with real URLs.

### Output

```ts
interface EvidenceCandidate {
  accountName: string;
  accountDomain: string;
  signalDefinitionId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceType: SourceType;
  publishedAt: string | null;
  retrievedAt: string;
  excerpt: string;
  providerResponseId: string;
}
```

## 5. Evidence Verifier

### Role

Decide whether a source supports a specific buying-signal hypothesis.

### Output

```ts
interface VerificationResult {
  evidenceId: string;
  decision: "supported" | "weak" | "rejected";
  supportExplanation: string;
  alternativeExplanation: string | null;
  recencyValid: boolean;
  sourceIndependent: boolean;
  confidence: number;
}
```

### Reject when

- the page only describes the general industry;
- the excerpt does not support the specific signal;
- the source falls outside the recency window;
- the page is an undated duplicate or repost;
- the source duplicates an existing domain without adding information;
- the claim is stronger than the evidence.

## 6. Account Strategist

### Role

Explain deterministic Nimble and Kylon scores and prepare one useful next action.

The strategist receives scores as immutable input.

### Output

```ts
interface AccountStrategy {
  accountId: string;
  recommendedPlaybook: "nimble" | "kylon" | "joint" | "none";
  buyingHypothesis: string;
  whyNow: string;
  strongestEvidenceIds: string[];
  likelyStakeholderRoles: string[];
  recommendedAsset: string;
  nextAction: string;
  approvalReason: string;
  risks: string[];
}
```

### Recommended actions

- `Web Intelligence Reliability Audit`
- `Freshness Gap Report`
- `Coverage and Scale Benchmark`
- `Agent Organization Readiness Map`
- `Joint Nimble + Kylon Architecture Workshop`

Avoid aggressive cold-email copy. Lead with an analysis, benchmark, or workshop.

## Human approval contract

Approval is a workflow capability, not an autonomous agent.

```ts
interface ApprovalRequest {
  accountId: string;
  action: string;
  rationale: string;
  evidenceIds: string[];
  sensitive: true;
  status: "pending";
}
```

Example:

```json
{
  "accountId": "acct-revpilot",
  "action": "Offer a joint Nimble + Kylon architecture workshop",
  "rationale": "The account has supported web-data reliability signals, several AI workflows, and a synthetic form indicating active approval needs.",
  "evidenceIds": ["ev-001", "ev-002"],
  "sensitive": true,
  "status": "pending"
}
```

Only a human can transition the approval to `approved` or `rejected`.

## Prompt files

- `prompts/case-analyst.md`
- `prompts/signal-architect.md`
- `prompts/evidence-verifier.md`
- `prompts/account-strategist.md`

Do not place long prompts in React components, route handlers, or database seed scripts.
