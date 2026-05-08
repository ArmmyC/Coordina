const safetyNote =
  "Coordina provides coordination support only. No clinical decisions are made by Coordina; humans review and act.";

const departmentLabels = {
  ed: "ED",
  beds: "Beds",
  pharmacy: "Pharmacy",
  discharge: "Discharge",
  transport: "Transport",
  radiology: "Radiology",
};

export function fallbackCentralInsight(state) {
  const m = state.metrics ?? {};
  const primary = state.primaryBottleneck ?? "ed";
  const label = departmentLabels[primary] ?? "ED";

  return sanitize({
    title: `${label} is the primary operational bottleneck in the respiratory-surge scenario`,
    visibleProblem: `Hospital flow is under pressure at ${state.simulatedTime ?? "the current simulated time"}, with ED waiting and boarding elevated.`,
    naiveExplanation: "The obvious explanation is arrivals above baseline.",
    actualInsight:
      `The arrival pattern matters, but the deeper operational issue is downstream conversion: ${m.edBoarders ?? "several"} ED boarders, ${m.assignedNotReadyBeds ?? "some"} assigned-not-ready beds, ${m.pharmacyDischargeMedBacklog ?? "a"} discharge medication queue, and ${m.delayedTransfers ?? "some"} delayed transfers are interacting.`,
    supportingEvidence: [
      `${m.edArrivalsPerInterval ?? "Elevated"} arrivals this interval`,
      `${Math.round((m.respiratoryLikeArrivalRatio ?? 0.36) * 100)}% respiratory-like arrival ratio`,
      `${m.edBoarders ?? "Several"} ED boarders`,
      `${m.assignedNotReadyBeds ?? "Some"} assigned-not-ready beds`,
      `${m.pharmacyDischargeMedBacklog ?? "A"} discharge medication backlog`,
    ],
    departmentsInvolved: ["ED", "Beds", "Pharmacy", "Discharge", "Transport"],
    suggestedActions: [
      action("Review ED respiratory-surge flow and boarders", "ED lead", "High", m.edBoarders ?? 12, 120),
      action("Prioritize assigned bed turnover readiness", "Bed manager", "High", m.assignedNotReadyBeds ?? 6, 100),
      action("Review discharge medication queue", "Pharmacy coordinator", "High", m.pharmacyDischargeMedBacklog ?? 24, 90),
      action("Review porter and pickup final blockers", "Operations supervisor", "Medium", m.delayedTransfers ?? 8, 60),
    ],
    confidence: "Moderate confidence",
    uncertainty: "Fallback narrative used because OpenAI generation was unavailable. Human review remains required.",
    trend: state.centralTrend ?? "worsening",
    severity: state.severity ?? "high",
    changedSincePrevious: state.changedSincePrevious ?? "Primary bottleneck unchanged; smaller movements remain in the change log.",
  });
}

export function fallbackDepartmentInsight(state, department) {
  const m = state.metrics ?? {};
  const label = departmentLabels[department] ?? department;
  const role = department === state.primaryBottleneck ? "primary contributor" : "secondary contributor";
  const details = {
    ed: [`${m.edArrivalsPerInterval ?? "Elevated"} arrivals`, `${m.edBoarders ?? "Several"} ED boarders`],
    beds: [`${m.wardOccupancyPercent ?? "High"}% occupancy`, `${m.assignedNotReadyBeds ?? "Some"} assigned-not-ready beds`],
    pharmacy: [`${m.pharmacyDischargeMedBacklog ?? "A"} discharge medication packs pending`, `${m.pharmacyMedianDelayMinutes ?? "Elevated"}m median delay`],
    discharge: [`${m.dischargeReadyBlocked ?? "Several"} discharge-ready but blocked`, `${m.familyPickupDelays ?? "Some"} pickup delays`],
    transport: [`${m.delayedTransfers ?? "Some"} delayed transfers`, `${m.porterTeamsAvailable ?? "Limited"} porter teams available`],
    radiology: [`${m.radiologyCtQueue ?? "Some"} CT queue`, `${m.radiologyReportTurnaroundMinutes ?? "Stable"}m report turnaround`],
  }[department] ?? ["Operational pressure visible"];

  return sanitize({
    department,
    summary: `${label} is simulation-driven and currently ${role}.`,
    localProblem: `${label} local flow is affected by ${details.join(" and ")}.`,
    whyItMatters: `${label} contributes to hospital-wide flow by converting local readiness into patient movement or capacity release.`,
    bottleneckRole: role,
    evidence: details,
    trend: state.departments?.[department]?.trend ?? "stable",
    confidence: state.departments?.[department]?.bottleneckScore >= 68 ? "High confidence" : "Moderate confidence",
  });
}

export function fallbackAnomaly(state) {
  const m = state.metrics ?? {};
  const score = state.anomalyScore ?? 0.5;
  return sanitize({
    title: "Unusual respiratory-surge operational pattern",
    severity: score >= 0.72 ? "escalation" : "warning",
    summary: `Respiratory-like arrivals are ${Math.round((m.respiratoryLikeArrivalRatio ?? 0.36) * 100)}% of arrivals, above the simulated baseline. Review suggested.`,
    whyEscalated:
      "The pattern can increase ED waiting, boarders, and downstream capacity pressure. This is an operational escalation only.",
    reviewSuggestedFor: "ED lead and operations supervisor",
    safetyNote,
  });
}

export function fallbackBrief({ state, insight, actions }) {
  return sanitize({
    title: `${state?.simulatedTime ?? "Current"} Hospital Flow Brief`,
    summary:
      insight?.conciseSummary ??
      "Coordina identified a respiratory-surge operational bottleneck with downstream capacity effects.",
    actions: (actions ?? []).map((item) => item.briefText ?? `${item.ownerRole}: ${item.title}`).slice(0, 5),
    safetyNote,
  });
}

function action(title, ownerRole, impact, affectedPatients, estimatedTimeSavedMinutes) {
  return {
    title,
    ownerRole,
    impact,
    affectedPatients,
    estimatedTimeSavedMinutes,
    confidence: "Moderate confidence",
    safetyNote,
    briefText: `${ownerRole}: ${title.toLowerCase()} for human review.`,
  };
}

export function sanitize(value) {
  if (typeof value === "string") {
    return value
      .replace(/pandemic detected/gi, "unusual operational pattern")
      .replace(/outbreak confirmed/gi, "unusual operational pattern")
      .replace(/diagnosis inferred/gi, "operational pattern noted")
      .replace(/disease identified/gi, "operational pattern noted")
      .replace(/COVID-19 diagnosis/gi, "respiratory-surge scenario");
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, sanitize(child)]));
  }

  return value;
}

