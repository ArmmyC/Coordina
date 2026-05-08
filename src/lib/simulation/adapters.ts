import type {
  AnomalyEvent,
  BriefSnapshot,
  BottleneckRole,
  ConfidenceLabel,
  DepartmentFlowStage,
  DepartmentId,
  DepartmentSignal,
  HospitalSnapshot,
  Insight,
  InsightSeverity,
  InsightTimelineEvent,
  NotificationItem,
  NotificationSeverity,
  SecondaryIssue,
  SuggestedAction,
  Tone,
  TrendDirection,
} from "../../types";
import type { AnomalyResponse, CentralInsightResponse, DepartmentInsightResponse } from "../ai/types";
import { getScenarioPreset } from "./scenarios";
import type { SimulationEvent, SimulationState } from "./types";

const safetyNote =
  "Coordina provides coordination support only. No clinical decisions are made by Coordina; humans review and act.";

const departmentNames: Record<DepartmentId, string> = {
  ed: "ED",
  beds: "Beds",
  pharmacy: "Pharmacy",
  discharge: "Discharge",
  transport: "Transport",
  radiology: "Radiology",
};

export function simulationToHospitalSnapshot(
  state: SimulationState,
  aiCentral?: CentralInsightResponse | null,
  aiDepartments: Partial<Record<DepartmentId, DepartmentInsightResponse>> = {},
  aiAnomaly?: AnomalyResponse | null,
): HospitalSnapshot {
  const insight = buildInsight(state, aiCentral);
  const departments = buildDepartments(state, aiDepartments, insight);
  const actions = insight.suggestedActions;
  const secondaryIssues = buildSecondaryIssues(state, departments);
  const timeline = buildTimeline(state);
  const anomalies = buildAnomalies(state, aiAnomaly);
  const notifications = buildNotifications(state, aiAnomaly, insight.id);

  return {
    hospitalName: "Siriraj Hospital",
    scenarioName: getScenarioPreset(state.scenario).name,
    snapshotTime: state.simulatedTime,
    dataLabel: "Synthetic respiratory-surge simulation",
    safetyLabel: "Coordination Support Only",
    liveOps: {
      mode: "Live",
      autoRefreshLabel: "Simulation tick every 5s",
      dataFreshnessLabel: `Last updated ${state.lastUpdatedAt}`,
      snapshotLabel: `${getScenarioPreset(state.scenario).name} snapshot`,
      lastRefreshAt: state.lastUpdatedAt,
    },
    kpis: [],
    departments,
    actions,
    primaryInsight: insight,
    secondaryIssues,
    timeline,
    anomalies,
    notifications,
  };
}

export function buildBriefSnapshotFromInsight({
  insight,
  actions,
  title,
  version,
  createdAt,
  summary,
}: {
  insight: Insight;
  actions: SuggestedAction[];
  title: string;
  version: number;
  createdAt: string;
  summary?: string;
}): BriefSnapshot {
  return {
    id: `brief-${version}-${Date.now()}`,
    title,
    createdAt,
    sourceInsightId: insight.id,
    sourceInsightUpdatedAt: insight.lastUpdatedAt,
    sourceInsightTitle: insight.title,
    summary: summary ?? insight.conciseSummary,
    rootCauseSummary: insight.actualInsight,
    actions: actions.map((action) => ({ ...action })),
    safetyNote: insight.safetyNote,
    version,
    reviewStatus: "Saved",
  };
}

function buildInsight(state: SimulationState, aiCentral?: CentralInsightResponse | null): Insight {
  const primaryName = departmentNames[state.primaryBottleneck];
  const local = localCentralInsight(state);
  const central = aiCentral ?? local;
  const actions = normalizeActions(central.suggestedActions, state.primaryBottleneck, state);
  const title = sanitizeOperationalText(central.title);

  return {
    id: `sim-insight-${state.scenario}-${state.tick}-${state.primaryBottleneck}`,
    title,
    mainBottleneck: title,
    visibleProblem: sanitizeOperationalText(central.visibleProblem),
    naiveExplanation: sanitizeOperationalText(central.naiveExplanation),
    actualInsight: sanitizeOperationalText(central.actualInsight),
    coordinaInsight: sanitizeOperationalText(central.actualInsight),
    whyNaiveIncomplete:
      "Arrivals are part of the pressure, but most lost time is downstream after bed request, discharge readiness, medication readiness, pickup confirmation, or transport coordination.",
    departmentsInvolved: central.departmentsInvolved.length
      ? central.departmentsInvolved
      : involvedDepartmentsFor(state.primaryBottleneck),
    evidence: central.supportingEvidence.map(sanitizeOperationalText),
    supportingEvidence: central.supportingEvidence.map(sanitizeOperationalText),
    suggestedActions: actions,
    highestLeverageActions: actions,
    confidence: central.confidence,
    confidenceScore: confidenceScore(central.confidence),
    uncertainty: sanitizeOperationalText(central.uncertainty),
    severity: central.severity,
    trend: central.trend,
    detectedAt: state.tick === 0 ? state.lastUpdatedAt : "Earlier this morning",
    lastUpdatedAt: state.lastUpdatedAt,
    previousInsightId: state.previousPrimaryBottleneck
      ? `sim-insight-${state.scenario}-${Math.max(state.tick - 1, 0)}-${state.previousPrimaryBottleneck}`
      : undefined,
    materiallyChanged: state.materialChange,
    status: "active",
    summary: `${primaryName} is the strongest operational bottleneck in the current simulation state.`,
    conciseSummary: sanitizeOperationalText(localSummaryFromState(state)),
    causeChain: causeChainFor(state.primaryBottleneck),
    changedSincePreviousInsight: sanitizeOperationalText(central.changedSincePrevious),
    safetyNote,
  };
}

