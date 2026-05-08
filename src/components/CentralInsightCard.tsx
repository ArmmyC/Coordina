import {
  BrainCircuit,
  Check,
  Clock3,
  FileText,
  GitBranch,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { CoordinaInsight, InsightSeverity, SuggestedAction, Tone, TrendDirection } from "../types";
import { CauseChain } from "./CauseChain";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EvidenceChip } from "./EvidenceChip";
import { StatusBadge } from "./StatusBadge";

interface CentralInsightCardProps {
  insight: CoordinaInsight;
  briefActionIds: string[];
  isInsightInBrief: boolean;
  onAddActionToBrief: (action: SuggestedAction) => void;
  onAddInsightToBrief: () => void;
  onOpenActionDetail: (action: SuggestedAction) => void;
  onOpenRootCause: () => void;
  onOpenBrief: () => void;
  onMarkReviewed: () => void;
}

export function CentralInsightCard({
  insight,
  briefActionIds,
  isInsightInBrief,
  onAddActionToBrief,
  onAddInsightToBrief,
  onOpenActionDetail,
  onOpenRootCause,
  onOpenBrief,
  onMarkReviewed,
}: CentralInsightCardProps) {
  return (
    <section className="rounded-3xl border border-cyan-200 bg-white/95 p-6 shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai-soft text-ai">
            <BrainCircuit className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-ai">Primary Bottleneck Now</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-ink md:text-3xl">{insight.title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={formatSeverity(insight.severity)} tone={severityTone(insight.severity)} />
          <TrendBadge trend={insight.trend} />
          <ConfidenceBadge label={insight.confidence} score={insight.confidenceScore} />
        </div>
      </div>

      <div className="grid gap-6 pt-6 xl:grid-cols-[1.05fr_1.05fr_0.9fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <EvidenceChip label={`Updated ${insight.lastUpdatedAt}`} />
            <EvidenceChip label={`Detected ${insight.detectedAt}`} />
          </div>
          <p className="mt-5 text-base leading-7 text-slate-700">{insight.summary}</p>
          <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
            <p className="text-sm font-bold text-ai">Changed since previous insight</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{insight.changedSincePreviousInsight}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {insight.departmentsInvolved.map((department) => (
              <EvidenceChip key={department} label={department} />
            ))}
          </div>
        </div>

        <div className="xl:border-l xl:border-dashed xl:border-slate-200 xl:pl-6">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-ai" />
            <p className="text-sm font-bold text-ai">Cause chain</p>
          </div>
          <div className="mt-4">
            <CauseChain steps={insight.causeChain} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Actual cross-department cause</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{insight.actualInsight}</p>
          </div>
        </div>

        <div className="xl:border-l xl:border-dashed xl:border-slate-200 xl:pl-6">
          <p className="text-sm font-bold text-ai">Suggested actions</p>
          <p className="mt-1 text-xs font-medium text-slate-500">Add to brief now, or click a row to see details.</p>
          <div className="mt-3 space-y-3">
            {insight.suggestedActions.map((action) => {
              const isInBrief = briefActionIds.includes(action.id);
              return (
                <div
                  role="button"
                  tabIndex={0}
                  key={action.id}
                  onClick={() => onOpenActionDetail(action)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenActionDetail(action);
                    }
                  }}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-cyan-200 hover:shadow-soft"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddActionToBrief(action);
                    }}
                    className={[
                      "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition",
                      isInBrief ? "bg-green-50 text-green-700" : "bg-ai text-white hover:bg-cyan-700",
                    ].join(" ")}
                  >
                    {isInBrief ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {isInBrief ? "In brief" : "Add to brief"}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{action.title}</p>
                    <p className="text-xs font-semibold text-ai">{action.ownerRole}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Click to see more detail</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
        <p className="max-w-3xl text-sm leading-6 text-slate-600">{insight.safetyNote}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAddInsightToBrief}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
              isInsightInBrief ? "bg-green-50 text-green-700" : "bg-ai text-white hover:bg-cyan-700",
            ].join(" ")}
          >
            {isInsightInBrief ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isInsightInBrief ? "Insight in brief" : "Add insight to brief"}
          </button>
          <button
            type="button"
            onClick={onOpenRootCause}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-3 text-sm font-bold text-ai shadow-sm transition hover:bg-cyan-50"
          >
            <ShieldCheck className="h-4 w-4" />
            View full analysis
          </button>
          <button
            type="button"
            onClick={onOpenBrief}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-ai"
          >
            <FileText className="h-4 w-4" />
            View action brief
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

function formatSeverity(severity: InsightSeverity) {
  return `${severity.charAt(0).toUpperCase()}${severity.slice(1)} severity`;
}

function severityTone(severity: InsightSeverity): Tone {
  if (severity === "critical") {
    return "critical";
  }

  if (severity === "high") {
    return "high";
  }

  if (severity === "moderate") {
    return "warning";
  }

  return "stable";
}

function TrendBadge({ trend }: { trend: TrendDirection }) {
  const isWorsening = trend === "worsening" || trend === "new";
  const Icon = trend === "improving" ? TrendingDown : TrendingUp;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
        isWorsening ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {trend}
      <Clock3 className="h-3.5 w-3.5 opacity-70" />
    </span>
  );
}
