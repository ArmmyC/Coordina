import { CheckCircle2, GitBranch, Lightbulb, ShieldCheck, X } from "lucide-react";
import type { CareFlowInsight, DepartmentSignal, SuggestedAction } from "../types";
import { CauseChain } from "./CauseChain";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EvidenceChip } from "./EvidenceChip";
import { StatusBadge } from "./StatusBadge";
import { SuggestedActionCard } from "./SuggestedActionCard";

interface RootCauseDetailViewProps {
  insight: CareFlowInsight;
  departments: DepartmentSignal[];
  briefActionIds: string[];
  onAddToBrief: (action: SuggestedAction) => void;
  onClose: () => void;
}

export function RootCauseDetailView({
  insight,
  departments,
  briefActionIds,
  onAddToBrief,
  onClose,
}: RootCauseDetailViewProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <section
        className="mx-auto my-8 max-w-6xl rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ai">Full root-cause analysis</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">{insight.mainBottleneck}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              This view explains why the visible ED queue is a symptom of downstream coordination delay, not a
              standalone arrival problem.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close root cause detail"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-cyan-200 hover:text-ai"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-ai">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-bold">Reasoning sequence</h3>
              </div>
              <div className="mt-4 space-y-3">
                <ReasoningRow label="Visible symptom" value={insight.visibleProblem} />
                <ReasoningRow label="Naive explanation" value={insight.naiveExplanation} />
                <ReasoningRow label="CareFlow insight" value={insight.careFlowInsight} emphasized />
                <ReasoningRow label="Why naive explanation is incomplete" value={insight.whyNaiveIncomplete} />
              </div>
            </article>

            <article className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5">
              <div className="flex items-center gap-2 text-ai">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-bold">Uncertainty and safety</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                <strong>Uncertainty:</strong> {insight.uncertainty}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                <strong>Safety boundary:</strong> {insight.safetyNote}
              </p>
              <div className="mt-4">
                <ConfidenceBadge label={insight.confidence} score={insight.confidenceScore} />
              </div>
            </article>
          </div>

          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-ai">
                <GitBranch className="h-5 w-5" />
                <h3 className="font-bold">Bottleneck chain</h3>
              </div>
              <div className="mt-4">
                <CauseChain steps={insight.causeChain} />
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-ink">Supporting evidence</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {departments.map((department) => (
                  <div key={department.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-ink">{department.name}</h4>
                      <StatusBadge
                        label={department.bottleneckRole}
                        tone={department.bottleneckRole === "Primary cause" ? "ai" : "neutral"}
                        size="sm"
                      />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{department.summary}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <article className="mt-5 rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-ink">Highest leverage follow-up actions</h3>
              <p className="mt-1 text-sm text-slate-500">Non-clinical suggestions for human review and assignment.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {insight.departmentsInvolved.map((item) => (
                <EvidenceChip key={item} label={item} />
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {insight.highestLeverageActions.map((action) => (
              <SuggestedActionCard
                key={action.id}
                action={action}
                isInBrief={briefActionIds.includes(action.id)}
                onAddToBrief={onAddToBrief}
                compact
              />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

interface ReasoningRowProps {
  label: string;
  value: string;
  emphasized?: boolean;
}

function ReasoningRow({ label, value, emphasized = false }: ReasoningRowProps) {
  return (
    <div className={["rounded-2xl p-4", emphasized ? "bg-ai-soft" : "bg-slate-50"].join(" ")}>
      <div className="flex items-center gap-2">
        <CheckCircle2 className={["h-4 w-4", emphasized ? "text-ai" : "text-slate-400"].join(" ")} />
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