function buildDepartments(
  state: SimulationState,
  aiDepartments: Partial<Record<DepartmentId, DepartmentInsightResponse>>,
  insight: Insight,
): DepartmentSignal[] {
  return (Object.keys(departmentNames) as DepartmentId[]).map((department) => {
    const local = localDepartmentInsight(state, department);
    const ai = aiDepartments[department];
    const score = state.departments[department].bottleneckScore;
    const role = ai?.bottleneckRole ?? roleForDepartment(department, state.primaryBottleneck, score);
    const confidence = ai?.confidence ?? confidenceFromScore(score);

    return {
      id: department,
      name: departmentNames[department],
      status: statusFromScore(score),
      tone: toneFromScore(score),
      affectedPatients: affectedPatientsFor(state, department),
      timeLostMinutes: state.departments[department].estimatedTimeLostMinutes,
      estimatedTimeLostMinutes: state.departments[department].estimatedTimeLostMinutes,
      lastUpdatedAt: state.lastUpdatedAt,
      bottleneckRole: role,
      confidence,
      confidenceScore: confidenceScore(confidence),
      localProblem: sanitizeOperationalText(ai?.localProblem ?? local.localProblem),
      trend: ai?.trend ?? state.departments[department].trend,
      structureNotes: structureNotesFor(department),
      flowStages: flowStagesFor(state, department),
      summary: sanitizeOperationalText(ai?.summary ?? local.summary),
      localMetrics: localMetricsFor(state, department),
      evidence: (ai?.evidence.length ? ai.evidence : local.evidence).map(sanitizeOperationalText),
      whyItMatters: sanitizeOperationalText(ai?.whyItMatters ?? local.whyItMatters),
      relatedDepartments: relatedDepartmentsFor(department, insight.departmentsInvolved),
      sparkline: sparklineFor(state, department),
      changeLog: state.events
        .filter((event) => event.relatedDepartment === department || department === state.primaryBottleneck)
        .slice(0, 3)
        .map((event) => ({ id: event.id, timestamp: event.timestamp, message: sanitizeOperationalText(event.message) })),
    };
  });
}

function buildSecondaryIssues(state: SimulationState, departments: DepartmentSignal[]): SecondaryIssue[] {
  return departments
    .filter((department) => department.id !== state.primaryBottleneck)
    .sort((a, b) => b.timeLostMinutes - a.timeLostMinutes)
    .slice(0, 4)
    .map((department) => ({
      id: `issue-${department.id}-${state.tick}`,
      title: `${department.name} ${department.trend === "worsening" ? "pressure rising" : "monitored"}`,
      severity: severityFromScore(state.departments[department.id].bottleneckScore, state.anomalyScore),
      summary: department.summary,
      affectedPatients: department.affectedPatients,
      estimatedTimeLostMinutes: department.timeLostMinutes,
      lastUpdatedAt: department.lastUpdatedAt,
      relationToPrimary: department.bottleneckRole,
      trend: department.trend,
    }));
}

function buildTimeline(state: SimulationState): InsightTimelineEvent[] {
  return state.events.slice(0, 6).map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    eventType: event.type === "brief may be outdated" ? "brief review prompt" : eventTypeFromSimulation(event),
    severity: notificationSeverity(event.severity),
    explanation: sanitizeOperationalText(event.message),
    actionLabel: event.severity === "info" ? "Mark reviewed" : "Review insight",
    relatedInsightId: `sim-insight-${state.scenario}-${state.tick}-${state.primaryBottleneck}`,
  }));
}

