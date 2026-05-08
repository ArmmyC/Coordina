import type { DepartmentId, InsightSeverity, TrendDirection } from "../../types";

export type SimulationScenarioId =
  | "baseline-monday"
  | "respiratory-surge"
  | "transport-bottleneck"
  | "recovery-stabilization";

export type SimulationSpeed = 1 | 2 | 4;

export type SimulationEventSeverity = "info" | "warning" | "escalation";

export interface ScenarioPreset {
  id: SimulationScenarioId;
  name: string;
  description: string;
  arrivalRate: number;
  respiratoryRatio: number;
  surgePressure: number;
  dischargeBlockerPressure: number;
  bedTurnoverSpeed: number;
  transportDelayPressure: number;
  pharmacyBacklogPressure: number;
  radiologyPressure: number;
  recoveryBias: number;
}

export interface SimulationMetrics {
  edArrivalsPerInterval: number;
  respiratoryLikeArrivalRatio: number;
  triageImmediate: number;
  triageUrgent: number;
  triageStandard: number;
  edWaitingHighAcuity: number;
  edWaitingMediumAcuity: number;
  edWaitingLowAcuity: number;
  edBoarders: number;
  consultDelayMinutes: number;
  admissionWaitMinutes: number;
  wardOccupancyPercent: number;
  availableBeds: number;
  dirtyBeds: number;
  assignedNotReadyBeds: number;
  expectedDischarges: number;
  pharmacyDischargeMedBacklog: number;
  pharmacyMedianDelayMinutes: number;
  dischargeReadyBlocked: number;
  paperworkPending: number;
  pendingSignatures: number;
  familyPickupDelays: number;
  delayedTransfers: number;
  porterTeamsAvailable: number;
  transportQueueLength: number;
  radiologyCtQueue: number;
  radiologyXrayQueue: number;
  radiologyUltrasoundQueue: number;
  radiologyReportTurnaroundMinutes: number;
  anomalyScore: number;
  overallTimeLossMinutes: number;
}

export interface DepartmentState {
  department: DepartmentId;
  metrics: Record<string, number | string>;
  bottleneckScore: number;
  estimatedTimeLostMinutes: number;
  trend: TrendDirection;
  lastUpdatedAt: string;
}

export interface SimulationEvent {
  id: string;
  timestamp: string;
  type:
    | "respiratory arrivals above baseline"
    | "pharmacy backlog rising"
    | "ward turnover worsening"
    | "transport delay"
    | "primary bottleneck changed"
    | "brief may be outdated"
    | "issue improving";
  severity: SimulationEventSeverity;
  title: string;
  message: string;
  relatedDepartment?: DepartmentId;
}

export interface SimulationState {
  tick: number;
  simulatedTime: string;
  elapsedMinutes: number;
  scenario: SimulationScenarioId;
  departments: Record<DepartmentId, DepartmentState>;
  metrics: SimulationMetrics;
  events: SimulationEvent[];
  alerts: SimulationEvent[];
  anomalyScore: number;
  primaryBottleneck: DepartmentId;
  primaryBottleneckScore: number;
  centralTrend: TrendDirection;
  severity: InsightSeverity;
  materialChange: boolean;
  previousPrimaryBottleneck?: DepartmentId;
  changedSincePrevious: string;
  lastUpdatedAt: string;
}

