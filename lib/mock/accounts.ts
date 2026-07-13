import type { LiveAccount, PipelineStage, TrustLabel } from "@/lib/domain/types";

export interface ScoreLine {
  label: string;
  points: number;
}

export interface EvidenceItem {
  id: string;
  status: "accepted" | "weak" | "rejected";
  signal: string;
  claim: string;
  sourceTitle: string;
  sourceType: string;
  publishedAt: string | null;
  retrievedAt: string;
  domain: string;
  excerpt: string;
  trust: TrustLabel;
  reason?: string;
}

export interface TriggerPoint {
  date: string;
  title: string;
  type: string;
}

export interface AccountDetail {
  hypothesis: string;
  alternatives: string[];
  nimbleBreakdown: ScoreLine[];
  kylonBreakdown: ScoreLine[];
  evidence: EvidenceItem[];
  triggers: TriggerPoint[];
}

interface AccountResult {
  nimble: number;
  kylon: number;
  priority: number;
  stage: PipelineStage;
  evidenceCount: number;
  whyNow: string;
  play: string | null;
  decision: "qualify" | "reject";
}

const RETRIEVED = "2026-07-13";

/* ---- base account facts (from synthetic_accounts.json), pre-mission ---- */

const BASE = [
  {
    id: "acct-revpilot",
    name: "RevPilot AI",
    domain: "revpilot.example",
    industry: "Sales Technology",
    employeeBand: "21–50",
    description: "Autonomous AI SDR and account-research platform.",
  },
  {
    id: "acct-codecurrent",
    name: "CodeCurrent",
    domain: "codecurrent.example",
    industry: "Developer Tools",
    employeeBand: "101–200",
    description: "AI code-security platform validating generated code against live ecosystems.",
  },
  {
    id: "acct-shelfpulse",
    name: "ShelfPulse",
    domain: "shelfpulse.example",
    industry: "E-commerce Intelligence",
    employeeBand: "51–100",
    description: "Pricing-intelligence platform tracking retailer pages at scale.",
  },
  {
    id: "acct-agentmesh",
    name: "AgentMesh Labs",
    domain: "agentmesh.example",
    industry: "Workflow Automation",
    employeeBand: "51–100",
    description: "AI workflow company running many department-specific agents.",
  },
  {
    id: "acct-marketatlas",
    name: "MarketAtlas",
    domain: "marketatlas.example",
    industry: "Consulting",
    employeeBand: "11–20",
    description: "Traditional analytics consultancy, no agent or live-data dependency.",
  },
] as const;

export const RESULTS: Record<string, AccountResult> = {
  "acct-revpilot": {
    nimble: 88, kylon: 82, priority: 86, stage: "human_review", evidenceCount: 4,
    whyNow: "Autonomous research agent launch + web-data hiring",
    play: "Joint architecture workshop", decision: "qualify",
  },
  "acct-codecurrent": {
    nimble: 84, kylon: 48, priority: 70, stage: "qualified", evidenceCount: 3,
    whyNow: "Post on stale package indexes (freshness pain)",
    play: "Freshness gap report", decision: "qualify",
  },
  "acct-shelfpulse": {
    nimble: 82, kylon: 30, priority: 66, stage: "qualified", evidenceCount: 3,
    whyNow: "Expansion into two new markets (coverage jump)",
    play: "Coverage & scale benchmark", decision: "qualify",
  },
  "acct-agentmesh": {
    nimble: 46, kylon: 91, priority: 73, stage: "strategy_ready", evidenceCount: 3,
    whyNow: "Hiring a Head of AI Operations to coordinate agents",
    play: "Agent organization readiness map", decision: "qualify",
  },
  "acct-marketatlas": {
    nimble: 22, kylon: 18, priority: 20, stage: "rejected", evidenceCount: 1,
    whyNow: "No recent AI or live-data trigger",
    play: null, decision: "reject",
  },
};

export function initialAccounts(): LiveAccount[] {
  return BASE.map((b) => ({
    ...b,
    stage: "discovered" as PipelineStage,
    nimble: 0,
    kylon: 0,
    priority: 0,
    evidenceCount: 0,
    whyNow: "Awaiting mission",
    play: null,
    decision: "pending" as const,
    approved: false,
    opportunity: false,
  }));
}