function buildAnomalies(state: SimulationState, aiAnomaly?: AnomalyResponse | null): AnomalyEvent[] {
  if (state.anomalyScore < 0.48 && !aiAnomaly) {
    return [];
  }

  const severity = aiAnomaly?.severity ?? (state.anomalyScore >= 0.72 ? "escalation" : "warning");
  return [
    {
      id: `anomaly-${state.tick}`,
      level: severity === "escalation" ? 3 : 2,
      title: sanitizeOperationalText(aiAnomaly?.title ?? "Unusual respiratory-surge operational pattern"),
      timestamp: state.lastUpdatedAt,
      severity: notificationSeverity(severity),
      anomalyScore: state.anomalyScore,
      summary: sanitizeOperationalText(
        aiAnomaly?.summary ??
          `Respiratory-like arrivals are ${Math.round(state.metrics.respiratoryLikeArrivalRatio * 100)}% of arrivals, above the simulated baseline. Review suggested.`,
      ),
      reviewerRole: aiAnomaly?.reviewSuggestedFor ?? "ED lead and operations supervisor",
      evidenceTags: [
        "Arrivals above baseline",
        `Anomaly score ${Math.round(state.anomalyScore * 100)}`,
        "Operational pattern only",
      ],
      recommendedAction: sanitizeOperationalText(
        aiAnomaly?.whyEscalated ?? "Review the unusual operational pattern and decide whether escalation is recommended.",
      ),
      briefText: sanitizeOperationalText(
        aiAnomaly?.summary ??
          "Respiratory-like arrivals are above baseline. Human review is suggested for operational coordination.",
      ),
      relatedInsightId: `sim-insight-${state.scenario}-${state.tick}-${state.primaryBottleneck}`,
    },
  ];
}

function buildNotifications(
  state: SimulationState,
  aiAnomaly: AnomalyResponse | null | undefined,
  insightId: string,
): NotificationItem[] {
  const eventNotifications: NotificationItem[] = state.events.slice(0, 7).map((event) => ({
    id: `notice-${event.id}`,
    type: eventTypeFromSimulation(event),
    title: sanitizeOperationalText(event.title),
    message: sanitizeOperationalText(event.message),
    severity: notificationSeverity(event.severity),
    timestamp: event.timestamp,
    relatedInsightId: insightId,
    relatedDepartment: event.relatedDepartment,
    actionLabel: event.relatedDepartment ? "Open department" : "Review insight",
    target: event.relatedDepartment ? "timeline" : "insight",
    acknowledged: false,
    reviewed: false,
  }));

  if (aiAnomaly || state.anomalyScore >= 0.58) {
    eventNotifications.unshift({
      id: `notice-anomaly-${state.tick}`,
      type: "anomaly detected",
      title: "Unusual operational pattern",
      message: sanitizeOperationalText(
        aiAnomaly?.summary ??
          `Respiratory-like arrivals are above baseline with anomaly score ${Math.round(state.anomalyScore * 100)}. Review suggested.`,
      ),
      severity: notificationSeverity(aiAnomaly?.severity ?? (state.anomalyScore >= 0.72 ? "escalation" : "warning")),
      timestamp: state.lastUpdatedAt,
      relatedInsightId: insightId,
      relatedDepartment: "ed",
      actionLabel: "Review anomaly",
      target: "anomaly",
      acknowledged: false,
      reviewed: false,
    });
  }

  return eventNotifications;
}

function localCentralInsight(state: SimulationState): CentralInsightResponse {
  const primary = state.primaryBottleneck;
  const title = titleForPrimary(primary);

  return {
    title,
    visibleProblem: visibleProblemFor(state),
    naiveExplanation: "The surface explanation is that arrivals are above baseline.",
    actualInsight: actualInsightFor(state),
    supportingEvidence: evidenceFor(state),
    departmentsInvolved: involvedDepartmentsFor(primary),
    suggestedActions: actionResponsesFor(state),
    confidence: confidenceFromScore(state.primaryBottleneckScore),
    uncertainty:
      "This is a synthetic operations simulation. Queue timestamps may lag and all follow-up actions require human review.",
    trend: state.centralTrend,
    severity: state.severity,
    changedSincePrevious: state.changedSincePrevious,
  };
}

function localDepartmentInsight(state: SimulationState, department: DepartmentId): DepartmentInsightResponse {
  const score = state.departments[department].bottleneckScore;
  const role = roleForDepartment(department, state.primaryBottleneck, score);
  return {
    department,
    summary: departmentSummaryFor(state, department),
    localProblem: departmentProblemFor(state, department),
    whyItMatters: departmentWhyFor(state, department),
    bottleneckRole: role,
    evidence: localEvidenceFor(state, department),
    trend: state.departments[department].trend,
    confidence: confidenceFromScore(score),
  };
}

