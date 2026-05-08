import { Check, ChevronRight, Clock3, Plus, UserCheck } from "lucide-react";
import type { SuggestedAction } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { EvidenceChip } from "./EvidenceChip";

interface SuggestedActionCardProps {
  action: SuggestedAction;
  isInBrief: boolean;
  onAddToBrief: (action: SuggestedAction) => void;
  onMarkReviewed?: (action: SuggestedAction) => void;
  compact?: boolean;
}

export function SuggestedActionCard({
  action,
  isInBrief,
  onAddToBrief,
  onMarkReviewed,
  compact = false,
}: SuggestedActionCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ai">
            <UserCheck className="h-4 w-4" />
            {action.ownerRole}
          </div>
          <h3 className="mt-2 text-base font-bold text-ink">{action.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{action.reason}</p>
        </div>
        <div className="rounded-xl bg-ai-soft px-3 py-2 text-right">
          <div className="flex items-center gap-1 text-xs font-semibold text-ai">
            <Clock3 className="h-3.5 w-3.5" />
            saved
          </div>
          <div className="text-lg font-bold text-ink">{minutesToHuman(action.estimatedTimeSavedMinutes)}</div>
        </div>
      </div>

      {!compact ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-500">Affected patients</p>
              <p className="font-bold text-ink">{action.affectedPatients}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-500">Confidence</p>
              <p className="font-bold text-ink">{action.confidence}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {action.evidenceTags.map((tag) => (
              <EvidenceChip key={tag} label={tag} />
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">{action.safetyNote}</p>
        </>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAddToBrief(action)}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
            isInBrief ? "bg-green-50 text-green-700" : "bg-ai text-white hover:bg-cyan-700",
          ].join(" ")}
        >
          {isInBrief ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isInBrief ? "In action brief" : "Add to action brief"}
        </button>
        <button
          type="button"
          onClick={() => onMarkReviewed?.(action)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:text-ai"
        >
          <Check className="h-4 w-4" />
          Mark reviewed
        </button>
        {!compact ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-ai transition hover:bg-cyan-50"
          >
            Assign to role
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
