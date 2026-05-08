import type { DepartmentId, InsightSeverity, TrendDirection } from "../../types";
import { defaultScenarioId, getScenarioPreset } from "./scenarios";
import type {
  DepartmentState,
  SimulationEvent,
  SimulationMetrics,
  SimulationScenarioId,
  SimulationSpeed,
  SimulationState,
} from "./types";

const departmentIds: DepartmentId[] = ["ed", "beds", "pharmacy", "discharge", "transport", "radiology"];

export function createInitialSimulationState(scenarioId: SimulationScenarioId = defaultScenarioId): SimulationState {
  return buildState({
    elapsedMinutes: 150,
    tick: 0,
    scenarioId,
    previousPrimaryBottleneck: undefined,
    previousEvents: [],
  });
}

export function resetSimulationState(scenarioId: SimulationScenarioId): SimulationState {
  return buildState({
    elapsedMinutes: 120,
    tick: 0,
    scenarioId,
    previousPrimaryBottleneck: undefined,
    previousEvents: [],
  });
}

export function advanceSimulationState(state: SimulationState, speed: SimulationSpeed): SimulationState {
  return buildState({
    elapsedMinutes: state.elapsedMinutes + 5 * speed,
    tick: state.tick + 1,
    scenarioId: state.scenario,
    previousPrimaryBottleneck: state.primaryBottleneck,
    previousPrimaryScore: state.primaryBottleneckScore,
    previousEvents: state.events,
  });
}

interface BuildStateArgs {
  elapsedMinutes: number;
  tick: number;
  scenarioId: SimulationScenarioId;
  previousPrimaryBottleneck?: DepartmentId;
  previousPrimaryScore?: number;
  previousEvents: SimulationEvent[];
}