function normalizeActions(
  actions: CentralInsightResponse["suggestedActions"],
  primary: DepartmentId,
  state: SimulationState,
): SuggestedAction[] {
  return actions.slice(0, 4).map((action, index) => ({
    id: action.id ?? `${state.scenario}-${primary}-action-${index + 1}`,
    title: sanitizeOperationalText(action.title),
    ownerRole: sanitizeOperationalText(action.ownerRole),
    department: departmentNames[ownerDepartment(action.ownerRole, primary)],
    impact: action.impact,
    reason: sanitizeOperationalText(action.briefText),
    estimatedTimeSavedMinutes: action.estimatedTimeSavedMinutes,
    affectedPatients: action.affectedPatients,
    confidence: action.confidence,
    evidenceTags: ["Simulation-derived", "Human review required"],
    uncertainty: "Impact estimates are simulated and should be checked against local operational boards.",
    safetyNote,
    briefText: sanitizeOperationalText(action.briefText),
    sourceInsightId: `sim-insight-${state.scenario}-${state.tick}-${primary}`,
  }));
}

function actionResponsesFor(state: SimulationState): CentralInsightResponse["suggestedActions"] {
  const metrics = state.metrics;
  const base = [
    {
      id: "review-respiratory-ed-flow",
      title: "Review ED respiratory-surge flow and boarder split",
      ownerRole: "ED lead",
      impact: "High" as const,
      affectedPatients: metrics.edBoarders + metrics.edWaitingMediumAcuity,
      estimatedTimeSavedMinutes: Math.round(metrics.edBoarders * 12),
      confidence: confidenceFromScore(state.departments.ed.bottleneckScore),
      safetyNote,
      briefText:
        "ED lead: review respiratory-surge flow, triage-to-boarder split, and admitted boarders waiting for ward movement.",
    },
    {
      id: "prioritize-assigned-bed-turnover",
      title: "Prioritize assigned bed turnover readiness",
      ownerRole: "Bed manager",
      impact: "High" as const,
      affectedPatients: metrics.assignedNotReadyBeds + metrics.dirtyBeds,
      estimatedTimeSavedMinutes: Math.round((metrics.assignedNotReadyBeds + metrics.dirtyBeds) * 18),
      confidence: confidenceFromScore(state.departments.beds.bottleneckScore),
      safetyNote,
      briefText:
        "Bed manager: review assigned-not-ready beds and prioritize cleaning confirmation after ward readiness check.",
    },
    {
      id: "review-discharge-med-queue",
      title: "Review discharge medication queue",
      ownerRole: "Pharmacy coordinator",
      impact: "High" as const,
      affectedPatients: metrics.pharmacyDischargeMedBacklog,
      estimatedTimeSavedMinutes: Math.round(metrics.pharmacyDischargeMedBacklog * 5),
      confidence: confidenceFromScore(state.departments.pharmacy.bottleneckScore),
      safetyNote,
      briefText:
        "Pharmacy coordinator: review discharge medication packs for patients already marked discharge-ready by clinical teams.",
    },
    {
      id: "review-porter-pickup-final-blockers",
      title: "Review porter and pickup final blockers",
      ownerRole: "Operations supervisor",
      impact: metrics.delayedTransfers >= 10 ? ("High" as const) : ("Medium" as const),
      affectedPatients: metrics.delayedTransfers + metrics.familyPickupDelays,
      estimatedTimeSavedMinutes: Math.round((metrics.delayedTransfers + metrics.familyPickupDelays) * 7),
      confidence: confidenceFromScore(state.departments.transport.bottleneckScore),
      safetyNote,
      briefText:
        "Operations supervisor: review porter coverage and family pickup timing for patients otherwise ready to move or leave.",
    },
  ];

  return base.sort((a, b) => b.estimatedTimeSavedMinutes - a.estimatedTimeSavedMinutes);
}

function titleForPrimary(primary: DepartmentId) {
  const titles: Record<DepartmentId, string> = {
    ed: "ED output pressure from respiratory-surge arrivals and downstream boarding",
    beds: "Ward bed turnover is limiting ED output during respiratory-surge pressure",
    pharmacy: "Discharge medication backlog is delaying bed release",
    discharge: "Non-clinical discharge blockers are slowing bed turnover",
    transport: "Transport and pickup delays are final blockers for ready patients",
    radiology: "Radiology queue is rising but remains a monitored contributor",
  };
  return titles[primary];
}

function visibleProblemFor(state: SimulationState) {
  return `ED waiting and boarding are elevated during a synthetic respiratory-surge scenario at ${state.simulatedTime}.`;
}

function actualInsightFor(state: SimulationState) {
  const metrics = state.metrics;
  return `The deepest operational cause is ${departmentNames[state.primaryBottleneck]} pressure interacting with downstream capacity: ${metrics.edBoarders} ED boarders, ${metrics.assignedNotReadyBeds} assigned-not-ready beds, ${metrics.pharmacyDischargeMedBacklog} discharge medication packs, and ${metrics.delayedTransfers} delayed transfers.`;
}

