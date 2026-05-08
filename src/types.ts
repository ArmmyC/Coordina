export type Tone =
  | "critical"
  | "high"
  | "warning"
  | "moderate"
  | "stable"
  | "neutral"
  | "ai";

export type ConfidenceLabel = "High confidence" | "Moderate confidence" | "Limited confidence";

export type BottleneckRole = "Primary cause" | "Secondary cause" | "Not main bottleneck";

export type AnomalyLevel = 1 | 2 | 3;

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

export interface DepartmentSignal {
  id: string;
  name: string;
  status: string;
  tone: Tone;
  affectedPatients: number;
  timeLostMinutes: number;
  confidence: ConfidenceLabel;
  confidenceScore: number;
  summary: string;
  localMetrics: string[];
  evidence: string[];
  relatedDepartments: string[];
  bottleneckRole: BottleneckRole;
  sparkline: number[];
}

export interface SuggestedAction {
  id: string;
  title: string;
  ownerRole: string;
  department: string;
  reason: string;
  estimatedTimeSavedMinutes: number;
  affectedPatients: number;
  confidence: ConfidenceLabel;
  evidenceTags: string[];
  uncertainty: string;
  safetyNote: string;
  briefText: string;
}

export interface AnomalyEvent {
  id: string;
  level: AnomalyLevel;
  title: string;
  timestamp: string;
  severity: "Passive" | "Important" | "Escalation";
  anomalyScore: number;
  summary: string;
  reviewerRole: string;
  evidenceTags: string[];
  recommendedAction: string;
  briefText: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  timestamp: string;
  severity: "Passive" | "Important" | "Escalation" | "Update";
  explanation: string;
  actionLabel: string;
  target: "insight" | "anomaly" | "brief";
  reviewed: boolean;
}

export interface HospitalSnapshot {
  hospitalName: string;
  scenarioName: string;
  snapshotTime: string;
  dataLabel: string;
  safetyLabel: string;
  kpis: Kpi[];
  departments: DepartmentSignal[];
  actions: SuggestedAction[];
  anomalies: AnomalyEvent[];
  notifications: NotificationItem[];
}

export interface CareFlowInsight {
  mainBottleneck: string;
  visibleProblem: string;
  naiveExplanation: string;
  careFlowInsight: string;
  whyNaiveIncomplete: string;
  departmentsInvolved: string[];
  supportingEvidence: string[];
  highestLeverageActions: SuggestedAction[];
  causeChain: string[];
  confidence: ConfidenceLabel;
  confidenceScore: number;
  uncertainty: string;
  safetyNote: string;
  conciseSummary: string;
}