export const ACCOUNT_NAME: Record<string, string> = Object.fromEntries(
  BASE.map((b) => [b.id, b.name]),
);

/* --------------------------- evidence room detail --------------------------- */

export const ACCOUNT_DETAIL: Record<string, AccountDetail> = {
  "acct-revpilot": {
    hypothesis:
      "RevPilot is shipping a multi-agent research product that depends on live, structured web data and must coordinate agents with human approval — a joint Nimble + Kylon fit.",
    alternatives: [
      "The launch could be a prototype rather than a production dependency.",
      "They may already buy prospect data from a licensed aggregator.",
    ],
    nimbleBreakdown: [
      { label: "Live web dependency", points: 20 },
      { label: "Structured extraction need", points: 20 },
      { label: "High-volume workflow", points: 20 },
      { label: "Freshness / reliability pain", points: 15 },
      { label: "Recent launch", points: 10 },
      { label: "Other signals", points: 3 },
    ],
    kylonBreakdown: [
      { label: "Multiple coordinating agents", points: 25 },
      { label: "Context spread across tools", points: 22 },
      { label: "Human approval requirement", points: 20 },
      { label: "Recent AI-org trigger", points: 10 },
      { label: "Other signals", points: 5 },
    ],
    triggers: [
      { date: "2026-06-28", title: "Autonomous Account Research Agent launch", type: "product_launch" },
      { date: "2026-07-03", title: "Senior Web Data Engineer role opened", type: "job_post" },
    ],
    evidence: [
      {
        id: "ev-rp-1", status: "accepted", signal: "Agent depends on live external web data",
        claim: "Launched an autonomous account-research agent",
        sourceTitle: "Product launch — RevPilot AI", sourceType: "product",
        publishedAt: "2026-06-28", retrievedAt: RETRIEVED, domain: "revpilot.example",
        excerpt: "…introducing an autonomous account-research agent that continuously gathers prospect, competitor, and buying-signal context from the public web.",
        trust: "verified",
      },
      {
        id: "ev-rp-2", status: "accepted", signal: "Needs structured page-level extraction",
        claim: "Hiring a Senior Web Data Engineer for resilient extraction",
        sourceTitle: "Careers — Senior Web Data Engineer", sourceType: "job",
        publishedAt: "2026-07-03", retrievedAt: RETRIEVED, domain: "jobs.revpilot.example",
        excerpt: "…own resilient extraction and normalization pipelines that keep agent context fresh at scale.",
        trust: "verified",
      },
      {
        id: "ev-rp-3", status: "accepted", signal: "Needs structured page-level extraction",
        claim: "Docs describe page-level field extraction before hand-off",
        sourceTitle: "Docs — Data pipeline", sourceType: "docs",
        publishedAt: "2026-05-30", retrievedAt: RETRIEVED, domain: "docs.revpilot.example",
        excerpt: "…normalizes each source page into structured fields before handing context to downstream agents.",
        trust: "verified",
      },
      {
        id: "ev-rp-4", status: "accepted", signal: "Multiple agents or AI workflows",
        claim: "Describes specialized research, outreach, and routing agents",
        sourceTitle: "Product — How it works", sourceType: "product",
        publishedAt: "2026-06-28", retrievedAt: RETRIEVED, domain: "revpilot.example",
        excerpt: "…research, enrichment, and routing agents hand work to each other and to a human rep for approval.",
        trust: "verified",
      },
      {
        id: "ev-rp-5", status: "weak", signal: "Freshness or reliability pain",
        claim: "Older blog mentions occasional stale context",
        sourceTitle: "Blog — Keeping context current", sourceType: "engineering_blog",
        publishedAt: "2025-11-02", retrievedAt: RETRIEVED, domain: "revpilot.example",
        excerpt: "…stale context can quietly hurt reply rates if pipelines fall behind.",
        trust: "inferred", reason: "Older than the 180-day freshness window.",
      },
      {
        id: "ev-rp-6", status: "rejected", signal: "—",
        claim: "Generic company description page",
        sourceTitle: "About RevPilot", sourceType: "news",
        publishedAt: null, retrievedAt: RETRIEVED, domain: "revpilot.example",
        excerpt: "RevPilot is a fast-growing AI company reimagining sales.",
        trust: "cached", reason: "No signal keyword — boilerplate positioning rejected.",
      },
    ],
  },

  "acct-codecurrent": {
    hypothesis:
      "CodeCurrent's review product degrades when package and ecosystem data goes stale — a strong Nimble freshness fit with a lighter agent-coordination need.",
    alternatives: [
      "The freshness issue may already be resolved.",
      "They may rely on official registry APIs rather than web extraction.",
    ],
    nimbleBreakdown: [
      { label: "Freshness / reliability pain", points: 25 },
      { label: "Live web dependency", points: 20 },
      { label: "Structured extraction need", points: 20 },
      { label: "Recent engineering post", points: 10 },
      { label: "Other signals", points: 9 },
    ],
    kylonBreakdown: [
      { label: "Multiple coordinating agents", points: 18 },
      { label: "Human approval requirement", points: 18 },
      { label: "Other signals", points: 12 },
    ],
    triggers: [
      { date: "2026-07-01", title: "Post: Why offline package indexes fail AI code review", type: "engineering_post" },
    ],
    evidence: [
      {
        id: "ev-cc-1", status: "accepted", signal: "Freshness or reliability pain",
        claim: "Published that offline package indexes go stale and break review",
        sourceTitle: "Engineering — Why offline indexes fail", sourceType: "engineering_blog",
        publishedAt: "2026-07-01", retrievedAt: RETRIEVED, domain: "codecurrent.example",
        excerpt: "…offline package metadata drifts within days, so review flags the wrong versions.",
        trust: "verified",
      },
      {
        id: "ev-cc-2", status: "accepted", signal: "Agent depends on live external web data",
        claim: "Validates generated code against current package ecosystems",
        sourceTitle: "Product — Live ecosystem checks", sourceType: "product",
        publishedAt: "2026-06-10", retrievedAt: RETRIEVED, domain: "codecurrent.example",
        excerpt: "…checks every dependency against the current published ecosystem, not a snapshot.",
        trust: "verified",
      },
      {
        id: "ev-cc-3", status: "accepted", signal: "Needs structured page-level extraction",
        claim: "Hiring to normalize registry and advisory data",
        sourceTitle: "Careers — Data Engineer", sourceType: "job",
        publishedAt: "2026-06-22", retrievedAt: RETRIEVED, domain: "jobs.codecurrent.example",
        excerpt: "…normalize registry, advisory, and changelog data from many sources into one schema.",
        trust: "verified",
      },
    ],
  },

  "acct-shelfpulse": {
    hypothesis:
      "ShelfPulse monitors retailer pages at high volume and just expanded coverage — a clear Nimble scale fit with minimal agent-coordination need.",
    alternatives: [
      "Coverage claims may be inflated marketing.",
      "They may license data from an aggregator.",
    ],
    nimbleBreakdown: [
      { label: "High-volume / multi-source workflow", points: 25 },
      { label: "Live web dependency", points: 20 },
      { label: "Structured extraction need", points: 20 },
      { label: "Recent expansion", points: 10 },
      { label: "Other signals", points: 7 },
    ],
    kylonBreakdown: [
      { label: "Human approval requirement", points: 18 },
      { label: "Other signals", points: 12 },
    ],
    triggers: [
      { date: "2026-06-19", title: "ShelfPulse expands to two new markets", type: "expansion" },
    ],
    evidence: [
      {
        id: "ev-sp-1", status: "accepted", signal: "High-volume or multi-source web workflow",
        claim: "Expanded price tracking into two new markets",
        sourceTitle: "News — Two new markets", sourceType: "news",
        publishedAt: "2026-06-19", retrievedAt: RETRIEVED, domain: "shelfpulse.example",
        excerpt: "…now tracking retailer catalogs across two additional markets, raising monitored pages sharply.",
        trust: "verified",
      },
      {
        id: "ev-sp-2", status: "accepted", signal: "High-volume or multi-source web workflow",
        claim: "Claims broad coverage across thousands of retailer sites",
        sourceTitle: "Product — Coverage", sourceType: "product",
        publishedAt: "2026-05-20", retrievedAt: RETRIEVED, domain: "shelfpulse.example",
        excerpt: "…refreshes pricing across thousands of retailer pages every day.",
        trust: "verified",
      },
      {
        id: "ev-sp-3", status: "accepted", signal: "Needs structured page-level extraction",
        claim: "Hiring for resilient retailer-page extraction",
        sourceTitle: "Careers — Web Data Engineer", sourceType: "job",
        publishedAt: "2026-06-25", retrievedAt: RETRIEVED, domain: "jobs.shelfpulse.example",
        excerpt: "…build resilient extraction for retailer pages that change layout constantly.",
        trust: "verified",
      },
    ],
  },

  "acct-agentmesh": {
    hypothesis:
      "AgentMesh runs many department agents and is hiring to coordinate them — a strong Kylon organization fit with a lighter live-web need.",
    alternatives: [
      "The 'agents' may be marketing labels for one chatbot.",
      "They may already have an internal coordination layer.",
    ],
    nimbleBreakdown: [
      { label: "Live web dependency", points: 18 },
      { label: "High-volume workflow", points: 15 },
      { label: "Other signals", points: 13 },
    ],
    kylonBreakdown: [
      { label: "Multiple coordinating agents", points: 30 },
      { label: "Context spread across tools", points: 26 },
      { label: "Human approval requirement", points: 25 },
      { label: "Recent AI-org trigger", points: 10 },
    ],
    triggers: [
      { date: "2026-07-05", title: "Hiring a Head of AI Operations", type: "job_post" },
    ],
    evidence: [
      {
        id: "ev-am-1", status: "accepted", signal: "Multiple agents or AI workflows",
        claim: "Runs specialized agents across departments",
        sourceTitle: "Product — Department agents", sourceType: "product",
        publishedAt: "2026-05-15", retrievedAt: RETRIEVED, domain: "agentmesh.example",
        excerpt: "…sales, support, and research agents each own a workflow and hand tasks across teams.",
        trust: "verified",
      },
      {
        id: "ev-am-2", status: "accepted", signal: "Human approval or governance requirement",
        claim: "Hiring a Head of AI Operations to coordinate agents",
        sourceTitle: "Careers — Head of AI Operations", sourceType: "job",
        publishedAt: "2026-07-05", retrievedAt: RETRIEVED, domain: "jobs.agentmesh.example",
        excerpt: "…own coordination, approvals, and audit trails across a growing fleet of agents.",
        trust: "verified",
      },
      {
        id: "ev-am-3", status: "accepted", signal: "Context spread across tools",
        claim: "Agents work across chat, CRM, and docs",
        sourceTitle: "Engineering — Shared context", sourceType: "engineering_blog",
        publishedAt: "2026-06-08", retrievedAt: RETRIEVED, domain: "agentmesh.example",
        excerpt: "…agents constantly reconstruct context across Slack, the CRM, and internal docs.",
        trust: "verified",
      },
    ],
  },

  "acct-marketatlas": {
    hypothesis:
      "MarketAtlas is a traditional analytics consultancy with no agent or live-data dependency — not a fit right now.",
    alternatives: [
      "A future AI initiative could change this.",
      "Re-evaluate if they launch an agent product.",
    ],
    nimbleBreakdown: [
      { label: "Static analysis positioning", points: 12 },
      { label: "Other signals", points: 10 },
    ],
    kylonBreakdown: [
      { label: "Generic collaboration language", points: 10 },
      { label: "Other signals", points: 8 },
    ],
    triggers: [],
    evidence: [
      {
        id: "ev-ma-1", status: "weak", signal: "—",
        claim: "Describes itself as 'data-driven'",
        sourceTitle: "Home — MarketAtlas", sourceType: "news",
        publishedAt: null, retrievedAt: RETRIEVED, domain: "marketatlas.example",
        excerpt: "MarketAtlas delivers data-driven strategy for modern enterprises.",
        trust: "inferred", reason: "No signal keyword — generic positioning, not a buying trigger.",
      },
      {
        id: "ev-ma-2", status: "rejected", signal: "—",
        claim: "Boilerplate consulting services page",
        sourceTitle: "Services — MarketAtlas", sourceType: "news",
        publishedAt: null, retrievedAt: RETRIEVED, domain: "marketatlas.example",
        excerpt: "Our consultants help you unlock insight from your data.",
        trust: "cached", reason: "No live-web or agent dependency — rejected.",
      },
    ],
  },
};
