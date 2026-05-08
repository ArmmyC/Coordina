import {
  AlertTriangle,
  ArrowRight,
  Bed,
  Bell,
  Building2,
  Check,
  Clock3,
  FileText,
  GitBranch,
  Info,
  Pill,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trash2,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  AnomalyEvent,
  CoordinaInsight,
  DepartmentId,
  DepartmentSignal,
  InsightSeverity,
  InsightTimelineEvent,
  SecondaryIssue,
  SuggestedAction,
  Tone,
  TrendDirection,
} from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EvidenceChip } from "./EvidenceChip";
import { StatusBadge } from "./StatusBadge";

interface CentralAIPageProps {
  insight: CoordinaInsight;
  departments: DepartmentSignal[];
  secondaryIssues: SecondaryIssue[];
  timeline: InsightTimelineEvent[];
  anomalies: AnomalyEvent[];
  stagedActionIds: string[];
  reviewedActionIds: string[];
  briefReviewNeeded: boolean;
  simulationPanel?: ReactNode;
  onAddActionToBrief: (action: SuggestedAction) => void;
  onRemoveActionFromBrief: (action: SuggestedAction) => void;
  onMarkActionReviewed: (actionId: string) => void;
  onOpenActionDetail: (action: SuggestedAction) => void;
  onSaveInsightSnapshot: () => void;
  onOpenNotifications: () => void;
  onSelectDepartment: (departmentId: DepartmentId) => void;
  onOpenDepartments: () => void;
  onReviewBriefUpdate: () => void;
  onKeepCurrentBrief: () => void;
}

export function CentralAIPage({
  insight,
  departments,
  secondaryIssues,
  timeline,
  anomalies,
  stagedActionIds,
  reviewedActionIds,
  briefReviewNeeded,
  simulationPanel,
  onAddActionToBrief,
  onRemoveActionFromBrief,
  onMarkActionReviewed,
  onOpenActionDetail,
  onSaveInsightSnapshot,
  onOpenNotifications,
  onSelectDepartment,
  onOpenDepartments,
  onReviewBriefUpdate,
  onKeepCurrentBrief,
}: CentralAIPageProps) {
  return (
    <main className="space-y-5 px-4 py-5 sm:px-6">
      {simulationPanel}

      {briefReviewNeeded ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Central insight has changed materially since the last saved brief
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Human review is required before using the saved brief for handoff.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReviewBriefUpdate}
              className="rounded-lg bg-ai px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
            >
              Review update
            </button>
            <button
              type="button"
              onClick={onKeepCurrentBrief}
              className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
            >
              Keep current brief
            </button>
          </div>
        </section>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <PrimaryBottleneckHero insight={insight} onSaveInsightSnapshot={onSaveInsightSnapshot} />
          <CauseChainSection insight={insight} />
          <SuggestedActionsTable
            actions={insight.suggestedActions.slice(0, 3)}
            stagedActionIds={stagedActionIds}
            reviewedActionIds={reviewedActionIds}
            onAddActionToBrief={onAddActionToBrief}
            onRemoveActionFromBrief={onRemoveActionFromBrief}
            onMarkActionReviewed={onMarkActionReviewed}
            onOpenActionDetail={onOpenActionDetail}
          />
        </div>

        <aside className="space-y-5">
          <ImportantAlerts
            issues={secondaryIssues}
            anomalies={anomalies}
            onOpenNotifications={onOpenNotifications}
          />
          <DepartmentShortcut
            departments={departments}
            onSelectDepartment={onSelectDepartment}
            onOpenDepartments={onOpenDepartments}
          />
        </aside>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CentralChangeLog events={timeline} />
        <SafetyBoundary />
      </section>
    </main>
  );
}

