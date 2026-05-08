import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Check,
  ClipboardPlus,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ActionBriefCard } from "./components/ActionBriefCard";
import { AnomalyBanner } from "./components/AnomalyBanner";
import { CentralInsightCard } from "./components/CentralInsightCard";
import { DepartmentCard } from "./components/DepartmentCard";
import { DepartmentDrawer } from "./components/DepartmentDrawer";
import { EvidenceChip } from "./components/EvidenceChip";
import { HeaderBar } from "./components/HeaderBar";
import { KpiCard } from "./components/KpiCard";
import { NotificationPanel } from "./components/NotificationPanel";
import { RootCauseDetailView } from "./components/RootCauseDetailView";
import { StatusBadge } from "./components/StatusBadge";
import { SuggestedActionCard } from "./components/SuggestedActionCard";
import { hospitalSnapshot } from "./data/careflowData";
import type { AnomalyEvent, DepartmentSignal, NotificationItem, SuggestedAction } from "./types";
import { generateCareFlowInsight, minutesToHuman } from "./utils/insightEngine";

export default function App() {
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentSignal | null>(null);
  const [showRootCause, setShowRootCause] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [briefActionIds, setBriefActionIds] = useState<string[]>([]);
  const [briefAnomalyIds, setBriefAnomalyIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(hospitalSnapshot.notifications);
  const [reviewedInsight, setReviewedInsight] = useState(false);

  const insight = useMemo(() => generateCareFlowInsight(hospitalSnapshot), []);
  const importantAnomaly = hospitalSnapshot.anomalies.find((anomaly) => anomaly.level >= 2);
  const selectedActions = hospitalSnapshot.actions.filter((action) => briefActionIds.includes(action.id));
  const selectedAnomalies = hospitalSnapshot.anomalies.filter((anomaly) => briefAnomalyIds.includes(anomaly.id));
  const unreadCount = notifications.filter((notification) => !notification.reviewed).length;

  const addActionToBrief = (action: SuggestedAction) => {
    setBriefActionIds((current) => (current.includes(action.id) ? current : [...current, action.id]));
  };

  const addAnomalyToBrief = (anomaly: AnomalyEvent) => {
    setBriefAnomalyIds((current) => (current.includes(anomaly.id) ? current : [...current, anomaly.id]));
  };

  const addTopSuggestionsToBrief = () => {
    setBriefActionIds((current) => {
      const next = [...current];
      insight.highestLeverageActions.forEach((action) => {
        if (!next.includes(action.id)) {
          next.push(action.id);
        }
      });
      return next;
    });
    setShowBrief(true);
  };

  const markNotificationReviewed = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, reviewed: true } : notification,
      ),
    );
  };

  const markInsightReviewed = () => {
    setReviewedInsight(true);
    setNotifications((current) =>
      current.map((notification) =>
        notification.target === "insight" ? { ...notification, reviewed: true } : notification,
      ),
    );
  };

  return (
    <div className="min-h-screen text-ink">
      <HeaderBar
        snapshot={hospitalSnapshot}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {importantAnomaly ? (
        <AnomalyBanner
          anomaly={importantAnomaly}
          isInBrief={briefAnomalyIds.includes(importantAnomaly.id)}
          onOpen={() => setShowNotifications(true)}
          onAddToBrief={addAnomalyToBrief}
        />
      ) : null}

      <main className="mx-auto max-w-[1560px] space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {hospitalSnapshot.kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </section>

        <CentralInsightCard
          insight={insight}
          briefActionIds={briefActionIds}
          onAddToBrief={addActionToBrief}
          onOpenRootCause={() => setShowRootCause(true)}
          onOpenBrief={() => setShowBrief(true)}
          onMarkReviewed={markInsightReviewed}
        />

        <section className="glass-card rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-ai" />
                <h2 className="text-xl font-bold text-ink">Department Overview</h2>
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                  i
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Department agents provide evidence for the central insight without making clinical decisions.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl px-3 py-2 text-sm font-bold text-ai transition hover:bg-cyan-50"
            >
              View all departments
            </button>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {hospitalSnapshot.departments.map((department) => (
              <DepartmentCard key={department.id} department={department} onOpen={setSelectedDepartment} />
            ))}
          </div>
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TimeLossPanel departments={hospitalSnapshot.departments} />
          <FollowUpPanel
            actions={hospitalSnapshot.actions}
            briefActionIds={briefActionIds}
            onAddToBrief={addActionToBrief}
          />
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ActionBriefPreview
            selectedCount={selectedActions.length}
            anomalyCount={selectedAnomalies.length}
            onOpenBrief={() => setShowBrief(true)}
            onAddTopSuggestions={addTopSuggestionsToBrief}
          />
          <AnomalyRadarPanel
            anomaly={importantAnomaly}
            isInBrief={importantAnomaly ? briefAnomalyIds.includes(importantAnomaly.id) : false}
            onAddToBrief={(anomaly) => addAnomalyToBrief(anomaly)}
          />
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ImpactPanel selectedCount={selectedActions.length} reviewedInsight={reviewedInsight} />
          <FutureModesPanel />
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-3 pb-4 text-sm font-medium text-slate-500">
          <span>All times are estimated</span>
          <span>|</span>
          <span>Data refresh: 10:28 AM</span>
          <span>|</span>
          <span>Clinical safety overrides flow improvement</span>
        </footer>
      </main>

      <DepartmentDrawer department={selectedDepartment} onClose={() => setSelectedDepartment(null)} />

      {showRootCause ? (
        <RootCauseDetailView
          insight={insight}
          departments={hospitalSnapshot.departments}
          briefActionIds={briefActionIds}
          onAddToBrief={addActionToBrief}
          onClose={() => setShowRootCause(false)}
        />
      ) : null}

      {showNotifications ? (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onOpenInsight={() => {
            setShowNotifications(false);
            setShowRootCause(true);
          }}
          onOpenAnomaly={() => {
            if (importantAnomaly) {
              addAnomalyToBrief(importantAnomaly);
            }
          }}
          onAddBriefSuggestions={addTopSuggestionsToBrief}
          onMarkReviewed={markNotificationReviewed}
        />
      ) : null}

      {showBrief ? (
        <ActionBriefCard
          snapshot={hospitalSnapshot}
          insight={insight}
          selectedActions={selectedActions}
          selectedAnomalies={selectedAnomalies}
          onClose={() => setShowBrief(false)}
        />
      ) : null}
    </div>
  );
}

