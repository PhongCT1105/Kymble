import type { Agent, Playbook, TrustLabel } from "@/lib/domain/types";
import caseStudies from "@/kymble_docs/data/real_case_studies.json";
import signalDefs from "@/kymble_docs/data/signal_definitions.json";
import events from "@/kymble_docs/data/synthetic_events.json";

/* ---------------------------------------------------------------- agents */

export const AGENTS: Agent[] = [
  {
    id: "chief",
    name: "Ky",
    role: "Chief of Staff",
    blurb: "Runs the mission and pauses the next action for a human.",
    state: "waiting",
  },
  {
    id: "case",
    name: "Case Analyst",
    role: "Customer DNA",
    blurb: "Reads a real customer story into structured conditions.",
    state: "waiting",
  },
  {
    id: "signal",
    name: "Signal Architect",
    role: "Buying pattern",
    blurb: "Turns private pain into public, searchable signals.",
    state: "waiting",
  },
  {
    id: "scout",
    name: "Web Scout",
    role: "Nimble discovery",
    blurb: "Finds and extracts live evidence with Nimble.",
    state: "waiting",
  },
  {
    id: "verifier",
    name: "Evidence Verifier",
    role: "Source of truth",
    blurb: "Checks sources, dates, and independence.",
    state: "waiting",
  },
  {
    id: "strategist",
    name: "Account Strategist",
    role: "Scoring & plays",
    blurb: "Scores Nimble and Kylon fit and picks a play.",
    state: "waiting",
  },
];

/* ------------------------------------------------------------ case studies */

export interface CaseStudy {
  id: string;
  customer_name: string;
  title: string;
  source_url: string;
  verified_facts: string[];
  trust_label: TrustLabel;
}

export const CASE_STUDIES = caseStudies as CaseStudy[];
export const PRIMARY_CASE = CASE_STUDIES.find((c) => c.id === "nimble-alta")!;

/* -------------------------------------------------------------- customer DNA */

export interface DnaCard {
  label: string;
  value: string;
  trust: TrustLabel;
}

export const CUSTOMER_DNA: DnaCard[] = [
  {
    label: "Customer type",
    value: "A GTM operating system that runs autonomous AI sales agents.",
    trust: "verified",
  },
  {
    label: "Product dependency",
    value:
      "Structured external data on prospects, competitors, technographics, and buying signals.",
    trust: "verified",
  },
  {
    label: "Operational challenge",
    value:
      "Agents need deep, current context that static or internal data cannot provide.",
    trust: "inferred",
  },
  {
    label: "Likely trigger",
    value:
      "Scaling agents to millions of workflows exposed the limits of shallow web data.",
    trust: "inferred",
  },
  {
    label: "Capability used",
    value:
      "Reliable discovery plus page-level structured extraction through Nimble.",
    trust: "verified",
  },
  {
    label: "Measurable result",
    value: "3–4x deeper context, >99% job success, millions of pages per day.",
    trust: "verified",
  },
  {
    label: "Desired outcome",
    value: "Deeper prospect context at scale without babysitting scrapers.",
    trust: "inferred",
  },
  {
    label: "Likely buyer roles",
    value: "Head of GTM Engineering, Data / Platform lead, and the founder.",
    trust: "inferred",
  },
];

/* ------------------------------------------------------------------ signals */

export interface SignalDef {
  id: string;
  playbook: Playbook;
  name: string;
  private_condition: string;
  observable_proxy: string;
  rationale: string;
  search_queries: string[];
  eligible_sources: string[];
  weight: number;
  max_age_days: number;
  false_positive_risks: string[];
}

export const SIGNALS = signalDefs as SignalDef[];

/* ------------------------------------------------------------------- events */

export interface TriggerEvent {
  id: string;
  account_id: string;
  event_type: string;
  occurred_at: string;
  title: string;
  description: string;
  trust_label: TrustLabel;
}

export const EVENTS = events as TriggerEvent[];
