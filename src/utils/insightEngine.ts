import type { CoordinaInsight, HospitalSnapshot, Insight } from "../types";

export const generatePrimaryInsight = (snapshot: HospitalSnapshot): Insight => snapshot.primaryInsight;

export const generateCoordinaInsight = (snapshot: HospitalSnapshot): CoordinaInsight =>
  generatePrimaryInsight(snapshot);

export const minutesToHuman = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};