function buildState({
  elapsedMinutes,
  tick,
  scenarioId,
  previousPrimaryBottleneck,
  previousPrimaryScore,
  previousEvents,
}: BuildStateArgs): SimulationState {
  const scenario = getScenarioPreset(scenarioId);
  const progress = clamp(elapsedMinutes / 270, 0, 1);
  const wave = boundedWave(tick, scenario.surgePressure);
  const recovery = scenario.recoveryBias * progress;
  const surgeCurve = smoothstep(progress) * scenario.surgePressure;
  const respiratoryRatio = clamp(
    scenario.respiratoryRatio + surgeCurve * 0.18 + wave * 0.015 - recovery * 0.08,
    0.12,
    0.62,
  );
  const arrivals = Math.round(
    scenario.arrivalRate + scenario.arrivalRate * surgeCurve * 0.36 + wave * 3 - recovery * 8,
  );
  const triageImmediate = clampRound(2 + surgeCurve * 3 + scenario.transportDelayPressure, 1, 9);
  const triageUrgent = clampRound(arrivals * (0.28 + respiratoryRatio * 0.18), 6, 32);
  const triageStandard = Math.max(arrivals - triageImmediate - triageUrgent, 6);

  const pharmacyBacklog = clampRound(
    14 + scenario.pharmacyBacklogPressure * 24 + surgeCurve * 8 + boundedWave(tick + 2, 0.7) * 3 - recovery * 9,
    8,
    58,
  );
  const dischargeReadyBlocked = clampRound(
    6 + scenario.dischargeBlockerPressure * 18 + pharmacyBacklog * 0.12 + scenario.transportDelayPressure * 5 - recovery * 8,
    3,
    42,
  );
  const dirtyBeds = clampRound(
    3 + scenario.dischargeBlockerPressure * 8 + (1 - scenario.bedTurnoverSpeed) * 10 + boundedWave(tick + 1, 0.6) * 2,
    1,
    22,
  );
  const assignedNotReadyBeds = clampRound(
    2 + dirtyBeds * 0.55 + dischargeReadyBlocked * 0.16 + scenario.transportDelayPressure * 3,
    1,
    20,
  );
  const wardOccupancy = clampRound(
    84 + scenario.dischargeBlockerPressure * 9 + surgeCurve * 5 + assignedNotReadyBeds * 0.6 - recovery * 8,
    76,
    99,
  );
  const availableBeds = clampRound(28 - wardOccupancy * 0.2 - assignedNotReadyBeds * 0.7 + recovery * 8, 1, 24);
  const porterTeams = clampRound(5 - scenario.transportDelayPressure * 3 + recovery * 2 - surgeCurve, 1, 6);
  const delayedTransfers = clampRound(
    2 + scenario.transportDelayPressure * 11 + assignedNotReadyBeds * 0.25 + boundedWave(tick + 5, 0.8) * 2 - recovery * 6,
    0,
    24,
  );
  const familyPickupDelays = clampRound(
    3 + scenario.dischargeBlockerPressure * 8 + scenario.transportDelayPressure * 4 - recovery * 5,
    0,
    22,
  );
  const edBoarders = clampRound(
    8 + surgeCurve * 10 + assignedNotReadyBeds * 0.55 + dischargeReadyBlocked * 0.34 + delayedTransfers * 0.3 - availableBeds * 0.25,
    3,
    34,
  );
  const radiologyCtQueue = clampRound(5 + scenario.radiologyPressure * 10 + respiratoryRatio * 8 + surgeCurve * 3, 2, 28);
  const radiologyXrayQueue = clampRound(8 + scenario.radiologyPressure * 12 + respiratoryRatio * 10, 3, 34);
  const radiologyUltrasoundQueue = clampRound(3 + scenario.radiologyPressure * 5, 1, 14);
  const anomalyScore = clamp(
    0.22 + surgeCurve * 0.46 + Math.max(0, respiratoryRatio - 0.28) * 0.9 + scenario.transportDelayPressure * 0.08,
    0.08,
    0.96,
  );
  const overallTimeLoss = clampRound(
    edBoarders * 28 +
      assignedNotReadyBeds * 22 +
      pharmacyBacklog * 7 +
      dischargeReadyBlocked * 12 +
      delayedTransfers * 11 +
      radiologyCtQueue * 4,
    140,
    1800,
  );

  const metrics: SimulationMetrics = {
    edArrivalsPerInterval: arrivals,
    respiratoryLikeArrivalRatio: respiratoryRatio,
    triageImmediate,
    triageUrgent,
    triageStandard,
    edWaitingHighAcuity: clampRound(triageImmediate + surgeCurve * 3, 1, 14),
    edWaitingMediumAcuity: clampRound(triageUrgent + edBoarders * 0.45, 8, 48),
    edWaitingLowAcuity: clampRound(triageStandard + surgeCurve * 10, 8, 64),
    edBoarders,
    consultDelayMinutes: clampRound(24 + surgeCurve * 32 + respiratoryRatio * 30, 12, 90),
    admissionWaitMinutes: clampRound(48 + edBoarders * 7 + assignedNotReadyBeds * 5, 35, 260),
    wardOccupancyPercent: wardOccupancy,
    availableBeds,
    dirtyBeds,
    assignedNotReadyBeds,
    expectedDischarges: clampRound(16 + recovery * 10 - scenario.dischargeBlockerPressure * 4, 8, 32),
    pharmacyDischargeMedBacklog: pharmacyBacklog,
    pharmacyMedianDelayMinutes: clampRound(42 + pharmacyBacklog * 1.8, 28, 150),
    dischargeReadyBlocked,
    paperworkPending: clampRound(4 + dischargeReadyBlocked * 0.55, 1, 24),
    pendingSignatures: clampRound(2 + dischargeReadyBlocked * 0.34, 0, 16),
    familyPickupDelays,
    delayedTransfers,
    porterTeamsAvailable: porterTeams,
    transportQueueLength: clampRound(delayedTransfers + familyPickupDelays * 0.45, 1, 34),
    radiologyCtQueue,
    radiologyXrayQueue,
    radiologyUltrasoundQueue,
    radiologyReportTurnaroundMinutes: clampRound(38 + scenario.radiologyPressure * 36 + surgeCurve * 14, 24, 116),
    anomalyScore,
    overallTimeLossMinutes: overallTimeLoss,
  };

  const departments = buildDepartmentStates(metrics, scenarioId, tick);
  const scored = departmentIds
    .map((department) => ({ department, score: departments[department].bottleneckScore }))
    .sort((a, b) => b.score - a.score);
  const top = scored[0]!;
  const previousScore = previousPrimaryBottleneck
    ? departments[previousPrimaryBottleneck].bottleneckScore
    : previousPrimaryScore ?? top.score;
  const challengerMaterial = !previousPrimaryBottleneck || top.score > previousScore + 10;
  const primaryBottleneck = challengerMaterial ? top.department : previousPrimaryBottleneck;
  const primaryBottleneckScore = departments[primaryBottleneck].bottleneckScore;
  const materialChange =
    Boolean(previousPrimaryBottleneck && primaryBottleneck !== previousPrimaryBottleneck) ||
    (tick > 0 && anomalyScore >= 0.72 && anomalyScore - (previousEvents[0]?.severity === "escalation" ? 0.72 : 0.58) > 0.08);
  const events = buildEvents({
    tick,
    simulatedTime: timeFromMinutes(elapsedMinutes),
    metrics,
    primaryBottleneck,
    previousPrimaryBottleneck,
    materialChange,
    previousEvents,
  });
  const centralTrend = trendFromScore(primaryBottleneckScore, 58, 78);

  return {
    tick,
    simulatedTime: timeFromMinutes(elapsedMinutes),
    elapsedMinutes,
    scenario: scenarioId,
    departments,
    metrics,
    events,
    alerts: events.filter((event) => event.severity !== "info").slice(0, 5),
    anomalyScore,
    primaryBottleneck,
    primaryBottleneckScore,
    centralTrend,
    severity: severityFromScore(primaryBottleneckScore, anomalyScore),
    materialChange,
    previousPrimaryBottleneck,
    changedSincePrevious: changedSincePreviousCopy(primaryBottleneck, previousPrimaryBottleneck, metrics),
    lastUpdatedAt: timeFromMinutes(elapsedMinutes),
  };
}