function localSummaryFromState(state: SimulationState) {
  return `${departmentNames[state.primaryBottleneck]} is the current primary bottleneck. Respiratory-like arrivals are ${Math.round(state.metrics.respiratoryLikeArrivalRatio * 100)}% of arrivals, but most time loss is downstream in boarding, bed turnover, discharge readiness, and transport coordination.`;
}

function evidenceFor(state: SimulationState) {
  const m = state.metrics;
  return [
    `${m.edArrivalsPerInterval} arrivals this interval with ${Math.round(m.respiratoryLikeArrivalRatio * 100)}% respiratory-like complaints.`,
    `${m.edBoarders} admitted ED boarders are waiting for downstream movement.`,
    `${m.assignedNotReadyBeds} assigned beds are not ready and ${m.dirtyBeds} beds need turnover.`,
    `${m.pharmacyDischargeMedBacklog} discharge medication packs are pending.`,
    `${m.delayedTransfers} transport moves are delayed with ${m.porterTeamsAvailable} porter teams available.`,
  ];
}

function causeChainFor(primary: DepartmentId) {
  if (primary === "transport") {
    return ["Respiratory surge pressure", "Discharge-ready patients wait", "Porter and pickup queue rises", "Bed release slows"];
  }

  if (primary === "pharmacy") {
    return ["Respiratory surge pressure", "Ward beds stay occupied", "Discharge medication queue grows", "ED boarders cannot move"];
  }

  return ["Respiratory-surge arrivals", "ED boarding rises", "Ward beds unavailable", "Discharge / cleaning / meds / transport delays interact"];
}

function involvedDepartmentsFor(primary: DepartmentId) {
  const always = ["ED", "Beds", "Discharge"];
  if (primary === "pharmacy") return [...always, "Pharmacy", "Transport"];
  if (primary === "transport") return [...always, "Transport", "Pharmacy"];
  if (primary === "radiology") return ["ED", "Radiology", "Beds"];
  return [...always, "Pharmacy", "Transport"];
}

function localMetricsFor(state: SimulationState, department: DepartmentId) {
  const m = state.metrics;
  const metrics: Record<DepartmentId, string[]> = {
    ed: [
      `${m.edArrivalsPerInterval} arrivals this interval`,
      `${Math.round(m.respiratoryLikeArrivalRatio * 100)}% respiratory-like arrival ratio`,
      `${m.edBoarders} ED boarders`,
      `Waiting by acuity: ${m.edWaitingHighAcuity} high, ${m.edWaitingMediumAcuity} medium, ${m.edWaitingLowAcuity} low`,
      `Admission wait estimate: ${m.admissionWaitMinutes} minutes`,
    ],
    beds: [
      `${m.wardOccupancyPercent}% ward occupancy`,
      `${m.availableBeds} available beds`,
      `${m.dirtyBeds} dirty beds`,
      `${m.assignedNotReadyBeds} assigned but not ready`,
      `${m.expectedDischarges} expected discharges`,
    ],
    pharmacy: [
      `${m.pharmacyDischargeMedBacklog} discharge medication packs pending`,
      `${m.pharmacyMedianDelayMinutes} minute median discharge-med delay`,
      `${m.dischargeReadyBlocked} discharge-ready patients blocked across downstream steps`,
    ],
    discharge: [
      `${m.dischargeReadyBlocked} discharge-ready but blocked`,
      `${m.paperworkPending} paperwork tasks pending`,
      `${m.pendingSignatures} pending signatures`,
      `${m.familyPickupDelays} family pickup delays`,
    ],
    transport: [
      `${m.porterTeamsAvailable} porter teams available`,
      `${m.delayedTransfers} delayed transfers`,
      `${m.familyPickupDelays} pickup delays`,
      `${m.transportQueueLength} total movement queue length`,
    ],
    radiology: [
      `${m.radiologyCtQueue} CT queue`,
      `${m.radiologyXrayQueue} X-ray queue`,
      `${m.radiologyUltrasoundQueue} ultrasound queue`,
      `${m.radiologyReportTurnaroundMinutes} minute report turnaround estimate`,
    ],
  };
  return metrics[department];
}

