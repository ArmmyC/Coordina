import { Clock3, Plus, ShieldCheck, Trash2, UserCheck, X } from "lucide-react";
import type { SuggestedAction } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { EvidenceChip } from "./EvidenceChip";

interface ActionDetailModalProps {
  action: SuggestedAction;
  isInBrief: boolean;
  onAddToBrief: (action: SuggestedAction) => void;
  onRemoveFromBrief: (action: SuggestedAction) => void;
  onClose: () => void;
}

export function ActionDetailModal({
  action,
  isInBrief,
  onAddToBrief,
  onRemoveFromBrief,
  onClose,
}: ActionDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <section
        className="mx-auto my-10 max-w-3xl rounded-lg bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-ai">
              <UserCheck className="h-5 w-5" />
              <p className="text-sm font-bold uppercase tracking-wide">{action.ownerRole}</p>
            </div>
            <h2 className="mt-2 text-3xl font-bold text-ink">{action.title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">{action.reason}</p>
          </div>
          <button
            type="button"
            aria-label="Close action detail"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-cyan-200 hover:text-ai"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <Metric label="Department" value={action.department} />
          <Metric label="Impact" value={action.impact} />
          <Metric label="Affected patients" value={String(action.affectedPatients)} />
          <Metric label="Estimated time saved" value={minutesToHuman(action.estimatedTimeSavedMinutes)} />
        </div>

        <section className="mt-5 rounded-lg border border-slate-200 p-5">
          <h3 className="font-bold text-ink">Evidence tags</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {action.evidenceTags.map((tag) => (
              <EvidenceChip key={tag} label={tag} />
            ))}
          </div>
        </section>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-slate-200 p-5">
            <h3 className="font-bold text-ink">Uncertainty</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action.uncertainty}</p>
          </section>
          <section className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-5">
            <div className="flex items-center gap-2 text-ai">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-bold">Safety note</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{action.safetyNote}</p>
          </section>
        </div>

        <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-bold text-ink">Brief text</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{action.briefText}</p>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-ai-soft px-3 py-1.5 text-xs font-bold text-ai">
            <Clock3 className="h-4 w-4" />
            {action.confidence}
          </div>
          <button
            type="button"
            onClick={() => (isInBrief ? onRemoveFromBrief(action) : onAddToBrief(action))}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
              isInBrief ? "border border-red-100 bg-white text-red-600 hover:bg-red-50" : "bg-ai text-white hover:bg-cyan-700",
            ].join(" ")}
          >
            {isInBrief ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isInBrief ? "Remove from action brief" : "Add to action brief"}
          </button>
        </div>
      </section>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
            <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