interface TimeLossPanelProps {
  departments: DepartmentSignal[];
}

function TimeLossPanel({ departments }: TimeLossPanelProps) {
  const maxTime = Math.max(...departments.map((department) => department.timeLostMinutes));

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-ai" />
        <h2 className="text-xl font-bold text-ink">Time Loss Mode</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        MVP mode: where the hospital is losing patient-flow time right now.
      </p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Total time loss" value="23h 40m" />
          <Metric label="Biggest source" value="ED boarding" />
          <Metric label="Highest leverage" value="Discharge turnover" />
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {departments.map((department) => {
          const width = `${Math.max((department.timeLostMinutes / maxTime) * 100, 8)}%`;
          return (
            <div key={department.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink">{department.name}</p>
                <p className="text-sm font-bold text-slate-600">{minutesToHuman(department.timeLostMinutes)}</p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={[
                    "h-full rounded-full",
                    department.tone === "stable"
                      ? "bg-green-500"
                      : department.tone === "warning" || department.tone === "moderate"
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
    </section>
  );
}

interface FollowUpPanelProps {
  actions: SuggestedAction[];
  briefActionIds: string[];
  onAddToBrief: (action: SuggestedAction) => void;
}

function FollowUpPanel({ actions, briefActionIds, onAddToBrief }: FollowUpPanelProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <ClipboardPlus className="h-5 w-5 text-ai" />
        <h2 className="text-xl font-bold text-ink">Suggested Follow-Up Actions</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Ranked, non-clinical coordination tasks for humans to review and assign.
      </p>
      <div className="mt-5 space-y-4">
        {actions.map((action) => (
          <SuggestedActionCard
            key={action.id}
            action={action}
            isInBrief={briefActionIds.includes(action.id)}
            onAddToBrief={onAddToBrief}
          />
        ))}
      </div>
    </section>
  );
}

interface ActionBriefPreviewProps {
  selectedCount: number;
  anomalyCount: number;
  onOpenBrief: () => void;
  onAddTopSuggestions: () => void;
}

function ActionBriefPreview({
  selectedCount,
  anomalyCount,
  onOpenBrief,
  onAddTopSuggestions,
}: ActionBriefPreviewProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-ai" />
        <h2 className="text-xl font-bold text-ink">Action Brief</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        A human-readable operational memo, not a fake execution workflow.
      </p>
      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-ai">11:00 Hospital Flow Brief</p>
        <h3 className="mt-2 text-2xl font-bold text-ink">ED output blockage</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Root cause: discharge medication backlog, assigned-bed cleaning delays, family pickup friction, and transport
          capacity are keeping ward beds unavailable.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <EvidenceChip label={`${selectedCount} follow-up items`} />
          <EvidenceChip label={`${anomalyCount} anomaly watchout`} />
          <EvidenceChip label="Human review required" />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenBrief}
          className="inline-flex items-center gap-2 rounded-xl bg-ai px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
        >
          <FileText className="h-4 w-4" />
          Open action brief
        </button>
        <button
          type="button"
          onClick={onAddTopSuggestions}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-3 text-sm font-bold text-ai transition hover:bg-cyan-50"
        >
          <ClipboardPlus className="h-4 w-4" />
          Add top suggestions
        </button>
      </div>
    </section>
  );
}

interface AnomalyRadarPanelProps {
  anomaly?: AnomalyEvent;
  isInBrief: boolean;
  onAddToBrief: (anomaly: AnomalyEvent) => void;
}

function AnomalyRadarPanel({ anomaly, isInBrief, onAddToBrief }: AnomalyRadarPanelProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-ai" />
        <h2 className="text-xl font-bold text-ink">Anomaly Radar</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Detects unusual operational patterns for human investigation, not diagnoses or outbreaks.
      </p>
      {anomaly ? (
        <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <StatusBadge label={anomaly.severity} tone="warning" />
              <h3 className="mt-3 text-2xl font-bold text-ink">{anomaly.title}</h3>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Anomaly score</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{Math.round(anomaly.anomalyScore * 100)}</p>
            </div>
          </div>
          <p className="mt-4 leading-7 text-amber-900/80">{anomaly.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {anomaly.evidenceTags.map((tag) => (
              <EvidenceChip key={tag} label={tag} />
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">Recommended reviewer: {anomaly.reviewerRole}</p>
          <button
            type="button"
            onClick={() => onAddToBrief(anomaly)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            <ClipboardPlus className="h-4 w-4" />
            {isInBrief ? "Anomaly added" : "Add watchout to brief"}
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5">
          <StatusBadge label="No abnormal operational surge detected" tone="stable" />
          <p className="mt-3 text-sm leading-6 text-green-900">
            Current bottleneck appears operational and coordination-related.
          </p>
        </div>
      )}
    </section>
  );
}

interface ImpactPanelProps {
  selectedCount: number;
  reviewedInsight: boolean;
}

function ImpactPanel({ selectedCount, reviewedInsight }: ImpactPanelProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-ai" />
        <h2 className="text-xl font-bold text-ink">Impact Snapshot</h2>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Time loss identified" value="23h 40m" />
        <Metric label="Potential capacity released" value="8-12 beds" />
        <Metric label="Departments coordinated" value="5" />
      </div>
      <div className="mt-5 rounded-3xl bg-ink p-5 text-white">
        <p className="text-sm font-semibold text-cyan-100">Pitch-ready takeaway</p>
        <p className="mt-2 text-2xl font-bold leading-snug">
          AGI may tell us what a patient has. CareFlow helps the hospital safely make room to care for them.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <EvidenceChip label={`${selectedCount} brief items selected`} />
        <EvidenceChip label={reviewedInsight ? "Insight reviewed" : "Insight awaiting review"} />
        <EvidenceChip label="Safety boundary respected" />
      </div>
    </section>
  );
}

function FutureModesPanel() {
  const modes = [
    {
      title: "Time Loss Mode",
      status: "Live Demo",
      purpose: "Find where patient-flow time is being lost.",
      icon: BarChart3,
    },
    {
      title: "Safety Risk Mode",
      status: "Future",
      purpose: "Escalate delay patterns that may affect patient safety for human review.",
      icon: ShieldCheck,
    },
    {
      title: "Workload Relief Mode",
      status: "Future",
      purpose: "Reduce avoidable staff coordination burden.",
      icon: BrainCircuit,
    },
  ];

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-ai" />
        <h2 className="text-xl font-bold text-ink">Future Modes</h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <article key={mode.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ai-soft text-ai">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <StatusBadge label={mode.status} tone={mode.status === "Live Demo" ? "ai" : "neutral"} size="sm" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink">{mode.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{mode.purpose}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
