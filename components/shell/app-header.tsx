"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMission } from "@/lib/mission/store";

const NAV = [
  { href: "/", label: "Command Center" },
  { href: "/cases", label: "Customer Proof" },
  { href: "/signals", label: "Signal Map" },
  { href: "/pipeline", label: "Pipeline" },
];

export function AppHeader() {
  const pathname = usePathname();
  const reset = useMission((s) => s.reset);
  const nimbleActive = useMission((s) => s.nimbleActive);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-5 sm:px-8">
        {/* wordmark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="gradient-brand grid h-8 w-8 place-items-center rounded-[10px] text-[15px] font-bold text-white shadow-sm">
            K
          </span>
          <span className="font-display text-[19px] font-semibold tracking-tight">
            Kymble
          </span>
        </Link>

        {/* nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/accounts")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-nimble-soft text-nimble"
                    : "text-muted hover:bg-canvas hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {/* mode pills */}
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-muted lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-kylon" />
            Kylon · Workspace
          </span>
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium lg:inline-flex",
              nimbleActive
                ? "border-nimble/30 bg-nimble-soft text-nimble"
                : "border-line bg-surface-2 text-muted",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                nimbleActive ? "bg-nimble pulse-live" : "bg-cached",
              )}
            />
            Nimble · {nimbleActive ? "Live" : "Cached"}
          </span>

          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