function buildDepartmentStates(
  metrics: SimulationMetrics,
  scenarioId: SimulationScenarioId,
  tick: number,
): Record<DepartmentId, DepartmentState> {
  const simulatedTime = timeFromMinutes(120 + tick * 5);
  const edScore = clampScore(
    metrics.edBoarders * 2.2 +
      metrics.edArrivalsPerInterval * 0.45 +
      metrics.edWaitingMediumAcuity * 0.55 +
      metrics.anomalyScore * 18,
  );
  const bedsScore = clampScore(
    (metrics.wardOccupancyPercent - 72) * 1.3 +
      metrics.assignedNotReadyBeds * 4.2 +
      metrics.dirtyBeds * 2.8 -
      metrics.availableBeds * 0.9,
  );
  const pharmacyScore = clampScore(metrics.pharmacyDischargeMedBacklog * 1.45 + metrics.pharmacyMedianDelayMinutes * 0.34);
  const dischargeScore = clampScore(
    metrics.dischargeReadyBlocked * 2.2 + metrics.familyPickupDelays * 2.4 + metrics.paperworkPending * 1.3,
  );
  const transportScore = clampScore(
    metrics.delayedTransfers * 3.4 + metrics.transportQueueLength * 2.4 - metrics.porterTeamsAvailable * 2.5,
  );
  const radiologyScore = clampScore(
    metrics.radiologyCtQueue * 1.4 +
      metrics.radiologyXrayQueue * 0.65 +
      metrics.radiologyReportTurnaroundMinutes * 0.28,
  );

  return {
    ed: departmentState("ed", edScore, metrics.edBoarders * 24 + metrics.edWaitingMediumAcuity * 7, simulatedTime),
    beds: departmentState("beds", bedsScore, metrics.assignedNotReadyBeds * 34 + metrics.dirtyBeds * 18, simulatedTime),
    pharmacy: departmentState("pharmacy", pharmacyScore, metrics.pharmacyDischargeMedBacklog * 8, simulatedTime),
    discharge: departmentState(
      "discharge",
      dischargeScore,
      metrics.dischargeReadyBlocked * 12 + metrics.familyPickupDelays * 8,
      simulatedTime,
    ),
    transport: departmentState(
      "transport",
      transportScore,
      metrics.delayedTransfers * 15 + metrics.transportQueueLength * 6,
      simulatedTime,
    ),
    radiology: departmentState("radiology", radiologyScore, metrics.radiologyCtQueue * 6, simulatedTime),
  };
}

function departmentState(
  department: DepartmentId,
  bottleneckScore: number,
  estimatedTimeLostMinutes: number,
  lastUpdatedAt: string,
): DepartmentState {
  return {
    department,
    metrics: {},
    bottleneckScore: Math.round(bottleneckScore),
    estimatedTimeLostMinutes: Math.round(estimatedTimeLostMinutes),
    trend: trendFromScore(bottleneckScore, 44, 68),
    lastUpdatedAt,
  };
}