function flowStagesFor(state: SimulationState, department: DepartmentId): DepartmentFlowStage[] {
  const m = state.metrics;
  const flows: Record<DepartmentId, DepartmentFlowStage[]> = {
    ed: [
      stage("ed-arrivals", "Arrival and registration", "ED front desk", `${m.edArrivalsPerInterval} arrivals this interval`, statusFromValue(m.edArrivalsPerInterval, 28, 42), "Registration target under 10m"),
      stage("ed-triage", "Triage", "Triage nurse", `${m.triageImmediate}/${m.triageUrgent}/${m.triageStandard} immediate/urgent/standard`, statusFromValue(m.edWaitingHighAcuity, 4, 9), "Triage target under 15m"),
      stage("ed-care", "ED care area", "ED charge nurse", `${m.edWaitingMediumAcuity} medium-acuity waits`, statusFromValue(m.edWaitingMediumAcuity, 20, 36), "Human prioritization remains clinical"),
      stage("ed-boarders", "Admitted boarders", "ED lead and bed manager", `${m.edBoarders} boarders waiting for ward movement`, statusFromValue(m.edBoarders, 10, 18), "Move once ward bed is ready"),
    ],
    beds: [
      stage("beds-available", "Available beds", "Bed manager", `${m.availableBeds} usable beds visible`, statusFromValue(18 - m.availableBeds, 4, 10), "Confirm ward fit before transfer"),
      stage("beds-dirty", "Dirty bed turnover", "Cleaning team", `${m.dirtyBeds} dirty beds`, statusFromValue(m.dirtyBeds, 5, 10), "Turnover target under 45m"),
      stage("beds-assigned", "Assigned not ready", "Ward coordinator", `${m.assignedNotReadyBeds} assigned-not-ready beds`, statusFromValue(m.assignedNotReadyBeds, 4, 8), "Ready status before movement"),
      stage("beds-discharge", "Expected discharges", "Ward manager", `${m.expectedDischarges} expected discharges`, "Monitored", "Clinical discharge remains human-owned"),
    ],
    pharmacy: [
      stage("pharm-queue", "Discharge med queue", "Pharmacy coordinator", `${m.pharmacyDischargeMedBacklog} packs pending`, statusFromValue(m.pharmacyDischargeMedBacklog, 22, 36), "Queue visible within 10m"),
      stage("pharm-verify", "Medication review", "Pharmacist", `${m.pharmacyMedianDelayMinutes}m median delay`, statusFromValue(m.pharmacyMedianDelayMinutes, 60, 95), "No medication decisions by Coordina"),
      stage("pharm-pack", "Pack preparation", "Pharmacy technician", "Preparation queue coupled to discharge timing", statusFromValue(m.pharmacyDischargeMedBacklog, 22, 36), "Local target under 60m"),
      stage("pharm-handover", "Handover to ward", "Ward nurse", `${m.dischargeReadyBlocked} downstream blocked`, statusFromValue(m.dischargeReadyBlocked, 12, 24), "Coordinate with pickup window"),
    ],
    discharge: [
      stage("dc-ready", "Discharge-ready flag", "Ward team", `${m.dischargeReadyBlocked} ready but blocked`, statusFromValue(m.dischargeReadyBlocked, 12, 24), "Readiness stays human-owned"),
      stage("dc-paperwork", "Paperwork", "Case manager", `${m.paperworkPending} paperwork tasks`, statusFromValue(m.paperworkPending, 7, 14), "Non-clinical coordination only"),
      stage("dc-signatures", "Pending signatures", "Ward team", `${m.pendingSignatures} pending signatures`, statusFromValue(m.pendingSignatures, 5, 10), "Review by responsible team"),
      stage("dc-pickup", "Pickup readiness", "Case manager", `${m.familyPickupDelays} pickup delays`, statusFromValue(m.familyPickupDelays, 7, 14), "Confirm expected pickup time"),
    ],
    transport: [
      stage("tx-porter", "Porter availability", "Operations supervisor", `${m.porterTeamsAvailable} porter teams available`, statusFromValue(5 - m.porterTeamsAvailable, 1, 3), "Match capacity to movement queue"),
      stage("tx-transfers", "Delayed transfers", "Porter team", `${m.delayedTransfers} delayed transfers`, statusFromValue(m.delayedTransfers, 6, 12), "Ready-to-move queue reviewed"),
      stage("tx-pickup", "Pickup coordination", "Case manager", `${m.familyPickupDelays} pickup delays`, statusFromValue(m.familyPickupDelays, 7, 14), "Coordinate before bed-release plan"),
      stage("tx-queue", "Movement queue", "Operations supervisor", `${m.transportQueueLength} total queue length`, statusFromValue(m.transportQueueLength, 9, 18), "Prioritize after human review"),
    ],
    radiology: [
      stage("rad-ct", "CT queue", "Radiology lead", `${m.radiologyCtQueue} waiting`, statusFromValue(m.radiologyCtQueue, 10, 20), "Review material impact"),
      stage("rad-xray", "X-ray queue", "Radiology coordinator", `${m.radiologyXrayQueue} waiting`, statusFromValue(m.radiologyXrayQueue, 16, 28), "Monitor demand"),
      stage("rad-us", "Ultrasound queue", "Radiology coordinator", `${m.radiologyUltrasoundQueue} waiting`, statusFromValue(m.radiologyUltrasoundQueue, 7, 12), "Monitor demand"),
      stage("rad-report", "Report turnaround", "Radiology lead", `${m.radiologyReportTurnaroundMinutes}m turnaround`, statusFromValue(m.radiologyReportTurnaroundMinutes, 60, 95), "Report timing watched"),
    ],
  };
  return flows[department];
}