function PrimaryBottleneckHero({
  insight,
  onSaveInsightSnapshot,
}: {
  insight: CoordinaInsight;
  onSaveInsightSnapshot: () => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-ai">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">Primary Bottleneck Now</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Central AI Insight</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TrendBadge trend={insight.trend} />
          <ConfidenceBadge label={insight.confidence} score={insight.confidenceScore} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <h1 className="max-w-4xl text-2xl font-bold leading-tight tracking-normal text-ink md:text-3xl">
            {insight.mainBottleneck}
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-700">{insight.conciseSummary}</p>
        </div>
        <div className="self-start rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Clock3 className="h-4 w-4 text-slate-500" />
            Last updated: {insight.lastUpdatedAt}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge label={`Detected ${insight.detectedAt}`} tone="neutral" size="sm" />
            <StatusBadge label={formatSeverity(insight.severity)} tone={severityTone(insight.severity)} size="sm" />
          </div>
          <button
            type="button"
            onClick={onSaveInsightSnapshot}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ai px-3 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700"
          >
            <FileText className="h-4 w-4" />
            Save insight snapshot
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 font-bold text-ai">
            <Info className="h-4 w-4" />
            Changed since previous insight
          </span>
          <span className="text-slate-700">{insight.changedSincePreviousInsight}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <InsightFact label="Visible problem" value={insight.visibleProblem} />
        <InsightFact label="Naive explanation" value={insight.naiveExplanation} />
        <InsightFact label="Actual cross-department cause" value={insight.actualInsight} emphasized />
      </div>
    </section>
  );
}

function InsightFact({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <article
      className={[
        "rounded-lg border p-4",
        emphasized ? "border-cyan-200 bg-cyan-50/80" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </article>
  );
}

function CauseChainSection({ insight }: { insight: CoordinaInsight }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-ai" />
        <h2 className="text-base font-bold text-ink">Cause Chain</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.3fr]">
        {insight.causeChain.map((step, index) => (
          <ChainStep key={step} step={step} index={index} isLast={index === insight.causeChain.length - 1} />
        ))}
      </div>
    </section>
  );
}

function ChainStep({ step, index, isLast }: { step: string; index: number; isLast: boolean }) {
  const icons = [UsersRound, Bed, FileText, Pill];
  const Icon = icons[index] ?? FileText;
  return (
    <>
      <div className="flex min-h-24 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <Icon className={["h-6 w-6 shrink-0", isLast ? "text-ai" : "text-slate-600"].join(" ")} />
        <div>
          <p className="text-sm font-bold text-ink">{step}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {isLast ? "Multiple downstream delays" : "Operational signal"}
          </p>
        </div>
      </div>
      {!isLast ? <ArrowRight className="hidden h-full w-6 self-center text-ai md:block" /> : null}
    </>
  );
}

