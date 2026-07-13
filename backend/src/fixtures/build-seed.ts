import type {
  Account,
  Contact,
  Engagement,
  EvidenceRecord,
  FormSubmission,
  Lifecycle,
  MeetingRecord,
  SignalKey,
  UsageRecord,
} from "../domain/types.js";

export type ClusterProfile = {
  id: string;
  name: string;
  description: string;
  recommendedPlaybook: "nimble" | "kylon" | "joint" | "none";
};

export type SyntheticSeed = {
  accounts: Account[];
  contacts: Contact[];
  usage: UsageRecord[];
  engagements: Engagement[];
  forms: FormSubmission[];
  meetings: MeetingRecord[];
  evidence: EvidenceRecord[];
  clusters: ClusterProfile[];
  accountCluster: Record<string, string>;
};

const clusters: ClusterProfile[] = [
  {
    id: "cluster-joint-agentic-gtm",
    name: "Agentic GTM with live intelligence",
    description: "Known accounts operating several GTM agents that require current external data and human approvals.",
    recommendedPlaybook: "joint",
  },
  {
    id: "cluster-nimble-web-intelligence",
    name: "Fresh web-intelligence products",
    description: "Products whose user value depends on timely, structured, reliable web data.",
    recommendedPlaybook: "nimble",
  },
  {
    id: "cluster-kylon-agent-operations",
    name: "Multi-agent operations",
    description: "Teams coordinating multiple AI workflows, shared context, handoffs, governance, and approvals.",
    recommendedPlaybook: "kylon",
  },
  {
    id: "cluster-trial-friction",
    name: "Strong-fit trials with friction",
    description: "Trials with credible product fit but a named security, ownership, implementation, or ROI blocker.",
    recommendedPlaybook: "joint",
  },
  {
    id: "cluster-expansion",
    name: "Customer expansion",
    description: "Paying customers with adoption evidence and an adjacent Nimble, Kylon, or joint workflow.",
    recommendedPlaybook: "joint",
  },
  {
    id: "cluster-negative-control",
    name: "ICP negative controls",
    description: "Known accounts that are active or visible but lack the dependency, urgency, or operating complexity for sponsor fit.",
    recommendedPlaybook: "none",
  },
];

const accountNames: Array<[string, string]> = [
  ["acct-revpilot", "RevPilot AI"],
  ["acct-codecurrent", "CodeCurrent"],
  ["acct-shelfpulse", "ShelfPulse"],
  ["acct-agentmesh", "AgentMesh Labs"],
  ["acct-marketatlas", "MarketAtlas"],
  ["acct-prospectvector", "ProspectVector"],
  ["acct-envoyforge", "EnvoyForge"],
  ["acct-datapulse", "DataPulse"],
  ["acct-stackfresh", "StackFresh"],
  ["acct-priceorbit", "PriceOrbit"],
  ["acct-workflowgrid", "WorkflowGrid"],
  ["acct-insightrelay", "InsightRelay"],
  ["acct-browserfleet", "BrowserFleet"],
  ["acct-qualitycopilot", "QualityCopilot"],
  ["acct-retaillens", "RetailLens"],
  ["acct-partnerpilot", "PartnerPilot"],
  ["acct-supportmesh", "SupportMesh"],
  ["acct-contextops", "ContextOps"],
  ["acct-salesweaver", "SalesWeaver"],
  ["acct-leadharbor", "LeadHarbor"],
  ["acct-devguard", "DevGuard"],
  ["acct-catalogiq", "CatalogIQ"],
  ["acct-automataops", "AutomataOps"],
  ["acct-signalcraft", "SignalCraft"],
  ["acct-pipelineai", "PipelineAI"],
  ["acct-truthlayer", "TruthLayer"],
  ["acct-agentquorum", "AgentQuorum"],
  ["acct-priceatlas", "PriceAtlas"],
  ["acct-reachsmith", "ReachSmith"],
  ["acct-freshstack", "FreshStack"],
  ["acct-merchwatch", "MerchWatch"],
  ["acct-securescribe", "SecureScribe"],
  ["acct-revopslab", "RevOps Lab"],
  ["acct-aiprocurement", "AI Procurement"],
  ["acct-legacyanalytics", "Legacy Analytics"],
  ["acct-contentdesk", "ContentDesk"],
  ["acct-opsbridge", "OpsBridge"],
  ["acct-workcell", "WorkCell"],
  ["acct-winpath", "WinPath"],
  ["acct-verifierai", "Verifier AI"],
];

