import type {
  ActionImpact,
  BottleneckRole,
  ConfidenceLabel,
  DepartmentId,
  InsightSeverity,
  TrendDirection,
} from "../../types";

export interface AiActionResponse {
  id?: string;
  title: string;
  ownerRole: string;
  impact: ActionImpact;
  affectedPatients: number;
  estimatedTimeSavedMinutes: number;
  confidence: ConfidenceLabel;
  safetyNote: string;
  briefText: string;
}

export interface CentralInsightResponse {
  title: string;
  visibleProblem: string;
  naiveExplanation: string;
  actualInsight: string;
  supportingEvidence: string[];
  departmentsInvolved: string[];
  suggestedActions: AiActionResponse[];
  confidence: ConfidenceLabel;
  uncertainty: string;
  trend: TrendDirection;
  severity: InsightSeverity;
  changedSincePrevious: string;
}

export interface DepartmentInsightResponse {
  department: DepartmentId;
  summary: string;
  localProblem: string;
  whyItMatters: string;
  bottleneckRole: BottleneckRole;
  evidence: string[];
  trend: TrendDirection;
  confidence: ConfidenceLabel;
}

export interface AnomalyResponse {
  title: string;
  severity: "info" | "warning" | "escalation";
  summary: string;
  whyEscalated: string;
  reviewSuggestedFor: string;
  safetyNote: string;
}

export interface BriefResponse {
  title: string;
  summary: string;
  actions: string[];
  safetyNote: string;
}

export type AiSource = "openai" | "server-fallback" | "client-fallback";

export interface AiResult<T> {
  source: AiSource;
  data: T;
  reason?: string;
}

