import type { CareFlowInsight, HospitalSnapshot, Insight } from "../types";

export const generatePrimaryInsight = (snapshot: HospitalSnapshot): Insight => snapshot.primaryInsight;

export const generateCareFlowInsight = (snapshot: HospitalSnapshot): CareFlowInsight =>
  generatePrimaryInsight(snapshot);

export const minutesToHuman = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};
