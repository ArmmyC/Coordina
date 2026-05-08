export type Tone =
  | "critical"
  | "high"
  | "warning"
  | "moderate"
  | "stable"
  | "neutral"
  | "ai";

export type ConfidenceLabel = "High confidence" | "Moderate confidence" | "Limited confidence";

export type BottleneckRole = "primary contributor" | "secondary contributor" | "monitored only";

export type DepartmentId = "ed" | "beds" | "pharmacy" | "discharge" | "transport" | "radiology";

export type AnomalyLevel = 1 | 2 | 3;

export type TrendDirection = "worsening" | "stable" | "improving" | "new";

export type InsightSeverity = "low" | "moderate" | "high" | "critical";

export type InsightStatus = "active" | "monitoring" | "superseded" | "resolved";

export type NotificationSeverity = "Passive" | "Important" | "Escalation";

export type NotificationType =
  | "anomaly detected"
  | "bottleneck changed"
  | "confidence changed"
  | "issue improving"
  | "issue worsening"
  | "brief review prompt"
  | "brief-ready recommendation";

export type NotificationTarget = "insight" | "anomaly" | "brief" | "timeline";

export interface LiveOpsStatus {
  mode: "Live" | "Snapshot";
  autoRefreshLabel: string;
  dataFreshnessLabel: string;
  snapshotLabel: string;
  lastRefreshAt: string;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  supportingLine: string;
  status: string;
  trend: string;
  tone: Tone;
  sparkline: number[];
}

export interface DepartmentStatus {
  id: DepartmentId;
  name: string;
  status: string;
  affectedPatients: number;
  estimatedTimeLostMinutes: number;
  summary: string;
  lastUpdatedAt: string;
  bottleneckRole: BottleneckRole;
}

export interface DepartmentSignal extends DepartmentStatus {
  tone: Tone;
  timeLostMinutes: number;
  confidence: ConfidenceLabel;
  confidenceScore: number;
  localProblem: string;
  trend: TrendDirection;
  structureNotes: string[];
  flowStages: DepartmentFlowStage[];
  localMetrics: string[];
  evidence: string[];
  whyItMatters: string;
  relatedDepartments: string[];
  sparkline: number[];
  changeLog: DepartmentChangeLogItem[];
}

export interface DepartmentFlowStage {
  id: string;
  name: string;
  ownerRole: string;
  signal: string;
  status: string;
  timeTarget: string;
}

export interface DepartmentChangeLogItem {
  id: string;
  timestamp: string;
  message: string;
}

export type DepartmentInsight = DepartmentSignal;

export type ActionImpact = "High" | "Medium" | "Low";

export interface SuggestedAction {
  id: string;
  title: string;
  ownerRole: string;
  department: string;
  impact: ActionImpact;
  reason: string;
  estimatedTimeSavedMinutes: number;
  affectedPatients: number;
  confidence: ConfidenceLabel;
  evidenceTags: string[];
  uncertainty: string;
  safetyNote: string;
  briefText: string;
  sourceInsightId?: string;
}

export interface Insight {
  id: string;
  title: string;
  visibleProblem: string;
  naiveExplanation: string;
  actualInsight: string;
  departmentsInvolved: string[];
  evidence: string[];
  suggestedActions: SuggestedAction[];
  confidence: ConfidenceLabel;
  confidenceScore: number;
  uncertainty: string;
  severity: InsightSeverity;
  trend: TrendDirection;
  detectedAt: string;
  lastUpdatedAt: string;
  supersedesInsightId?: string;
  previousInsightId?: string;
  materiallyChanged: boolean;
  status: InsightStatus;
  summary: string;
  causeChain: string[];
  changedSincePreviousInsight: string;
  safetyNote: string;
  whyNaiveIncomplete: string;
  mainBottleneck: string;
  careFlowInsight: string;
  supportingEvidence: string[];
  highestLeverageActions: SuggestedAction[];
  conciseSummary: string;
}

export type CareFlowInsight = Insight;

export interface SecondaryIssue {
  id: string;
  title: string;
  severity: InsightSeverity;
  summary: string;
  affectedPatients: number;
  estimatedTimeLostMinutes: number;
  lastUpdatedAt: string;
  relationToPrimary: BottleneckRole;
  trend: TrendDirection;
}