function buildEvents({
  tick,
  simulatedTime,
  metrics,
  primaryBottleneck,
  previousPrimaryBottleneck,
  materialChange,
  previousEvents,
}: {
  tick: number;
  simulatedTime: string;
  metrics: SimulationMetrics;
  primaryBottleneck: DepartmentId;
  previousPrimaryBottleneck?: DepartmentId;
  materialChange: boolean;
  previousEvents: SimulationEvent[];
}) {
  const nextEvents: SimulationEvent[] = [];

  if (materialChange && previousPrimaryBottleneck && primaryBottleneck !== previousPrimaryBottleneck) {
    nextEvents.push(event(tick, simulatedTime, "primary bottleneck changed", "warning", "Primary bottleneck changed", `Primary bottleneck shifted from ${labelDepartment(previousPrimaryBottleneck)} to ${labelDepartment(primaryBottleneck)} after downstream scores separated materially.`, primaryBottleneck));
  } else {
    nextEvents.push(event(tick, simulatedTime, "primary bottleneck changed", "info", "Primary bottleneck unchanged", `Primary bottleneck remains ${labelDepartment(primaryBottleneck)}; smaller metric movement was kept in the change log.`, primaryBottleneck));
  }

  if (metrics.respiratoryLikeArrivalRatio >= 0.42) {
    nextEvents.push(event(tick, simulatedTime, "respiratory arrivals above baseline", metrics.anomalyScore >= 0.72 ? "escalation" : "warning", "Respiratory arrivals above baseline", `Respiratory-like arrivals are ${Math.round(metrics.respiratoryLikeArrivalRatio * 100)}% of arrivals. Review suggested; no diagnosis is inferred.`, "ed"));
  }

  if (metrics.pharmacyDischargeMedBacklog >= 34) {
    nextEvents.push(event(tick, simulatedTime, "pharmacy backlog rising", "warning", "Pharmacy backlog rising", `${metrics.pharmacyDischargeMedBacklog} discharge medication packs are pending and may delay bed release.`, "pharmacy"));
  }

  if (metrics.assignedNotReadyBeds >= 8 || metrics.dirtyBeds >= 10) {
    nextEvents.push(event(tick, simulatedTime, "ward turnover worsening", "warning", "Ward turnover worsening", `${metrics.assignedNotReadyBeds} assigned beds are not ready and ${metrics.dirtyBeds} beds are dirty.`, "beds"));
  }

  if (metrics.delayedTransfers >= 10) {
    nextEvents.push(event(tick, simulatedTime, "transport delay", "warning", "Transport delays affecting ready patients", `${metrics.delayedTransfers} transfers are delayed with ${metrics.porterTeamsAvailable} porter teams available.`, "transport"));
  }

  return [...nextEvents, ...previousEvents].slice(0, 10);
}

function event(
  tick: number,
  timestamp: string,
  type: SimulationEvent["type"],
  severity: SimulationEvent["severity"],
  title: string,
  message: string,
  relatedDepartment?: DepartmentId,
): SimulationEvent {
  return {
    id: `${tick}-${type}-${relatedDepartment ?? "central"}`,
    timestamp,
    type,
    severity,
    title,
    message,
    relatedDepartment,
  };
}

function changedSincePreviousCopy(
  primary: DepartmentId,
  previous: DepartmentId | undefined,
  metrics: SimulationMetrics,
) {
  if (!previous || previous === primary) {
    return `Primary bottleneck unchanged; respiratory-like arrivals are ${Math.round(metrics.respiratoryLikeArrivalRatio * 100)}% and confidence updates stay in the change log.`;
  }

  return `Primary bottleneck shifted from ${labelDepartment(previous)} to ${labelDepartment(primary)} after a material downstream score change.`;
}

function timeFromMinutes(minutes: number) {
  const base = 8 * 60;
  const total = base + minutes;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = ((hours + 11) % 12) + 1;
  return `${displayHour}:${String(mins).padStart(2, "0")} ${suffix}`;
}

function boundedWave(tick: number, intensity: number) {
  return Math.sin(tick * 0.72 + intensity * 1.7) * intensity;
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

function trendFromScore(score: number, stableThreshold: number, worseningThreshold: number): TrendDirection {
  if (score >= worseningThreshold) {
    return "worsening";
  }

  if (score <= stableThreshold) {
    return "improving";
  }

  return "stable";
}

function severityFromScore(score: number, anomalyScore: number): InsightSeverity {
  if (score >= 86 || anomalyScore >= 0.82) {
    return "critical";
  }

  if (score >= 68 || anomalyScore >= 0.68) {
    return "high";
  }

  if (score >= 48) {
    return "moderate";
  }

  return "low";
}

function labelDepartment(department: DepartmentId) {
  const labels: Record<DepartmentId, string> = {
    ed: "ED",
    beds: "Beds",
    pharmacy: "Pharmacy",
    discharge: "Discharge",
    transport: "Transport",
    radiology: "Radiology",
  };
  return labels[department];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampRound(value: number, min: number, max: number) {
  return Math.round(clamp(value, min, max));
}

function clampScore(value: number) {
  return clamp(value, 4, 100);
}