function stage(id: string, name: string, ownerRole: string, signal: string, status: string, timeTarget: string) {
  return { id, name, ownerRole, signal, status, timeTarget };
}

function statusFromValue(value: number, warning: number, critical: number) {
  if (value >= critical) return "Blocked";
  if (value >= warning) return "Rising";
  return "Stable";
}

function structureNotesFor(department: DepartmentId) {
  const notes: Record<DepartmentId, string[]> = {
    ed: [
      "Triage remains clinically human-owned; Coordina only summarizes operational pressure.",
      "Respiratory-like arrivals increase ED pressure, but boarders show downstream flow loss.",
      "The main split to watch is new arrivals versus admitted boarders waiting to move.",
    ],
    beds: [
      "Usable beds matter more than nominal bed count.",
      "Assigned-not-ready beds connect ward turnover directly to ED boarding.",
      "Cleaning, discharge readiness, and nursing confirmation are separate operational gates.",
    ],
    pharmacy: [
      "The relevant queue is discharge medication readiness, not prescribing decisions.",
      "Medication pack timing can delay bed release after clinical discharge readiness.",
      "Coordina suggests queue review only; it does not alter medications.",
    ],
    discharge: [
      "The page separates clinical discharge readiness from non-clinical blockers.",
      "Pickup readiness, paperwork, caregiver instruction, and signatures are distinct flows.",
      "Resolving non-clinical blockers can release beds without making clinical decisions.",
    ],
    transport: [
      "Transport can become a final blocker after a patient is otherwise ready to move.",
      "Porter availability and family pickup are related but separate queues.",
      "Coordina recommends review, not movement orders.",
    ],
    radiology: [
      "Radiology can amplify ED pressure but may remain secondary to bed turnover.",
      "The page separates CT, X-ray, ultrasound, and report turnaround.",
      "Coordina reports operational queue impact only.",
    ],
  };
  return notes[department];
}

function departmentSummaryFor(state: SimulationState, department: DepartmentId) {
  const m = state.metrics;
  const summaries: Record<DepartmentId, string> = {
    ed: `${m.edArrivalsPerInterval} arrivals this interval with ${m.edBoarders} ED boarders; output pressure is downstream-sensitive.`,
    beds: `${m.wardOccupancyPercent}% occupancy with ${m.assignedNotReadyBeds} assigned-not-ready beds and ${m.dirtyBeds} dirty beds.`,
    pharmacy: `${m.pharmacyDischargeMedBacklog} discharge medication packs are pending with ${m.pharmacyMedianDelayMinutes}m median delay.`,
    discharge: `${m.dischargeReadyBlocked} discharge-ready patients are blocked by paperwork, signatures, pickup, or handoff timing.`,
    transport: `${m.delayedTransfers} delayed transfers and ${m.transportQueueLength} total movement requests are waiting.`,
    radiology: `${m.radiologyCtQueue} CT, ${m.radiologyXrayQueue} X-ray, and ${m.radiologyUltrasoundQueue} ultrasound requests are queued.`,
  };
  return summaries[department];
}

function departmentProblemFor(state: SimulationState, department: DepartmentId) {
  const m = state.metrics;
  const problems: Record<DepartmentId, string> = {
    ed: `ED pressure is rising from arrivals above baseline, but admitted boarders account for much of the lost time.`,
    beds: `Ward capacity is constrained by actual readiness: ${m.assignedNotReadyBeds} assigned beds cannot receive patients yet.`,
    pharmacy: `Discharge medication queue length is delaying patients who may otherwise be ready to leave after human review.`,
    discharge: `Non-clinical discharge blockers are delaying bed release and increasing downstream ED boarding.`,
    transport: `Transport has become a final conversion point for ready-to-move or ready-to-leave patients.`,
    radiology: `Radiology demand is elevated, but the patient count is still smaller than bed and discharge delays.`,
  };
  return problems[department];
}

function departmentWhyFor(state: SimulationState, department: DepartmentId) {
  const why: Record<DepartmentId, string> = {
    ed: "ED is where the pressure is visible, but the fastest relief often depends on downstream teams converting readiness into movement.",
    beds: "Beds connect discharge completion to ED output; small turnover gains can unlock several queues.",
    pharmacy: "Medication readiness can convert discharge-ready patients into available beds, reducing boarding pressure.",
    discharge: "Discharge coordination releases capacity without asking Coordina to make any clinical discharge decision.",
    transport: "Transport can prevent otherwise-ready beds and transfers from becoming real movement.",
    radiology: "Radiology stays monitored because imaging queues can amplify ED pressure, even when not primary.",
  };
  return why[department];
}

