import type { ScenarioPreset, SimulationScenarioId } from "./types";

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: "baseline-monday",
    name: "Baseline Monday pressure",
    description: "Typical busy provincial-hospital morning with mild ED crowding and manageable downstream delays.",
    arrivalRate: 28,
    respiratoryRatio: 0.18,
    surgePressure: 0.15,
    dischargeBlockerPressure: 0.45,
    bedTurnoverSpeed: 0.72,
    transportDelayPressure: 0.35,
    pharmacyBacklogPressure: 0.45,
    radiologyPressure: 0.38,
    recoveryBias: 0.15,
  },
  {
    id: "respiratory-surge",
    name: "Respiratory surge (COVID-like)",
    description: "Synthetic respiratory-surge scenario with arrivals above baseline and downstream coordination stress.",
    arrivalRate: 38,
    respiratoryRatio: 0.36,
    surgePressure: 0.82,
    dischargeBlockerPressure: 0.72,
    bedTurnoverSpeed: 0.46,
    transportDelayPressure: 0.55,
    pharmacyBacklogPressure: 0.72,
    radiologyPressure: 0.58,
    recoveryBias: 0.05,
  },
  {
    id: "transport-bottleneck",
    name: "Severe transport bottleneck",
    description: "Arrival pressure is moderate, but porter availability and pickup coordination create final blockers.",
    arrivalRate: 32,
    respiratoryRatio: 0.22,
    surgePressure: 0.35,
    dischargeBlockerPressure: 0.66,
    bedTurnoverSpeed: 0.54,
    transportDelayPressure: 0.92,
    pharmacyBacklogPressure: 0.48,
    radiologyPressure: 0.44,
    recoveryBias: 0.02,
  },
  {
    id: "recovery-stabilization",
    name: "Recovery / stabilization",
    description: "Surge pressure is easing while discharge and turnover teams recover capacity.",
    arrivalRate: 25,
    respiratoryRatio: 0.2,
    surgePressure: 0.12,
    dischargeBlockerPressure: 0.36,
    bedTurnoverSpeed: 0.86,
    transportDelayPressure: 0.28,
    pharmacyBacklogPressure: 0.34,
    radiologyPressure: 0.3,
    recoveryBias: 0.62,
  },
];

export const defaultScenarioId: SimulationScenarioId = "respiratory-surge";

export function getScenarioPreset(id: SimulationScenarioId) {
  return scenarioPresets.find((scenario) => scenario.id === id) ?? scenarioPresets[1]!;
}

