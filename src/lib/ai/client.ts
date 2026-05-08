import type { CoordinaInsight, DepartmentId, SuggestedAction } from "../../types";
import type { SimulationState } from "../simulation/types";
import type {
  AiResult,
  AnomalyResponse,
  BriefResponse,
  CentralInsightResponse,
  DepartmentInsightResponse,
} from "./types";

export async function requestCentralInsight(state: SimulationState): Promise<AiResult<CentralInsightResponse> | null> {
  return postAi<CentralInsightResponse>("/api/ai/central-insight", { state });
}

export async function requestDepartmentInsight(
  state: SimulationState,
  department: DepartmentId,
): Promise<AiResult<DepartmentInsightResponse> | null> {
  return postAi<DepartmentInsightResponse>("/api/ai/department-insight", { state, department });
}

export async function requestAnomalyExplanation(state: SimulationState): Promise<AiResult<AnomalyResponse> | null> {
  if (state.anomalyScore < 0.48) {
    return null;
  }

  return postAi<AnomalyResponse>("/api/ai/anomaly", { state });
}

export async function requestBriefText({
  state,
  insight,
  actions,
}: {
  state: SimulationState;
  insight: CoordinaInsight;
  actions: SuggestedAction[];
}): Promise<AiResult<BriefResponse> | null> {
  return postAi<BriefResponse>("/api/ai/brief", { state, insight, actions });
}

async function postAi<T>(url: string, body: unknown): Promise<AiResult<T> | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AiResult<T>;
  } catch {
    return null;
  }
}

