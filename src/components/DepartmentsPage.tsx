import { Activity, ArrowRight, Clock3, Link2, Route, ShieldCheck, TrendingUp, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import type { DepartmentId, DepartmentSignal, Tone } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { getDepartmentIcon, getDepartmentTone } from "./departmentIcons";
import { EvidenceChip } from "./EvidenceChip";
import { IconTile } from "./IconTile";
import { MiniSparkline } from "./MiniSparkline";
import { StatusBadge } from "./StatusBadge";

interface DepartmentsPageProps {
  departments: DepartmentSignal[];
  selectedDepartment: DepartmentSignal;
  onSelectDepartment: (departmentId: DepartmentId) => void;
}

export function DepartmentsPage({ departments, selectedDepartment, onSelectDepartment }: DepartmentsPageProps) {
  const Icon = getDepartmentIcon(selectedDepartment.id);
  const iconTone = getDepartmentTone(selectedDepartment.id);
  const maxTimeLost = Math.max(...departments.map((department) => department.timeLostMinutes));
  const contributionShare = Math.round((selectedDepartment.timeLostMinutes / maxTimeLost) * 100);

  return (
    <main className="space-y-5 px-4 py-5 sm:px-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <IconTile tone={iconTone}>
              <Icon className="h-6 w-6" />
            </IconTile>
            <div>
              <p className="text-sm font-bold text-ai">Department Analysis</p>
              <h1 className="mt-1 text-3xl font-bold text-ink">{selectedDepartment.name}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{selectedDepartment.summary}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={selectedDepartment.status} tone={selectedDepartment.tone} />
            <StatusBadge label={selectedDepartment.bottleneckRole} tone={roleTone(selectedDepartment.bottleneckRole)} />
            <StatusBadge label={selectedDepartment.confidence} tone="ai" />
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {departments.map((department) => (
            <button
              key={department.id}
              type="button"
              onClick={() => onSelectDepartment(department.id)}
              className={[
                "whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-bold transition",
                selectedDepartment.id === department.id
                  ? "border-cyan-200 bg-cyan-50 text-ai"
                  : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:text-ai",
              ].join(" ")}
            >
              {department.name}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<UsersRound className="h-5 w-5" />} label="Affected patients" value={String(selectedDepartment.affectedPatients)} />
        <MetricCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Estimated time lost"
          value={minutesToHuman(selectedDepartment.timeLostMinutes)}
          tone="red"
        />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Trend" value={selectedDepartment.trend} />
        <MetricCard icon={<Activity className="h-5 w-5" />} label="Contribution strength" value={`${contributionShare}%`} />
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-ai" />
            <h2 className="text-base font-bold text-ink">{selectedDepartment.name} Flow Map</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Each department has its own operational structure. Coordina reads these local stages before linking them to
            the central bottleneck.
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {selectedDepartment.flowStages.map((stage, index) => (
              <DepartmentFlowStageCard
                key={stage.id}
                stage={stage}
                index={index}
                isLast={index === selectedDepartment.flowStages.length - 1}
              />
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-5">
          <div className="flex items-center gap-2 text-ai">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="text-base font-bold">Department structure notes</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {selectedDepartment.structureNotes.map((note) => (
              <li key={note} className="flex gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ai" />
                {note}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-ai" />
            <h2 className="text-base font-bold text-ink">Local Dashboard</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{selectedDepartment.localProblem}</p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Recent local trend</p>
                <p className="mt-1 text-sm font-bold text-ink">Updated {selectedDepartment.lastUpdatedAt}</p>
              </div>
              <MiniSparkline
                values={selectedDepartment.sparkline}
                tone={selectedDepartment.tone === "stable" ? "green" : selectedDepartment.tone === "warning" ? "amber" : "red"}
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedDepartment.localMetrics.map((metric) => (
              <div key={metric} className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {metric}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-ai" />
            <h2 className="text-base font-bold text-ink">Local Insight</h2>
          </div>
          <p className="mt-3 text-base leading-7 text-slate-700">{selectedDepartment.whyItMatters}</p>
          <div className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-sm font-bold text-ai">Role in current central bottleneck</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{selectedDepartment.bottleneckRole}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {selectedDepartment.relatedDepartments.map((department) => (
              <EvidenceChip key={department} label={department} />
            ))}
          </div>
        </article>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-ai" />
            <h2 className="text-base font-bold text-ink">Local Evidence</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {selectedDepartment.evidence.map((item) => (
              <li key={item} className="flex gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ai" />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-ai" />
            <h2 className="text-base font-bold text-ink">Recent Department Change Log</h2>
          </div>
          <div className="mt-4 space-y-2">
            {selectedDepartment.changeLog.map((event) => (
              <div key={event.id} className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 rounded-lg bg-slate-50 px-3 py-3 text-sm">
                <p className="font-bold text-ai">{event.timestamp}</p>
                <p className="leading-6 text-slate-700">{event.message}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "red";
}

function MetricCard({ icon, label, value, tone = "default" }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-ai">{icon}</div>
      <p className="mt-3 text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className={["mt-2 text-2xl font-bold capitalize", tone === "red" ? "text-red-600" : "text-ink"].join(" ")}>
        {value}
      </p>
    </article>
  );
}

function DepartmentFlowStageCard({
  stage,
  index,
  isLast,
}: {
  stage: DepartmentSignal["flowStages"][number];
  index: number;
  isLast: boolean;
}) {
  return (
    <div className="relative rounded-lg border border-slate-200 bg-white p-4">
      {!isLast ? <ArrowRight className="absolute -right-5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 lg:block" /> : null}
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai text-xs font-bold text-white">
          {index + 1}
        </span>
        <StatusBadge label={stage.status} tone={flowStatusTone(stage.status)} size="sm" />
      </div>
      <h3 className="mt-3 text-sm font-bold text-ink">{stage.name}</h3>
      <p className="mt-1 text-xs font-semibold text-ai">{stage.ownerRole}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{stage.signal}</p>
      <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">{stage.timeTarget}</p>
    </div>
  );
}

function flowStatusTone(status: string): Tone {
  const normalized = status.toLowerCase();

  if (normalized.includes("blocked") || normalized.includes("delayed") || normalized.includes("crowded")) {
    return "critical";
  }

  if (normalized.includes("high") || normalized.includes("rising") || normalized.includes("constrained")) {
    return "warning";
  }

  if (normalized.includes("stable") || normalized.includes("low")) {
    return "stable";
  }

  return "ai";
}

function roleTone(role: DepartmentSignal["bottleneckRole"]): Tone {
  if (role === "primary contributor") {
    return "ai";
  }

  if (role === "secondary contributor") {
    return "warning";
  }

  return "neutral";
}
