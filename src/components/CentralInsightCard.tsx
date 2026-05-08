import { BrainCircuit, Check, ClipboardPlus, FileText, ShieldCheck } from "lucide-react";
import type { CareFlowInsight, SuggestedAction } from "../types";
import { CauseChain } from "./CauseChain";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EvidenceChip } from "./EvidenceChip";

interface CentralInsightCardProps {
  insight: CareFlowInsight;
  briefActionIds: string[];
  onAddToBrief: (action: SuggestedAction) => void;
  onOpenRootCause: () => void;
  onOpenBrief: () => void;
  onMarkReviewed: () => void;
}

export function CentralInsightCard({
  insight,
  briefActionIds,
  onAddToBrief,
  onOpenRootCause,
  onOpenBrief,
  onMarkReviewed,
}: CentralInsightCardProps) {
  return (
    <section className="rounded-3xl border border-cyan-200 bg-white/94 p-6 shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai-soft text-ai">
            <BrainCircuit className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-bold text-ai">Central AI Insight</p>
            <p className="text-sm font-medium text-slate-500">Hospital-wide coordination reasoning</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge label={insight.confidence} score={insight.confidenceScore} />
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            No clinical decisions made by CareFlow
          </div>
        </div>
      </div>

      <div className="grid gap-6 pt-6 xl:grid-cols-[1.05fr_0.9fr_1.3fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ai">Main bottleneck</p>
          <h1 className="mt-3 max-w-xl break-words text-3xl font-bold leading-tight text-ink md:text-4xl">
            {insight.mainBottleneck}
          </h1>
          <div className="mt-6">
            <p className="text-sm font-bold text-ai">Summary</p>
            <p className="mt-2 text-base leading-7 text-slate-700">{insight.conciseSummary}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {insight.departmentsInvolved.map((department) => (
              <EvidenceChip key={department} label={department} />
            ))}
          </div>
        </div>

        <div className="xl:border-l xl:border-dashed xl:border-slate-200 xl:pl-6">
          <p className="text-sm font-bold text-ai">Suggested actions</p>
          <div className="mt-3 space-y-3">
            {insight.highestLeverageActions.map((action) => {
              const isInBrief = briefActionIds.includes(action.id);
              return (
                <button
                  type="button"
                  key={action.id}
                  onClick={() => onAddToBrief(action)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-cyan-200 hover:shadow-soft"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ai-soft text-ai">
                    {isInBrief ? <Check className="h-5 w-5" /> : <ClipboardPlus className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{action.title}</p>
                    <p className="text-xs font-semibold text-ai">{action.ownerRole}</p>
                  </div>
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500">
                    {isInBrief ? "Added" : "Add"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="xl:border-l xl:border-dashed xl:border-slate-200 xl:pl-6">
          <p className="text-sm font-bold text-ai">Cause chain</p>
          <div className="mt-4">
            <CauseChain steps={insight.causeChain} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
        <p className="max-w-3xl text-sm leading-6 text-slate-600">{insight.safetyNote}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenRootCause}
            className="inline-flex items-center gap-2 rounded-xl bg-ai px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700"
          >
            <ShieldCheck className="h-4 w-4" />
            View full analysis
          </button>
          <button
            type="button"
            onClick={onOpenBrief}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-3 text-sm font-bold text-ai shadow-sm transition hover:bg-cyan-50"
          >
            <FileText className="h-4 w-4" />
            Open action brief
          </button>
          <button
            type="button"
            onClick={onMarkReviewed}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-ai"
          >
            <Check className="h-4 w-4" />
            Mark reviewed
          </button>
        </div>
      </div>
    </section>
  );
}
