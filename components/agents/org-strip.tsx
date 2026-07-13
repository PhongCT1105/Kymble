"use client";

import {
  Compass, FileText, Waypoints, Globe, ShieldCheck, Target,
  Check, Loader2, Clock, AlertCircle,
} from "lucide-react";
import type { Agent, AgentId, AgentState } from "@/lib/domain/types";
import { useMission } from "@/lib/mission/store";
import { cn } from "@/lib/utils";

const ICON: Record<AgentId, typeof Compass> = {
  chief: Compass,
  case: FileText,
  signal: Waypoints,
  scout: Globe,
  verifier: ShieldCheck,
  strategist: Target,
};

const STATUS: Record<
  AgentState,
  { label: string; text: string; ring: string }
> = {
  waiting: { label: "Waiting", text: "text-faint", ring: "ring-line" },
  running: { label: "Working", text: "text-nimble", ring: "ring-nimble/40" },
  completed: { label: "Done", text: "text-verified", ring: "ring-verified/40" },
  blocked: { label: "Blocked", text: "text-danger", ring: "ring-danger/40" },
  needs_approval: { label: "Needs approval", text: "text-[#b57708]", ring: "ring-inferred/50" },
};

function StatusIcon({ state }: { state: AgentState }) {
  if (state === "running")
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-nimble" />;
  if (state === "completed")
    return <Check className="h-3.5 w-3.5 text-verified" />;
  if (state === "needs_approval")
    return <AlertCircle className="h-3.5 w-3.5 text-inferred" />;
  if (state === "blocked")
    return <AlertCircle className="h-3.5 w-3.5 text-danger" />;
  return <Clock className="h-3.5 w-3.5 text-faint" />;
}

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = ICON[agent.id];
  const s = STATUS[agent.state];
  const active = agent.state === "running";
  const alert = agent.state === "needs_approval";

  return (
    <div
      className={cn(
        "card flex flex-col gap-3 p-4 transition-all duration-300",
        active && "shadow-raise",
        alert && "pulse-approve",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-[10px] ring-1 transition-colors",
            active ? "bg-nimble-soft" : alert ? "bg-inferred-soft" : "bg-canvas",
            s.ring,
          )}
        >
          <Icon
            className={cn(
              "h-4.5 w-4.5",
              active ? "text-nimble" : alert ? "text-inferred" : "text-muted",
            )}
          />
        </span>
        <StatusIcon state={agent.state} />
      </div>
      <div>
        <p className="text-[13.5px] font-semibold leading-tight">{agent.role}</p>
        <p className="mt-0.5 text-[11.5px] text-faint">{agent.blurb}</p>
      </div>
      <span className={cn("mt-auto text-[11px] font-medium", s.text)}>
        {s.label}
      </span>
    </div>
  );
}

export function OrgStrip() {
  const agents = useMission((s) => s.agents);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {agents.map((a) => (
        <AgentCard key={a.id} agent={a} />
      ))}
    </div>
  );
}
