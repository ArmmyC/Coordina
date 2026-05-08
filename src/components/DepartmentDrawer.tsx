import { Check, Plus, X } from "lucide-react";
import type { DepartmentSignal, Tone } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { getDepartmentIcon, getDepartmentTone } from "./departmentIcons";
import { EvidenceChip } from "./EvidenceChip";
import { IconTile } from "./IconTile";
import { StatusBadge } from "./StatusBadge";

interface DepartmentDrawerProps {
  department: DepartmentSignal | null;
  isInBrief: boolean;
  onAddToBrief: (department: DepartmentSignal) => void;
  onClose: () => void;
}

export function DepartmentDrawer({ department, isInBrief, onAddToBrief, onClose }: DepartmentDrawerProps) {
  if (!department) {
    return null;
  }

  const Icon = getDepartmentIcon(department.id);
  const iconTone = getDepartmentTone(department.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <IconTile tone={iconTone}>
              <Icon className="h-6 w-6" />
            </IconTile>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ai">Department agent detail</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">{department.name} Agent</h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close department drawer"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-cyan-200 hover:text-ai"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <StatusBadge label={department.status} tone={department.tone} />
          <StatusBadge label={department.bottleneckRole} tone={roleTone(department.bottleneckRole)} />
          <StatusBadge label={department.confidence} tone="ai" />
          <StatusBadge label={`Updated ${department.lastUpdatedAt}`} tone="neutral" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Affected patients</p>
            <p className="mt-1 text-3xl font-bold text-ink">{department.affectedPatients}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Estimated time lost</p>
            <p className="mt-1 text-3xl font-bold text-red-600">{minutesToHuman(department.timeLostMinutes)}</p>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-lg font-bold text-ink">Local summary</h3>
          <p className="mt-3 leading-7 text-slate-700">{department.summary}</p>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
          <h3 className="text-lg font-bold text-ink">Why it matters</h3>
          <p className="mt-3 leading-7 text-slate-700">{department.whyItMatters}</p>
          <p className="mt-3 text-sm font-semibold text-ai">
            Bottleneck role: {department.bottleneckRole}
          </p>
        </section>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => onAddToBrief(department)}
            className={[
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
              isInBrief ? "bg-green-50 text-green-700" : "bg-ai text-white hover:bg-cyan-700",
            ].join(" ")}
          >
            {isInBrief ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isInBrief ? "Department finding in brief" : "Add department finding to brief"}
          </button>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-lg font-bold text-ink">Local metrics</h3>
          <ul className="mt-3 space-y-3">
            {department.localMetrics.map((metric) => (
              <li key={metric} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                {metric}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-lg font-bold text-ink">Evidence</h3>
          <ul className="mt-3 space-y-3">
            {department.evidence.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ai" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
          <h3 className="text-lg font-bold text-ink">Related departments</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {department.relatedDepartments.map((item) => (
              <EvidenceChip key={item} label={item} />
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Coordina uses this local agent summary as evidence for hospital-wide coordination reasoning. It does not
            decide clinical priority or discharge readiness.
          </p>
        </section>

      </aside>
    </div>
  );
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