export interface InsightTimelineEvent {
  id: string;
  timestamp: string;
  eventType: NotificationType;
  severity: NotificationSeverity;
  explanation: string;
  actionLabel?: string;
  relatedInsightId?: string;
}

export interface AnomalyEvent {
  id: string;
  level: AnomalyLevel;
  title: string;
  timestamp: string;
  severity: NotificationSeverity;
  anomalyScore: number;
  summary: string;
  reviewerRole: string;
  evidenceTags: string[];
  recommendedAction: string;
  briefText: string;
  relatedInsightId?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  relatedInsightId?: string;
  relatedDepartment?: DepartmentId;
  actionLabel: string;
  acknowledged: boolean;
  target: NotificationTarget;
  reviewed: boolean;
}

export type NotificationItem = Notification;

export interface HospitalSnapshot {
  hospitalName: string;
  scenarioName: string;
  snapshotTime: string;
  dataLabel: string;
  safetyLabel: string;
  liveOps: LiveOpsStatus;
  kpis: Kpi[];
  departments: DepartmentSignal[];
  actions: SuggestedAction[];
  primaryInsight: Insight;
  secondaryIssues: SecondaryIssue[];
  timeline: InsightTimelineEvent[];
  anomalies: AnomalyEvent[];
  notifications: NotificationItem[];
}

export type BriefReviewStatus = "Draft" | "Saved" | "Review requested" | "Reviewed";

export interface BriefSnapshot {
  id: string;
  title: string;
  createdAt: string;
  sourceInsightId: string;
  sourceInsightUpdatedAt: string;
  sourceInsightTitle: string;
  summary: string;
  rootCauseSummary: string;
  actions: SuggestedAction[];
  safetyNote: string;
  version: number;
  reviewStatus: BriefReviewStatus;
}

export interface BriefHistoryItem {
  id: string;
  itemTitle: string;
  itemType: "Primary insight" | "Follow-up action" | "Anomaly watchout" | "Department finding";
  event: "Added" | "Removed";
  timestamp: string;
  actor: string;
}

export type SentinelId = "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8";

export type SurgeAlertLevel = "green" | "amber" | "red" | "black";

export interface SentinelMetric {
  id: string;
  label: string;
  value: string;
  baseline?: string;
  target?: string;
  tone: Tone;
}

export interface SentinelOutput {
  id: SentinelId;
  name: string;
  shortName: string;
  alertLevel: SurgeAlertLevel;
  tone: Tone;
  confidenceScore: number;
  lastUpdatedAt: string;
  summary: string;
  currentBottleneck: string;
  predictedNextBottleneck: string;
  departmentsInvolved: string[];
  topSignals: string[];
  metrics: SentinelMetric[];
  humanChecks: string[];
  escalationTrigger: string;
  recommendedActions: string[];
}

export interface SurgeForecastPoint {
  day: number;
  respiratoryArrivals: number;
  positivityRate: number;
  covidAdmissions: number;
  covidIcuAdmissions: number;
  staffedBedOccupancy: number;
  criticalCareOccupancy: number;
  oxygenSupportedCensus: number;
  oxygenBurnIndex: number;
  staffAbsenteeism: number;
  n95DaysOnHand: number;
}

export interface OperationalActionPlan {
  id: string;
  sentinelId: SentinelId;
  title: string;
  actions: string[];
  verifyBeforeAction: string;
  responsibleRoles: string[];
  timeWindow: string;
}

export interface ThresholdMatrixRow {
  sentinelId: SentinelId;
  sentinelName: string;
  amber: string;
  red: string;
  black: string;
}

export interface GovernanceBoundary {
  id: string;
  title: string;
  summary: string;
  requiredPractice: string;
}

export interface DirectorBriefing {
  overallLevel: SurgeAlertLevel;
  confidenceScore: number;
  oneLine: string;
  risks: string[];
  reversibleActions: string[];
  seniorAuthorizationOnly: string[];
  mandatoryRecheck: string;
}

export interface SirirajProfile {
  hospitalName: string;
  simulationFrame: string;
  bedCountLabel: string;
  role: string;
  dataStatement: string;
}
