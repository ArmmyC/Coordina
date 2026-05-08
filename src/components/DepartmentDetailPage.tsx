import { ArrowLeft, BarChart3, Clock3, Link2, ShieldCheck } from "lucide-react";
import type { DepartmentSignal } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { getDepartmentIcon, getDepartmentTone } from "./departmentIcons";
import { EvidenceChip } from "./EvidenceChip";
import { IconTile } from "./IconTile";
import { StatusBadge } from "./StatusBadge";

interface DepartmentDetailPageProps {
  department: DepartmentSignal;
  allDepartments: DepartmentSignal[];
  onBack: () => void;
}

export function DepartmentDetailPage({ department, allDepartments, onBack }: DepartmentDetailPageProps) {
  const Icon = getDepartmentIcon(department.id);
  const iconTone = getDepartmentTone(department.id);
  const maxTime = Math.max(...allDepartments.map((item) => item.timeLostMinutes));
  const share = Math.round((department.timeLostMinutes / maxTime) * 100);

  return (
    <main className="mx-auto max-w-[1560px] space-y-6 px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-ai"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to hospital overview
      </button>

      <section className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <IconTile tone={iconTone}>
              <Icon className="h-6 w-6" />
            </IconTile>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ai">Department intelligence page</p>
              <h1 className="mt-2 text-4xl font-bold text-ink">{department.name} Agent</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{department.summary}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={department.status} tone={department.tone} />
            <StatusBadge label={department.bottleneckRole} tone={department.bottleneckRole === "primary contributor" ? "ai" : "neutral"} />
            <StatusBadge label={department.confidence} tone="ai" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Affected patients" value={String(department.affectedPatients)} />
        <Metric label="Estimated time lost" value={minutesToHuman(department.timeLostMinutes)} tone="red" />
        <Metric label="Confidence score" value={`${Math.round(department.confidenceScore * 100)}%`} />
        <Metric label="Relative pressure" value={`${share}%`} />
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[1fr_0.9fr]">
        <article className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-ai" />
            <h2 className="text-xl font-bold text-ink">Department Dashboard</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Local operating pressure compared with other department agents.
          </p>

          <div className="mt-6 space-y-4">
            {allDepartments.map((item) => {
              const width = `${Math.max((item.timeLostMinutes / maxTime) * 100, 8)}%`;
              const isCurrent = item.id === department.id;
              return (
                <div key={item.id} className={isCurrent ? "rounded-2xl bg-cyan-50 p-3" : ""}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-ink">{item.name}</p>
                    <p className="text-sm font-bold text-slate-600">{minutesToHuman(item.timeLostMinutes)}</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={[
                        "h-full rounded-full",
                        item.tone === "stable"
                          ? "bg-green-500"
                          : item.tone === "warning" || item.tone === "moderate"
                            ? "bg-amber-500"
                            : "bg-red-500",
                      ].join(" ")}
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-ai" />
            <h2 className="text-xl font-bold text-ink">Local Metrics</h2>
          </div>
          <div className="mt-5 space-y-3">
            {department.localMetrics.map((metric) => (
              <div key={metric} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                {metric}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-ai" />
            <h2 className="text-xl font-bold text-ink">Evidence and Interpretation</h2>
          </div>
          <ul className="mt-5 space-y-3">
            {department.evidence.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ai" />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-ai" />
            <h2 className="text-xl font-bold text-ink">Cross-Department Links</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This page shows local operational signals. Central Coordina reasoning combines them with other agents before
            recommending any follow-up path.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {department.relatedDepartments.map((item) => (
              <EvidenceChip key={item} label={item} />
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
            <p className="text-sm font-bold text-ai">Safety boundary</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              This department view supports operational coordination only. It does not diagnose, discharge, admit, or
              set triage priority.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

interface MetricProps {
  label: string;
  value: string;
  tone?: "red" | "default";
}

function Metric({ label, value, tone = "default" }: MetricProps) {
  return (
    <article className="glass-card rounded-2xl p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={["mt-2 text-3xl font-bold", tone === "red" ? "text-red-600" : "text-ink"].join(" ")}>{value}</p>
    </article>
  );
}
