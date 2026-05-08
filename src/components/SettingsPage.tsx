import { Database, RefreshCw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { HospitalSnapshot } from "../types";
import { StatusBadge } from "./StatusBadge";

interface SettingsPageProps {
  snapshot: HospitalSnapshot;
  isLive: boolean;
  onToggleLive: () => void;
}

export function SettingsPage({ snapshot, isLive, onToggleLive }: SettingsPageProps) {
  return (
    <main className="space-y-5 px-4 py-5 sm:px-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-ai">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-ai">Demo settings</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">CareFlow Boundaries</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This MVP uses synthetic data to demonstrate operational coordination support for hospital flow teams.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-ai">
            <RefreshCw className="h-5 w-5" />
            <h2 className="text-base font-bold">Refresh mode</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Live mode shows controlled refresh status. Snapshot mode freezes the screen for review and handoff.
          </p>
          <button
            type="button"
            onClick={onToggleLive}
            className="mt-4 rounded-lg bg-ai px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
          >
            Switch to {isLive ? "Snapshot" : "Live"}
          </button>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-ai">
            <Database className="h-5 w-5" />
            <h2 className="text-base font-bold">Data source</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge label={snapshot.dataLabel} tone="ai" />
            <StatusBadge label={snapshot.scenarioName} tone="neutral" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The demo contains synthetic operational signals only. No backend integration is required for this MVP.
          </p>
        </article>

        <article className="rounded-lg border border-cyan-100 bg-cyan-50 p-5">
          <div className="flex items-center gap-2 text-ai">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="text-base font-bold">Safety boundary</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            CareFlow can summarize bottlenecks, identify time loss, flag unusual operational patterns, and prepare
            briefs. It cannot diagnose, prescribe, make admission or discharge decisions, set triage priority, or make
            clinical predictions.
          </p>
        </article>
      </section>
    </main>
  );
}