function localEvidenceFor(state: SimulationState, department: DepartmentId) {
  return localMetricsFor(state, department).slice(0, 4);
}

function roleForDepartment(department: DepartmentId, primary: DepartmentId, score: number): BottleneckRole {
  if (department === primary || score >= 72) return "primary contributor";
  if (score >= 48) return "secondary contributor";
  return "monitored only";
}

function relatedDepartmentsFor(department: DepartmentId, involved: string[]) {
  const relationMap: Record<DepartmentId, string[]> = {
    ed: ["Beds", "Discharge", "Transport"],
    beds: ["ED", "Discharge", "Pharmacy", "Transport"],
    pharmacy: ["Discharge", "Beds", "ED"],
    discharge: ["Pharmacy", "Beds", "Transport"],
    transport: ["Discharge", "ED", "Beds"],
    radiology: ["ED", "Beds"],
  };
  return Array.from(new Set([...relationMap[department], ...involved])).filter((item) => item !== departmentNames[department]);
}

function affectedPatientsFor(state: SimulationState, department: DepartmentId) {
  const m = state.metrics;
  const affected: Record<DepartmentId, number> = {
    ed: m.edWaitingHighAcuity + m.edWaitingMediumAcuity + m.edWaitingLowAcuity,
    beds: m.assignedNotReadyBeds + m.dirtyBeds + m.edBoarders,
    pharmacy: m.pharmacyDischargeMedBacklog,
    discharge: m.dischargeReadyBlocked + m.familyPickupDelays,
    transport: m.delayedTransfers + m.transportQueueLength,
    radiology: m.radiologyCtQueue + m.radiologyXrayQueue + m.radiologyUltrasoundQueue,
  };
  return affected[department];
}

function sparklineFor(state: SimulationState, department: DepartmentId) {
  const base = Math.max(5, state.departments[department].bottleneckScore);
  return Array.from({ length: 9 }, (_, index) => Math.max(1, Math.round(base - (8 - index) * 2 + Math.sin(index + state.tick) * 3)));
}

function statusFromScore(score: number) {
  if (score >= 82) return "Escalation review";
  if (score >= 66) return "High";
  if (score >= 48) return "Moderate";
  return "Monitored";
}

function toneFromScore(score: number): Tone {
  if (score >= 82) return "critical";
  if (score >= 66) return "high";
  if (score >= 48) return "warning";
  return "stable";
}

function severityFromScore(score: number, anomalyScore: number): InsightSeverity {
  if (score >= 86 || anomalyScore >= 0.82) return "critical";
  if (score >= 68 || anomalyScore >= 0.68) return "high";
  if (score >= 48) return "moderate";
  return "low";
}

function notificationSeverity(severity: SimulationEvent["severity"] | AnomalyResponse["severity"]): NotificationSeverity {
  if (severity === "escalation") return "Escalation";
  if (severity === "warning") return "Important";
  return "Passive";
}

function eventTypeFromSimulation(event: SimulationEvent): NotificationItem["type"] {
  if (event.type === "primary bottleneck changed") return "bottleneck changed";
  if (event.type === "respiratory arrivals above baseline") return "anomaly detected";
  if (event.type === "issue improving") return "issue improving";
  if (event.type === "brief may be outdated") return "brief review prompt";
  return "issue worsening";
}

function confidenceFromScore(score: number): ConfidenceLabel {
  if (score >= 68) return "High confidence";
  if (score >= 42) return "Moderate confidence";
  return "Limited confidence";
}

function confidenceScore(confidence: ConfidenceLabel) {
  if (confidence === "High confidence") return 0.88;
  if (confidence === "Moderate confidence") return 0.72;
  return 0.56;
}

function ownerDepartment(ownerRole: string, fallback: DepartmentId): DepartmentId {
  const lower = ownerRole.toLowerCase();
  if (lower.includes("pharmacy")) return "pharmacy";
  if (lower.includes("bed")) return "beds";
  if (lower.includes("transport") || lower.includes("operations") || lower.includes("porter")) return "transport";
  if (lower.includes("case") || lower.includes("discharge")) return "discharge";
  if (lower.includes("radiology")) return "radiology";
  if (lower.includes("ed")) return "ed";
  return fallback;
}

function sanitizeOperationalText(value: string) {
  return value
    .replace(/pandemic detected/gi, "unusual operational pattern")
    .replace(/outbreak confirmed/gi, "unusual operational pattern")
    .replace(/diagnosis inferred/gi, "operational pattern noted")
    .replace(/disease identified/gi, "operational pattern noted")
    .replace(/COVID-19 diagnosis/gi, "respiratory-surge scenario");
}
