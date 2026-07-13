"use client";

import { create } from "zustand";
import type {
  ActivityLine,
  Agent,
  AgentId,
  AgentState,
  Kpis,
  LiveAccount,
  MissionPhase,
} from "@/lib/domain/types";
import { AGENTS } from "@/lib/mock/data";
import { initialAccounts, RESULTS } from "@/lib/mock/accounts";

const BASE_CLOCK = 11 * 3600 + 34 * 60; // 11:34:00

function stamp(index: number): string {
  const t = BASE_CLOCK + index * 3;
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const cloneAgents = (): Agent[] => AGENTS.map((a) => ({ ...a }));

const ZERO_KPIS: Kpis = {
  casesLearned: 0,
  candidates: 0,
  evidenceAccepted: 0,
  qualified: 0,
  pendingApprovals: 0,
  pipelineValue: 0,
};

interface MissionState {
  phase: MissionPhase;
  agents: Agent[];
  activity: ActivityLine[];
  accounts: LiveAccount[];
  kpis: Kpis;
  nimbleActive: boolean;
  dnaReady: boolean;
  signalsReady: boolean;
  timers: ReturnType<typeof setTimeout>[];
  launch: () => void;
  reset: () => void;
  approve: () => void;
  simulateReply: () => void;
}

const HERO = "acct-revpilot";

export const useMission = create<MissionState>((set, get) => {
  /* --- internal mutation helpers ------------------------------------- */

  const setAgent = (id: AgentId, state: AgentState) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, state } : a)),
    }));

  const say = (agent: AgentId, text: string) =>
    set((s) => ({
      activity: [
        ...s.activity,
        { id: s.activity.length, time: stamp(s.activity.length), agent, text },
      ],
    }));

  const patchAccounts = (fn: (a: LiveAccount) => LiveAccount) =>
    set((s) => ({ accounts: s.accounts.map(fn) }));

  const patchKpis = (partial: Partial<Kpis>) =>
    set((s) => ({ kpis: { ...s.kpis, ...partial } }));

  /* --- scripted timeline --------------------------------------------- */

  const steps: { at: number; run: () => void }[] = [
    { at: 0, run: () => { setAgent("chief", "running");
      say("chief", "Mission opened — learn from Alta, find AI-native accounts (min score 70, 2 sources)."); } },

    { at: 1200, run: () => { setAgent("chief", "completed"); setAgent("case", "running");
      patchKpis({ casesLearned: 1 });
      say("case", "Reading the Alta customer story…"); } },

    { at: 2800, run: () => { setAgent("case", "completed"); set({ dnaReady: true });
      say("case", "Extracted 8 conditions from Alta — 5 verified, 3 inferred."); } },

    { at: 4200, run: () => { setAgent("signal", "running");
      say("signal", "Mapping private customer pain to public signals…"); } },

    { at: 5800, run: () => { setAgent("signal", "completed"); set({ signalsReady: true });
      say("signal", "Built 8 public signals across Nimble, Kylon, and joint playbooks."); } },

    { at: 7200, run: () => { setAgent("scout", "running"); set({ nimbleActive: true });
      patchKpis({ candidates: 5 });
      patchAccounts((a) => ({ ...a, stage: "researching" }));
      say("scout", "Started 6 Nimble searches on the live web…"); } },

    { at: 9100, run: () => {
      patchAccounts((a) => (a.id === "acct-marketatlas" ? a : { ...a, stage: "evidence_ready" }));
      say("scout", "Nimble extracted sources: RevPilot agent launch, web-data role, CodeCurrent freshness post…"); } },

    { at: 10600, run: () => { setAgent("scout", "completed"); setAgent("verifier", "running");
      say("verifier", "Checking sources, dates, and independence…"); } },

    { at: 12400, run: () => { setAgent("verifier", "completed"); set({ nimbleActive: false });
      patchAccounts((a) => ({ ...a, evidenceCount: RESULTS[a.id]?.evidenceCount ?? 0 }));
      patchKpis({ evidenceAccepted: 13 });
      say("verifier", "Accepted 13 sources from independent domains · flagged 2 weak · rejected 2 generic."); } },

    { at: 13900, run: () => { setAgent("strategist", "running");
      say("strategist", "Scoring Nimble and Kylon fit for every account…"); } },

    { at: 15800, run: () => { setAgent("strategist", "completed");
      patchAccounts((a) => {
        const r = RESULTS[a.id];
        if (!r) return a;
        return { ...a, nimble: r.nimble, kylon: r.kylon, priority: r.priority,
          stage: r.stage, whyNow: r.whyNow, play: r.play, decision: r.decision };
      });
      patchKpis({ qualified: 4, pipelineValue: 480_000 });
      say("strategist", "RevPilot AI → Nimble 88 / Kylon 82 · top priority.");
      say("strategist", "CodeCurrent 84/48 · ShelfPulse 82/30 · AgentMesh 46/91 qualified · MarketAtlas rejected."); } },

    { at: 17300, run: () => { setAgent("chief", "needs_approval"); set({ phase: "awaiting_approval" });
      patchKpis({ pendingApprovals: 1 });
      say("chief", "Requested human approval in Kylon for the RevPilot joint architecture workshop."); } },
  ];

  return {
    phase: "idle",
    agents: cloneAgents(),
    activity: [],
    accounts: initialAccounts(),
    kpis: { ...ZERO_KPIS },
    nimbleActive: false,
    dnaReady: false,
    signalsReady: false,
    timers: [],

    launch: () => {
      const { phase, timers } = get();
      if (phase !== "idle") return;
      timers.forEach(clearTimeout);
      set({
        phase: "running",
        agents: cloneAgents(),
        activity: [],
        accounts: initialAccounts(),
        kpis: { ...ZERO_KPIS },
        nimbleActive: false,
        dnaReady: false,
        signalsReady: false,
      });
      const newTimers = steps.map((step) => setTimeout(step.run, step.at));
      set({ timers: newTimers });
    },

    reset: () => {
      get().timers.forEach(clearTimeout);
      set({
        phase: "idle",
        agents: cloneAgents(),
        activity: [],
        accounts: initialAccounts(),
        kpis: { ...ZERO_KPIS },
        nimbleActive: false,
        dnaReady: false,
        signalsReady: false,
        timers: [],
      });
    },

    approve: () => {
      if (get().phase !== "awaiting_approval") return;
      setAgent("chief", "completed");
      patchAccounts((a) => (a.id === HERO ? { ...a, approved: true, stage: "approved" } : a));
      patchKpis({ pendingApprovals: 0 });
      set({ phase: "approved" });
      say("chief", "You approved the next action. Kylon handoff confirmed.");
    },

    simulateReply: () => {
      if (get().phase !== "approved") return;
      patchAccounts((a) =>
        a.id === HERO ? { ...a, opportunity: true, stage: "opportunity_simulated" } : a,
      );
      set((s) => ({
        phase: "replied",
        kpis: { ...s.kpis, pipelineValue: s.kpis.pipelineValue + 250_000 },
      }));
      say("chief", "Simulated positive reply — RevPilot AI moved to Opportunity (synthetic).");
    },
  };
});
