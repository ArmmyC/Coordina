import { useEffect, useMemo, useState } from "react";
import { ActionBriefPage } from "./components/ActionBriefPage";
import { ActionDetailModal } from "./components/ActionDetailModal";
import { CentralAIPage } from "./components/CentralAIPage";
import { DepartmentsPage } from "./components/DepartmentsPage";
import { HeaderBar } from "./components/HeaderBar";
import { NotificationsPage } from "./components/NotificationsPage";
import { SettingsPage } from "./components/SettingsPage";
import { type AppPage, Sidebar } from "./components/Sidebar";
import { SimulationControlPanel } from "./components/SimulationControlPanel";
import { SirirajSurgePage } from "./components/SirirajSurgePage";
import { initialBriefSnapshots } from "./data/careflowData";
import { directorBriefing, sirirajSuggestedActions } from "./data/sirirajSurgeData";
import {
  requestAnomalyExplanation,
  requestBriefText,
  requestCentralInsight,
  requestDepartmentInsight,
} from "./lib/ai/client";
import type { AnomalyResponse, CentralInsightResponse, DepartmentInsightResponse } from "./lib/ai/types";
import { buildBriefSnapshotFromInsight, simulationToHospitalSnapshot } from "./lib/simulation/adapters";
import { advanceSimulationState, createInitialSimulationState, resetSimulationState } from "./lib/simulation/engine";
import { defaultScenarioId, scenarioPresets } from "./lib/simulation/scenarios";
import type { SimulationScenarioId, SimulationSpeed } from "./lib/simulation/types";
import type {
  BriefReviewStatus,
  BriefSnapshot,
  DepartmentId,
  HospitalSnapshot,
  NotificationItem,
  SuggestedAction,
} from "./types";

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>("siriraj-surge");
  const [isLive, setIsLive] = useState(true);
  const [scenarioId, setScenarioId] = useState<SimulationScenarioId>(defaultScenarioId);
  const [simulationState, setSimulationState] = useState(() => createInitialSimulationState(defaultScenarioId));
  const [isSimulationPlaying, setIsSimulationPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>(1);
  const [aiCentralInsight, setAiCentralInsight] = useState<CentralInsightResponse | null>(null);
  const [aiDepartmentInsights, setAiDepartmentInsights] = useState<Partial<Record<DepartmentId, DepartmentInsightResponse>>>({});
  const [aiAnomaly, setAiAnomaly] = useState<AnomalyResponse | null>(null);
  const [aiStatus, setAiStatus] = useState("Local fallback ready");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<DepartmentId>("ed");
  const [briefSnapshots, setBriefSnapshots] = useState<BriefSnapshot[]>(initialBriefSnapshots);
  const [activeBriefId, setActiveBriefId] = useState(initialBriefSnapshots[0]?.id ?? "");
  const [stagedActionIds, setStagedActionIds] = useState<string[]>([]);
  const [reviewedActionIds, setReviewedActionIds] = useState<string[]>([]);
  const [reviewPromptDismissed, setReviewPromptDismissed] = useState(false);
  const [reviewedNotificationIds, setReviewedNotificationIds] = useState<string[]>([]);
  const [selectedActionDetail, setSelectedActionDetail] = useState<SuggestedAction | null>(null);

  useEffect(() => {
    if (!isLive || !isSimulationPlaying) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSimulationState((current) => advanceSimulationState(current, simulationSpeed));
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isLive, isSimulationPlaying, simulationSpeed]);

  useEffect(() => {
    let cancelled = false;

    async function refreshAiNarrative() {
      setAiStatus("AI summarizing...");
      const [centralResult, anomalyResult, departmentResult] = await Promise.all([
        requestCentralInsight(simulationState),
        requestAnomalyExplanation(simulationState),
        requestDepartmentInsight(simulationState, selectedDepartmentId),
      ]);

      if (cancelled) {
        return;
      }

      if (centralResult) {
        setAiCentralInsight(centralResult.data);
      }

      if (anomalyResult) {
        setAiAnomaly(anomalyResult.data);
      } else if (simulationState.anomalyScore < 0.48) {
        setAiAnomaly(null);
      }

      if (departmentResult) {
        setAiDepartmentInsights((current) => ({
          ...current,
          [selectedDepartmentId]: departmentResult.data,
        }));
      }

      const source = centralResult?.source ?? departmentResult?.source ?? anomalyResult?.source;
      if (source === "openai") {
        setAiStatus("OpenAI narrative active");
      } else if (source === "server-fallback") {
        setAiStatus("Server fallback active");
      } else {
        setAiStatus("Local fallback active");
      }
    }

    void refreshAiNarrative();

    return () => {
      cancelled = true;
    };
  }, [
    selectedDepartmentId,
    simulationState.anomalyScore,
    simulationState.materialChange,
    simulationState.primaryBottleneck,
    simulationState.scenario,
    simulationState.tick,
  ]);

  const currentSnapshot = useMemo<HospitalSnapshot>(
    () => {
      const snapshot = simulationToHospitalSnapshot(simulationState, aiCentralInsight, aiDepartmentInsights, aiAnomaly);
      return {
        ...snapshot,
        liveOps: {
          ...snapshot.liveOps,
          mode: isLive ? "Live" : "Snapshot",
          dataFreshnessLabel: isLive
            ? snapshot.liveOps.dataFreshnessLabel
            : `Snapshot frozen at ${simulationState.lastUpdatedAt}`,
        },
      };
    },
    [aiAnomaly, aiCentralInsight, aiDepartmentInsights, isLive, simulationState],
  );

  const insight = currentSnapshot.primaryInsight;
  const selectedDepartment =
    currentSnapshot.departments.find((department) => department.id === selectedDepartmentId) ??
    currentSnapshot.departments[0]!;
  const selectedBrief = briefSnapshots.find((brief) => brief.id === activeBriefId) ?? briefSnapshots[0];
  const stagedActions = currentSnapshot.actions.filter((action) => stagedActionIds.includes(action.id));
  const notifications = currentSnapshot.notifications.map((notification) =>
    reviewedNotificationIds.includes(notification.id)
      ? { ...notification, acknowledged: true, reviewed: true }
      : notification,
  );
  const unreadCount = notifications.filter((notification) => !notification.acknowledged).length;
  const latestBrief = briefSnapshots[0];
  const briefReviewNeeded = Boolean(
    latestBrief &&
      insight.materiallyChanged &&
      latestBrief.sourceInsightUpdatedAt !== insight.lastUpdatedAt &&
      !reviewPromptDismissed,
  );

  const addActionToBrief = (action: SuggestedAction) => {
    setStagedActionIds((current) => (current.includes(action.id) ? current : [...current, action.id]));
  };

  const removeActionFromBrief = (action: SuggestedAction) => {
    setStagedActionIds((current) => current.filter((id) => id !== action.id));
    setReviewedActionIds((current) => current.filter((id) => id !== action.id));
  };

  const markActionReviewed = (actionId: string) => {
    setReviewedActionIds((current) => (current.includes(actionId) ? current : [...current, actionId]));
  };

  const saveBriefFromCurrent = async () => {
    const actions = stagedActions.length ? stagedActions : insight.suggestedActions.slice(0, 3);
    const briefResult = await requestBriefText({ state: simulationState, insight, actions });
    const next = buildBriefSnapshotFromInsight({
      insight,
      actions,
      version: nextBriefVersion(briefSnapshots),
      createdAt: currentTimeLabel(),
      title: briefResult?.data.title ?? `${currentTimeLabel()} Hospital Flow Brief`,
      summary: briefResult?.data.summary,
    });

    setBriefSnapshots((current) => [next, ...current]);
    setActiveBriefId(next.id);
    setReviewPromptDismissed(false);
    setActivePage("action-brief");
  };

  const saveSirirajSurgeBrief = () => {
    const createdAt = currentTimeLabel();
    const next: BriefSnapshot = {
      id: `siriraj-surge-brief-${Date.now()}`,
      title: `${createdAt} Siriraj Surge Brief`,
      createdAt,
      sourceInsightId: "siriraj-surge-day21",
      sourceInsightUpdatedAt: "16:00",
      sourceInsightTitle: "Siriraj respiratory-surge command simulation",
      summary: directorBriefing.oneLine,
      rootCauseSummary:
        "The report identifies a cross-department operational pattern involving front-door crowding, diagnostic delay, critical-care capacity, oxygen and isolation pressure, discharge blockers, referral communication, and data-trust validation.",
      actions: sirirajSuggestedActions.map((action) => ({ ...action })),
      safetyNote: directorBriefing.mandatoryRecheck,
      version: nextBriefVersion(briefSnapshots),
      reviewStatus: "Saved",
    };

    setBriefSnapshots((current) => [next, ...current]);
    setActiveBriefId(next.id);
    setReviewPromptDismissed(false);
    setActivePage("action-brief");
  };

  const duplicateBrief = (snapshotId: string) => {
    const source = briefSnapshots.find((snapshot) => snapshot.id === snapshotId);

    if (!source) {
      return;
    }

    const copy: BriefSnapshot = {
      ...source,
      id: `brief-copy-${Date.now()}`,
      title: `${source.title} Copy`,
      createdAt: currentTimeLabel(),
      actions: source.actions.map((action) => ({ ...action })),
      version: nextBriefVersion(briefSnapshots),
      reviewStatus: "Saved",
    };

    setBriefSnapshots((current) => [copy, ...current]);
    setActiveBriefId(copy.id);
  };

  const deleteBriefSnapshot = (snapshotId: string) => {
    setBriefSnapshots((current) => {
      const next = current.filter((snapshot) => snapshot.id !== snapshotId);

      setActiveBriefId((currentId) => {
        if (currentId !== snapshotId) {
          return currentId;
        }

        return next[0]?.id ?? "";
      });

      return next;
    });
  };

  const removeActionFromSnapshot = (snapshotId: string, actionId: string) => {
    setBriefSnapshots((current) =>
      current.map((snapshot) =>
        snapshot.id === snapshotId
          ? { ...snapshot, actions: snapshot.actions.filter((action) => action.id !== actionId) }
          : snapshot,
      ),
    );
  };

  const updateBriefFromCurrent = async (_snapshotId: string) => {
    const actions = stagedActions.length ? stagedActions : insight.suggestedActions.slice(0, 3);
    const briefResult = await requestBriefText({ state: simulationState, insight, actions });
    const next = buildBriefSnapshotFromInsight({
      insight,
      actions,
      version: nextBriefVersion(briefSnapshots),
      createdAt: currentTimeLabel(),
      title: briefResult?.data.title ?? `${currentTimeLabel()} Hospital Flow Brief`,
      summary: briefResult?.data.summary,
    });

    setBriefSnapshots((current) => [next, ...current]);
    setActiveBriefId(next.id);
    setReviewPromptDismissed(false);
    setActivePage("action-brief");
  };

  const reviewBriefUpdate = () => {
    updateBriefFromCurrent(activeBriefId);
  };

  const keepCurrentBrief = () => {
    setReviewPromptDismissed(true);
    if (selectedBrief) {
      setBriefSnapshots((current) =>
        current.map((brief) =>
          brief.id === selectedBrief.id ? { ...brief, reviewStatus: "Saved" as BriefReviewStatus } : brief,
        ),
      );
    }
  };

  const markBriefReviewed = (snapshotId: string) => {
    setBriefSnapshots((current) =>
      current.map((brief) => (brief.id === snapshotId ? { ...brief, reviewStatus: "Reviewed" } : brief)),
    );
  };

  const markNotificationReviewed = (notificationId: string) => {
    setReviewedNotificationIds((current) =>
      current.includes(notificationId) ? current : [...current, notificationId],
    );
  };

  const handleNotificationAction = (notification: NotificationItem) => {
    if (notification.target === "brief") {
      setActivePage("action-brief");
    }

    if (notification.target === "insight" || notification.target === "timeline") {
      setActivePage("central-ai");
    }

    if (notification.relatedDepartment) {
      setSelectedDepartmentId(notification.relatedDepartment);
    }

    markNotificationReviewed(notification.id);
  };

  const selectDepartmentAndOpen = (departmentId: DepartmentId) => {
    setSelectedDepartmentId(departmentId);
  };

  const changeScenario = (nextScenarioId: SimulationScenarioId) => {
    setScenarioId(nextScenarioId);
    setSimulationState(resetSimulationState(nextScenarioId));
    setAiCentralInsight(null);
    setAiDepartmentInsights({});
    setAiAnomaly(null);
    setReviewedNotificationIds([]);
    setReviewPromptDismissed(false);
  };

  const resetSimulation = () => {
    setSimulationState(resetSimulationState(scenarioId));
    setAiCentralInsight(null);
    setAiDepartmentInsights({});
    setAiAnomaly(null);
    setReviewedNotificationIds([]);
    setReviewPromptDismissed(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <Sidebar activePage={activePage} unreadCount={unreadCount} onNavigate={setActivePage} />
      <HeaderBar
        snapshot={currentSnapshot}
        unreadCount={unreadCount}
        isLive={isLive}
        onToggleLive={() => setIsLive((current) => !current)}
        onOpenNotifications={() => setActivePage("notifications")}
      />
      <MobileNav activePage={activePage} unreadCount={unreadCount} onNavigate={setActivePage} />

      <div className="lg:ml-64">
        {activePage === "siriraj-surge" ? (
          <SirirajSurgePage
            onOpenActionBrief={saveSirirajSurgeBrief}
            onOpenNotifications={() => setActivePage("notifications")}
          />
        ) : null}

        {activePage === "central-ai" ? (
          <CentralAIPage
            insight={insight}
            departments={currentSnapshot.departments}
            secondaryIssues={currentSnapshot.secondaryIssues}
            timeline={currentSnapshot.timeline}
            anomalies={currentSnapshot.anomalies}
            stagedActionIds={stagedActionIds}
            reviewedActionIds={reviewedActionIds}
            briefReviewNeeded={briefReviewNeeded}
            simulationPanel={
              <SimulationControlPanel
                state={simulationState}
                scenarios={scenarioPresets}
                scenarioId={scenarioId}
                isPlaying={isSimulationPlaying}
                isLive={isLive}
                speed={simulationSpeed}
                aiStatus={aiStatus}
                onTogglePlay={() => setIsSimulationPlaying((current) => !current)}
                onReset={resetSimulation}
                onScenarioChange={changeScenario}
                onSpeedChange={setSimulationSpeed}
                onToggleLive={() => setIsLive((current) => !current)}
              />
            }
            onAddActionToBrief={addActionToBrief}
            onRemoveActionFromBrief={removeActionFromBrief}
            onMarkActionReviewed={markActionReviewed}
            onOpenActionDetail={setSelectedActionDetail}
            onSaveInsightSnapshot={saveBriefFromCurrent}
            onOpenNotifications={() => setActivePage("notifications")}
            onSelectDepartment={selectDepartmentAndOpen}
            onOpenDepartments={() => setActivePage("departments")}
            onReviewBriefUpdate={reviewBriefUpdate}
            onKeepCurrentBrief={keepCurrentBrief}
          />
        ) : null}

        {activePage === "departments" ? (
          <DepartmentsPage
            departments={currentSnapshot.departments}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartmentId}
          />
        ) : null}

        {activePage === "action-brief" ? (
          <ActionBriefPage
            currentInsight={insight}
            snapshots={briefSnapshots}
            selectedSnapshot={selectedBrief}
            stagedActions={stagedActions}
            briefReviewNeeded={briefReviewNeeded}
            onSelectSnapshot={setActiveBriefId}
            onSaveBriefFromCurrent={saveBriefFromCurrent}
            onDuplicateBrief={duplicateBrief}
            onUpdateBriefFromCurrent={updateBriefFromCurrent}
            onKeepCurrentBrief={keepCurrentBrief}
            onMarkBriefReviewed={markBriefReviewed}
            onDeleteSnapshot={deleteBriefSnapshot}
            onRemoveStagedAction={removeActionFromBrief}
            onRemoveActionFromSnapshot={removeActionFromSnapshot}
          />
        ) : null}

        {activePage === "notifications" ? (
          <NotificationsPage
            notifications={notifications}
            onNotificationAction={handleNotificationAction}
            onMarkReviewed={markNotificationReviewed}
          />
        ) : null}

        {activePage === "settings" ? (
          <SettingsPage
            snapshot={currentSnapshot}
            isLive={isLive}
            onToggleLive={() => setIsLive((current) => !current)}
          />
        ) : null}
      </div>

      {selectedActionDetail ? (
        <ActionDetailModal
          action={selectedActionDetail}
          isInBrief={stagedActionIds.includes(selectedActionDetail.id)}
          onAddToBrief={addActionToBrief}
          onRemoveFromBrief={removeActionFromBrief}
          onClose={() => setSelectedActionDetail(null)}
        />
      ) : null}
    </div>
  );
}

function nextBriefVersion(snapshots: BriefSnapshot[]) {
  return snapshots.reduce((max, snapshot) => Math.max(max, snapshot.version), 0) + 1;
}

function currentTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MobileNav({
  activePage,
  unreadCount,
  onNavigate,
}: {
  activePage: AppPage;
  unreadCount: number;
  onNavigate: (page: AppPage) => void;
}) {
  const items: Array<{ id: AppPage; label: string }> = [
    { id: "siriraj-surge", label: "Siriraj" },
    { id: "central-ai", label: "Central AI" },
    { id: "departments", label: "Departments" },
    { id: "action-brief", label: "Brief" },
    { id: "notifications", label: unreadCount ? `Alerts ${unreadCount}` : "Alerts" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="sticky top-20 z-20 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={[
            "whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-bold",
            activePage === item.id
              ? "border-cyan-200 bg-cyan-50 text-ai"
              : "border-slate-200 bg-white text-slate-600",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