function SuggestedActionsTable({
  actions,
  stagedActionIds,
  reviewedActionIds,
  onAddActionToBrief,
  onRemoveActionFromBrief,
  onMarkActionReviewed,
  onOpenActionDetail,
}: {
  actions: SuggestedAction[];
  stagedActionIds: string[];
  reviewedActionIds: string[];
  onAddActionToBrief: (action: SuggestedAction) => void;
  onRemoveActionFromBrief: (action: SuggestedAction) => void;
  onMarkActionReviewed: (actionId: string) => void;
  onOpenActionDetail: (action: SuggestedAction) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-ai" />
          <h2 className="text-base font-bold text-ink">Suggested Follow-Up Actions</h2>
        </div>
        <span className="rounded-lg bg-cyan-50 px-3 py-2 text-xs font-bold text-ai">Top 3 only</span>
      </div>

      <div className="mt-4 space-y-3">
        {actions.map((action, index) => {
          const isStaged = stagedActionIds.includes(action.id);
          const isReviewed = reviewedActionIds.includes(action.id);

          return (
            <article key={action.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpenActionDetail(action)}
                      className="text-left font-bold text-ink transition hover:text-ai"
                    >
                      {action.title}
                    </button>
                    <p className="mt-1 text-xs font-semibold text-ai">{action.ownerRole}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{action.reason}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <StatusBadge label={action.impact} tone={action.impact === "High" ? "high" : "warning"} size="sm" />
                  <EvidenceChip label={`${action.affectedPatients} patients`} />
                  <EvidenceChip label={`${minutesToHuman(action.estimatedTimeSavedMinutes)} saved`} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => (isStaged ? onRemoveActionFromBrief(action) : onAddActionToBrief(action))}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition",
                    isStaged
                      ? "border-red-100 bg-white text-red-600 hover:bg-red-50"
                      : "border-cyan-200 bg-white text-ai hover:bg-cyan-50",
                  ].join(" ")}
                >
                  {isStaged ? <Trash2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  {isStaged ? "Remove from brief" : "Add to brief"}
                </button>
                <button
                  type="button"
                  onClick={() => onMarkActionReviewed(action.id)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition",
                    isReviewed
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:text-ai",
                  ].join(" ")}
                >
                  <Check className="h-4 w-4" />
                  {isReviewed ? "Reviewed" : "Mark reviewed"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CentralChangeLog({ events }: { events: InsightTimelineEvent[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Clock3 className="h-5 w-5 text-ai" />
        <h2 className="text-base font-bold text-ink">Central Change Log</h2>
      </div>
      <div className="mt-4 space-y-1">
        {events.map((event, index) => (
          <article
            key={event.id}
            className={[
              "grid gap-3 rounded-lg px-3 py-3 text-sm sm:grid-cols-[90px_minmax(0,1fr)]",
              index === events.length - 1 ? "bg-cyan-50 text-ai" : "text-slate-700",
            ].join(" ")}
          >
            <p className="font-bold">{event.timestamp}</p>
            <p className="leading-6">{event.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ImportantAlerts({
  issues,
  anomalies,
  onOpenNotifications,
}: {
  issues: SecondaryIssue[];
  anomalies: AnomalyEvent[];
  onOpenNotifications: () => void;
}) {
  const alertItems = [
    ...issues.slice(0, 2).map((issue) => ({
      id: issue.id,
      title: issue.title,
      body: issue.summary,
      severity: issue.severity === "high" ? "High" : "Medium",
      tone: issue.severity === "high" ? "high" : "warning",
      icon: AlertTriangle,
    })),
    ...anomalies.slice(0, 1).map((anomaly) => ({
      id: anomaly.id,
      title: "Unusual respiratory arrivals above baseline",
      body: `${anomaly.summary} Anomaly score ${Math.round(anomaly.anomalyScore * 100)}.`,
      severity: "Info",
      tone: "ai",
      icon: TrendingUp,
    })),
  ] as const;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-700" />
          <h2 className="text-base font-bold text-ink">Important Alerts</h2>
        </div>
        <button type="button" onClick={onOpenNotifications} className="text-xs font-bold text-ai hover:text-cyan-700">
          View all
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {alertItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.id}
              className={[
                "rounded-lg border p-4",
                item.tone === "high"
                  ? "border-red-100 bg-red-50/70"
                  : item.tone === "warning"
                    ? "border-amber-100 bg-amber-50/70"
                    : "border-cyan-100 bg-cyan-50/60",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={[
                    "mt-1 h-5 w-5 shrink-0",
                    item.tone === "high" ? "text-red-500" : item.tone === "warning" ? "text-amber-500" : "text-ai",
                  ].join(" ")}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                    <StatusBadge label={item.severity} tone={item.tone as Tone} size="sm" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DepartmentShortcut({
  departments,
  onSelectDepartment,
  onOpenDepartments,
}: {
  departments: DepartmentSignal[];
  onSelectDepartment: (departmentId: DepartmentId) => void;
  onOpenDepartments: () => void;
}) {
  const handleSelect = (departmentId: DepartmentId) => {
    onSelectDepartment(departmentId);
    onOpenDepartments();
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-ai" />
        <h2 className="text-base font-bold text-ai">Department Drill-down</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">Explore detailed insights on a specific area.</p>
      <select
        defaultValue=""
        aria-label="Select department"
        onChange={(event) => {
          if (event.target.value) {
            handleSelect(event.target.value as DepartmentId);
          }
        }}
        className="mt-4 h-11 w-full rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-100"
      >
        <option value="" disabled>
          Select department
        </option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
      <div className="mt-3 space-y-1">
        {departments.map((department) => (
          <button
            key={department.id}
            type="button"
            onClick={() => handleSelect(department.id)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-ai"
          >
            <span>{department.name}</span>
            <StatusBadge label={department.bottleneckRole} tone={roleTone(department.bottleneckRole)} size="sm" />
          </button>
        ))}
      </div>
    </section>
  );
}

function SafetyBoundary() {
  return (
    <section className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-5">
      <div className="flex items-center gap-2 text-ai">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="text-base font-bold">Coordination support only</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        No clinical decisions are made by Coordina. Clinical safety takes priority over flow improvement, and all suggested
        follow-up actions require human review.
      </p>
    </section>
  );
}

function TrendBadge({ trend }: { trend: TrendDirection }) {
  const isWorsening = trend === "worsening" || trend === "new";
  const Icon = trend === "improving" ? TrendingDown : TrendingUp;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
        isWorsening ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-green-50 text-green-700 ring-1 ring-green-100",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {trend}
    </span>
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

function roleTone(role: DepartmentSignal["bottleneckRole"]): Tone {
  if (role === "primary contributor") {
    return "ai";
  }

  if (role === "secondary contributor") {
    return "warning";
  }

  return "neutral";
}