const nimbleSignals: SignalKey[] = [
  "nimble_live_data_need",
  "nimble_structured_extraction",
  "nimble_scale",
  "nimble_ai_dependency",
  "nimble_reliability_pain",
  "nimble_recent_trigger",
];
const kylonSignals: SignalKey[] = [
  "kylon_multi_agent",
  "kylon_fragmented_context",
  "kylon_human_collaboration",
  "kylon_governance",
  "kylon_cross_functional",
  "kylon_recent_trigger",
];

function domainFor(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.example`;
}

function clusterIndexFor(accountIndex: number): number {
  const anchorClusters = [0, 1, 1, 2, 0];
  return anchorClusters[accountIndex] ?? accountIndex % clusters.length;
}

function lifecycleFor(clusterIndex: number, accountIndex: number): Lifecycle {
  if (clusterIndex === 0) return accountIndex % 2 === 0 ? "paying" : "evaluator";
  if (clusterIndex === 1) return accountIndex % 2 === 0 ? "paying" : "trial";
  if (clusterIndex === 2) return accountIndex % 2 === 0 ? "evaluator" : "paying";
  if (clusterIndex === 3) return "trial";
  if (clusterIndex === 4) return "expansion";
  return Math.floor(accountIndex / 6) % 2 === 0 ? "rejected" : "dormant";
}

function signalsFor(clusterIndex: number): SignalKey[] {
  if (clusterIndex === 0 || clusterIndex === 3 || clusterIndex === 4) {
    return [...nimbleSignals, ...kylonSignals];
  }
  if (clusterIndex === 1) return [...nimbleSignals];
  if (clusterIndex === 2) return [...kylonSignals];
  return [];
}

function productsFor(clusterIndex: number): Array<"nimble" | "kylon"> {
  if (clusterIndex === 0 || clusterIndex === 3 || clusterIndex === 4) {
    return ["nimble", "kylon"];
  }
  if (clusterIndex === 1) return ["nimble"];
  if (clusterIndex === 2) return ["kylon"];
  return [];
}

export function buildSeed(): SyntheticSeed {
  const accounts: Account[] = [];
  const contacts: Contact[] = [];
  const usage: UsageRecord[] = [];
  const engagements: Engagement[] = [];
  const forms: FormSubmission[] = [];
  const meetings: MeetingRecord[] = [];
  const evidence: EvidenceRecord[] = [];
  const accountCluster: Record<string, string> = {};

  accountNames.forEach(([id, name], accountIndex) => {
    const clusterIndex = clusterIndexFor(accountIndex);
    const cluster = clusters[clusterIndex]!;
    const lifecycle = lifecycleFor(clusterIndex, accountIndex);
    const domain = domainFor(name);
    const signalKeys = signalsFor(clusterIndex);
    accountCluster[id] = cluster.id;
    accounts.push({
      id,
      name,
      domain,
      lifecycle,
      industry: clusterIndex === 5 ? "Business Services" : "AI Software",
      employeeBand: accountIndex % 3 === 0 ? "11-20" : accountIndex % 3 === 1 ? "21-50" : "51-100",
      currentProducts: productsFor(clusterIndex),
      trustLabel: "synthetic",
    });

    const roles = ["VP Product", "Head of Data", "Revenue Operations Lead"];
    roles.forEach((title, contactIndex) => {
      const fullName = ["Taylor Morgan", "Avery Chen", "Jordan Patel"][contactIndex]!;
      contacts.push({
        id: `contact-${accountIndex + 1}-${contactIndex + 1}`,
        accountId: id,
        fullName,
        title,
        email: `${fullName.toLowerCase().replace(" ", ".")}@${domain}`,
        trustLabel: "synthetic",
      });
    });

    usage.push({
      id: `usage-${accountIndex + 1}`,
      accountId: id,
      product:
        clusterIndex === 0 || clusterIndex === 3 || clusterIndex === 4
          ? "joint"
          : clusterIndex === 1
            ? "nimble"
            : clusterIndex === 2
              ? "kylon"
              : "other",
      occurredAt: `2026-07-${String((accountIndex % 12) + 1).padStart(2, "0")}T10:00:00Z`,
      metrics:
        clusterIndex === 5
          ? { activeUsers: 2, workflows: 0 }
          : { activeUsers: 8 + (accountIndex % 15), workflows: 3 + (accountIndex % 9), pages: 800 + accountIndex * 117 },
      interpretation:
        clusterIndex === 5
          ? "Occasional evaluation with no recurring agentic workflow."
          : "Recurring AI workflow with measurable research, coordination, or approval activity.",
      trustLabel: "synthetic",
    });

    const primaryContactId = `contact-${accountIndex + 1}-1`;
    engagements.push(
      {
        id: `engagement-${accountIndex + 1}-1`,
        accountId: id,
        contactId: primaryContactId,
        type: "product_session",
        occurredAt: "2026-07-08T15:00:00Z",
        details: "Reviewed workflow results and saved an analysis.",
        trustLabel: "synthetic",
      },
      {
        id: `engagement-${accountIndex + 1}-2`,
        accountId: id,
        contactId: primaryContactId,
        type: lifecycle === "paying" || lifecycle === "expansion" ? "success_review" : "trial_check_in",
        occurredAt: "2026-07-11T15:00:00Z",
        details: lifecycle === "rejected" ? "Confirmed no near-term dependency or urgency." : "Discussed current workflow and next decision criteria.",
        trustLabel: "synthetic",
      },
    );

    const friction =
      clusterIndex === 3
        ? [
            "Security review needs an owner.",
            "The team has not quantified rollout ROI.",
            "Implementation ownership is unclear.",
          ][accountIndex % 3]!
        : lifecycle === "dormant"
          ? "Timing moved behind another infrastructure project."
          : "none";
    forms.push({
      id: `form-${accountIndex + 1}`,
      accountId: id,
      contactId: primaryContactId,
      submittedAt: "2026-07-09T16:00:00Z",
      responses: {
        why_use_product:
          clusterIndex === 5
            ? "Explore whether automation can help a small manual workflow."
            : cluster.description,
        when_use_product:
          clusterIndex === 1
            ? "When source pages change or a fresh dataset is required."
            : "During recurring research, orchestration, and review cycles.",
        current_workflow:
          clusterIndex === 5
            ? "A manual analyst workflow with a spreadsheet handoff."
            : "AI agents gather context, update records, and request human review.",
        blocker_to_convert: friction,
        decision_process: "Product, data, and revenue operations review evidence before the executive sponsor decides.",
      },
      trustLabel: "synthetic",
    });

    if (accountIndex % 2 === 0) {
      meetings.push({
        id: `meeting-${accountIndex + 1}`,
        accountId: id,
        occurredAt: "2026-07-10T17:00:00Z",
        summary: `${name} described ${cluster.description.toLowerCase()} The team will validate adoption, risk, and ownership before the next commitment.`,
        openQuestions: ["What measurable outcome defines success?", "Who owns the rollout?"],
        trustLabel: "synthetic",
      });
    }

    for (let evidenceIndex = 0; evidenceIndex < 2; evidenceIndex += 1) {
      const sourceDomain = `${evidenceIndex === 0 ? "product" : "engineering"}-${domain}`;
      evidence.push({
        id: `evidence-${accountIndex + 1}-${evidenceIndex + 1}`,
        accountId: id,
        sourceUrl: `https://${sourceDomain}/${evidenceIndex === 0 ? "launch" : "workflow"}`,
        sourceTitle: evidenceIndex === 0 ? `${name} product update` : `${name} engineering workflow`,
        sourceDomain,
        publishedAt: evidenceIndex === 0 ? "2026-07-01T09:00:00Z" : "2026-06-20T09:00:00Z",
        retrievedAt: "2026-07-13T09:00:00Z",
        excerpt:
          clusterIndex === 5
            ? "Synthetic negative-control source describing a conventional manual workflow."
            : `Synthetic public-style source supporting the ${cluster.name.toLowerCase()} use-case hypothesis.`,
        decision: clusterIndex === 5 ? (evidenceIndex === 0 ? "weak" : "rejected") : "supported",
        signalKeys,
        trustLabel: "synthetic",
      });
    }
  });

  return {
    accounts,
    contacts,
    usage,
    engagements,
    forms,
    meetings,
    evidence,
    clusters: clusters.map((cluster) => ({ ...cluster })),
    accountCluster,
  };
}
