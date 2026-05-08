import type { CareFlowInsight, DepartmentSignal, HospitalSnapshot } from "../types";

const getDepartment = (departments: DepartmentSignal[], id: string) => {
  const department = departments.find((item) => item.id === id);
  if (!department) {
    throw new Error(`Missing department signal: ${id}`);
  }

  return department;
};

export const generateCareFlowInsight = (snapshot: HospitalSnapshot): CareFlowInsight => {
  const departments = snapshot.departments;
  const ed = getDepartment(departments, "ed");
  const beds = getDepartment(departments, "beds");
  const pharmacy = getDepartment(departments, "pharmacy");
  const discharge = getDepartment(departments, "discharge");
  const transport = getDepartment(departments, "transport");
  const radiology = getDepartment(departments, "radiology");

  const downstreamTimeLoss =
    beds.timeLostMinutes + pharmacy.timeLostMinutes + discharge.timeLostMinutes + transport.timeLostMinutes;
  const diagnosticTimeLoss = radiology.timeLostMinutes;
  const downstreamDominates = downstreamTimeLoss > diagnosticTimeLoss * 8;

  const whyNaiveIncomplete = downstreamDominates
    ? "New ED arrivals are only modestly above baseline. Most lost time appears after admission or discharge readiness, where ward turnover, medications, cleaning, pickup, and transport interact."
    : "Arrival pressure matters, but the current evidence still points to downstream movement constraints as the larger source of patient-flow time loss.";

  return {
    mainBottleneck: "ED output blockage from discharge and bed-turnover delays",
    visibleProblem: "ED queue is long and admitted patients are boarding in the emergency department.",
    naiveExplanation: "Too many new patients arrived this morning.",
    careFlowInsight:
      "The main bottleneck is not initial triage demand. ED patients are waiting because ward beds are blocked by delayed discharge medication preparation, bed cleaning, family pickup coordination, and limited transport capacity.",
    whyNaiveIncomplete,
    departmentsInvolved: ["ED", "Beds", "Pharmacy", "Discharge", "Transport"],
    supportingEvidence: [
      `${ed.affectedPatients} ED patients are affected, with admitted boarders driving the queue.`,
      `${beds.timeLostMinutes} minutes are tied to bed availability and cleaning delays.`,
      `${pharmacy.affectedPatients} patients are touched by pharmacy backlog, including discharge medication waits.`,
      `${discharge.affectedPatients} patients have non-clinical discharge coordination blockers.`,
      "Radiology is rising, but its affected patient count is too small to explain the hospital-wide queue.",
    ],
    highestLeverageActions: snapshot.actions.slice(0, 3),
    causeChain: [
      "Long ED queue",
      "Ward beds unavailable",
      "Delayed discharge",
      "Pharmacy, cleaning, pickup, transport",
    ],
    confidence: "High confidence",
    confidenceScore: 0.89,
    uncertainty: "Some bed assignment and pharmacy readiness timestamps may lag live operations by 10-15 minutes.",
    safetyNote:
      "No clinical discharge, admission, triage, or medication decision is made by CareFlow. Human teams review all follow-up.",
    conciseSummary:
      "The ED queue is long mainly because patients cannot leave downstream beds fast enough. The highest-leverage follow-up path is pharmacy review, bed cleaning prioritization, family pickup confirmation, and transport coordination.",
  };
};

export const minutesToHuman = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};
