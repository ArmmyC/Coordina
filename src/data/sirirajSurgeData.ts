import type {
  DirectorBriefing,
  GovernanceBoundary,
  OperationalActionPlan,
  SentinelOutput,
  SirirajProfile,
  SurgeForecastPoint,
  SuggestedAction,
  ThresholdMatrixRow,
} from "../types";

export const sirirajProfile: SirirajProfile = {
  hospitalName: "Siriraj Hospital",
  simulationFrame: "Day 21 peak respiratory-surge simulation",
  bedCountLabel: "2,054 active beds in synthetic operations model",
  role: "Super-tertiary academic referral hospital and network coordination hub",
  dataStatement:
    "Synthetic simulation only. No real patient telemetry, diagnosis inference, or autonomous clinical direction is represented.",
};

export const directorBriefing: DirectorBriefing = {
  overallLevel: "red",
  confidenceScore: 0.94,
  oneLine:
    "Siriraj shows a respiratory-surge stress pattern with front-door crowding, diagnostic delay, near-full critical care, isolation pressure, oxygen strain, and staff illness signals.",
  risks: [
    "Critical-care capacity is projected to breach within 18 hours if the current flow pattern holds.",
    "Oxygen reserve is approaching a redline in 3.4 days under the current burn index.",
    "ED boarding and diagnostic delay are interacting, with high-risk oxygen-failure patients waiting across the front door and consult queue.",
    "49 discharge-ready patients are blocked by bed-transfer, medication, transport, and back-referral dependencies.",
    "Two possible nosocomial cluster signals need IPC verification before external communication or irreversible action.",
  ],
  reversibleActions: [
    "Activate the highest surge review tier for the next 24 hours with 4-hourly director review.",
    "Split respiratory and non-respiratory access streams with queue marshals and rapid pre-registration.",
    "Open a discharge command cell focused on ICU stepdown, discharge blockers, and back-transfer packets.",
    "Create a respiratory priority lane for portable CXR, pulmonary or ID consult board review, and pharmacy verification.",
    "Inspect oxygen reserve, isolation workflow, room turnover, and PPE controls with engineering and IPC leads.",
    "Assign a named owner for delayed back-transfer packets and unresolved referral communication.",
  ],
  seniorAuthorizationOnly: [
    "Broad elective cancellation",
    "Critical-care triage policy change",
    "Public outbreak declaration",
    "Automated patient-level prioritization",
  ],
  mandatoryRecheck:
    "Validate bed, oxygen, staffing, IPC, timestamp, and denominator feeds with accountable human leads before any irreversible action.",
};

const surgeSafetyNote =
  "Synthetic coordination support only. Human teams validate data, context, and safety before any operational change.";

export const sirirajSuggestedActions: SuggestedAction[] = [
  {
    id: "siriraj-surge-tier",
    title: "Start highest surge review rhythm",
    ownerRole: "Director and incident command",
    department: "Command",
    impact: "High",
    reason:
      "Five abnormal signal families and a critical-care breach forecast under 24 hours require a stable review cadence.",
    estimatedTimeSavedMinutes: 240,
    affectedPatients: 168,
    confidence: "High confidence",
    evidenceTags: ["T6", "Critical-care forecast", "Cross-process anomaly"],
    uncertainty: "Denominators and timestamps require T7 validation before irreversible action.",
    safetyNote: surgeSafetyNote,
    briefText:
      "Director and incident command: start a 4-hourly highest surge review rhythm for the next 24 hours after feed validation.",
    sourceInsightId: "siriraj-surge-day21",
  },
  {
    id: "siriraj-front-door-split",
    title: "Separate respiratory and non-respiratory access streams",
    ownerRole: "ED head, OPD nursing, registration manager, IPC nurse",
    department: "ED",
    impact: "High",
    reason:
      "Respiratory/PUI arrivals, waiting-area utilization, segregation breaches, and critical waits are all elevated in T1.",
    estimatedTimeSavedMinutes: 180,
    affectedPatients: 140,
    confidence: "High confidence",
    evidenceTags: ["T1", "Above baseline", "Segregation review"],
    uncertainty: "Physical waiting-area observations and timestamp validation are required.",
    safetyNote: surgeSafetyNote,
    briefText:
      "ED, OPD nursing, registration, and IPC: separate respiratory and non-respiratory access streams after confirming waiting-area and timestamp evidence.",
    sourceInsightId: "siriraj-surge-day21",
  },
  {
    id: "siriraj-discharge-command-cell",
    title: "Open discharge command cell",
    ownerRole: "Bed manager, nursing, case management, medical director",
    department: "Beds",
    impact: "High",
    reason:
      "49 discharge-ready patients, 23 pending back-transfers, and 87 ED boarders are interacting with 99% critical-care occupancy.",
    estimatedTimeSavedMinutes: 210,
    affectedPatients: 87,
    confidence: "High confidence",
    evidenceTags: ["T3", "Discharge blockers", "Back-transfer"],
    uncertainty: "Blocked lists and receiving-site acceptance must be validated by human leads.",
    safetyNote: surgeSafetyNote,
    briefText:
      "Bed manager, nursing, case management, and medical director: open a discharge command cell focused on blocked discharges, ICU stepdown, and back-transfer ownership.",
    sourceInsightId: "siriraj-surge-day21",
  },
  {
    id: "siriraj-oxygen-ipc-inspection",
    title: "Inspect oxygen, isolation, PPE, and staff illness signals",
    ownerRole: "IPC, engineering, nursing, supply",
    department: "IPC",
    impact: "High",
    reason:
      "Isolation utilization, oxygen utilization, N95 and gown days on hand, and respiratory-unit absenteeism are converging in T5.",
    estimatedTimeSavedMinutes: 150,
    affectedPatients: 168,
    confidence: "High confidence",
    evidenceTags: ["T5", "Oxygen reserve", "IPC verification"],
    uncertainty: "Two cluster signals require IPC verification before external escalation.",
    safetyNote: surgeSafetyNote,
    briefText:
      "IPC, engineering, nursing, and supply: inspect oxygen reserve, isolation turnover, PPE controls, and staff illness signals before irreversible action.",
    sourceInsightId: "siriraj-surge-day21",
  },
];

export const sirirajSentinels: SentinelOutput[] = [
  {
    id: "T1",
    name: "Access-and-Triage Sentinel",
    shortName: "Access/Triage",
    alertLevel: "red",
    tone: "critical",
    confidenceScore: 0.92,
    lastUpdatedAt: "16:00",
    summary:
      "Respiratory/PUI arrivals are overwhelming the front door while segregation and critical-wait safeguards need immediate human review.",
    currentBottleneck:
      "Registration-to-triage delay and respiratory waiting-area utilization are creating the visible front-door pressure.",
    predictedNextBottleneck:
      "Unsafe arrival sorting if respiratory volume continues and segregation breaches are not corrected.",
    departmentsInvolved: ["ED", "OPD nursing", "Registration", "IPC"],
    topSignals: [
      "Respiratory/PUI ED arrivals reached 140 per day.",
      "Waiting-area utilization is 138%.",
      "Seven segregation breaches were flagged in the current window.",
      "Six critical waits exceeded the 10-minute safety target.",
    ],
    metrics: [
      { id: "t1-triage", label: "Median registration to triage", value: "46m", baseline: "18m baseline", tone: "critical" },
      { id: "t1-arrivals", label: "Respiratory/PUI ED arrivals", value: "140/day", baseline: "Day 0: 35", tone: "high" },
      { id: "t1-waiting", label: "Waiting-area utilization", value: "138%", target: "Below 100%", tone: "critical" },
      { id: "t1-breaches", label: "Segregation breaches", value: "7", target: "0", tone: "critical" },
      { id: "t1-lbt", label: "Left before triage", value: "4.1%", tone: "warning" },
      { id: "t1-critical", label: "Critical waits over 10m", value: "6", target: "0", tone: "critical" },
    ],
    humanChecks: [
      "Confirm physical waiting-area crowding and respiratory/non-respiratory separation.",
      "Validate registration and triage timestamps with ED charge nurse and registration manager.",
      "Review the six critical waits before changing staffing assumptions.",
    ],
    escalationTrigger:
      "Red when critical waits, segregation breaches, or predicted front-door overflow appear in the same window.",
    recommendedActions: [
      "Split respiratory and non-respiratory front ends.",
      "Open surge registration counters and queue marshal coverage.",
      "Use rapid pre-registration for respiratory stream visibility.",
    ],
  },
  {
    id: "T2",
    name: "Consultation-and-Diagnostics Sentinel",
    shortName: "Diagnostics/Consults",
    alertLevel: "red",
    tone: "critical",
    confidenceScore: 0.9,
    lastUpdatedAt: "16:00",
    summary:
      "Portable imaging, CT, consult completion, and pharmacy verification are stretching together, delaying high-risk respiratory decisions.",
    currentBottleneck:
      "Diagnostic and consult queues are compounding front-door boarding for patients who may require oxygen escalation.",
    predictedNextBottleneck:
      "Critical-result and specialist-review delays if radiology and consult board prioritization are not rebalanced.",
    departmentsInvolved: ["Radiology", "Pulmonary", "Infectious Disease", "ICU", "Pharmacy", "ED"],
    topSignals: [
      "Consult completion median is 128 minutes against a 52-minute baseline.",
      "Portable CXR turnaround is 92 minutes against a 38-minute baseline.",
      "CT chest turnaround is 176 minutes against a 64-minute baseline.",
      "17 high-risk oxygen-failure patients need explicit human review.",
    ],
    metrics: [
      { id: "t2-consults", label: "Consult completion", value: "128m", baseline: "52m baseline", tone: "critical" },
      { id: "t2-cxr", label: "Portable CXR turnaround", value: "92m", baseline: "38m baseline", tone: "critical" },
      { id: "t2-ct", label: "CT chest turnaround", value: "176m", baseline: "64m baseline", tone: "critical" },
      { id: "t2-pharmacy", label: "Antiviral pharmacy verification", value: "54m", baseline: "18m baseline", tone: "high" },
      { id: "t2-risk", label: "High-risk oxygen-failure review", value: "17 patients", tone: "critical" },
    ],
    humanChecks: [
      "Review delayed consult list and the 17 high-risk oxygen-failure records with clinical leads.",
      "Confirm radiology queue source timestamps before declaring radiology as the main bottleneck.",
      "Validate pharmacy verification delay as operational timing, not medication decision support.",
    ],
    escalationTrigger:
      "Red when ICU-eligible or time-critical patients are affected by diagnostic and consult delay.",
    recommendedActions: [
      "Create a respiratory priority lane for portable CXR.",
      "Batch pulmonary, ID, and ICU consult board review.",
      "Fast-track pharmacy verification workflow visibility for respiratory surge cases.",
    ],
  },
  {
    id: "T3",
    name: "Bed-Transfer-and-Discharge Sentinel",
    shortName: "Beds/Discharge",
    alertLevel: "red",
    tone: "critical",
    confidenceScore: 0.94,
    lastUpdatedAt: "16:00",
    summary:
      "Nearly full critical care and blocked discharge-ready patients are turning ED demand into a hospital-wide output blockage.",
    currentBottleneck:
      "Admission-decision-to-bed time and discharge blockers are preventing available capacity from converting into usable beds.",
    predictedNextBottleneck:
      "No safe critical-care placement if ICU stepdown and discharge command review do not release capacity soon.",
    departmentsInvolved: ["Bed management", "ICU", "Medicine wards", "Discharge", "Case management", "Transport"],
    topSignals: [
      "Total staffed-bed occupancy is 97%.",
      "Critical-care occupancy is 99%.",
      "Admission decision to bed is 312 minutes against a 94-minute baseline.",
      "49 discharge-ready patients and 23 pending back-transfers are blocked.",
    ],
    metrics: [
      { id: "t3-occupancy", label: "Staffed-bed occupancy", value: "97%", target: "Breach near 100%", tone: "critical" },
      { id: "t3-critical", label: "Critical-care occupancy", value: "99%", target: "Breach near 100%", tone: "critical" },
      { id: "t3-decision-bed", label: "Admission decision to bed", value: "312m", baseline: "94m baseline", tone: "critical" },
      { id: "t3-boarders", label: "ED boarders", value: "87", tone: "critical" },
      { id: "t3-over6", label: "Boarders over 6h", value: "28", tone: "high" },
      { id: "t3-blocked", label: "Discharge-ready blocked", value: "49", tone: "critical" },
      { id: "t3-transfer", label: "Pending back-transfer", value: "23", tone: "high" },
    ],
    humanChecks: [
      "Validate the blocked discharge-ready list with bed manager, nursing, and case management.",
      "Confirm ICU stepdown candidates through senior clinical review.",
      "Check whether pending back-transfer packets are complete and accepted by receiving sites.",
    ],
    escalationTrigger:
      "Red when ICU or ED boarding threatens safe access; black when no safe placement exists.",
    recommendedActions: [
      "Open a discharge command center.",
      "Run twice-daily ICU stepdown review.",
      "Use controlled flex beds only after staffing and IPC validation.",
      "Assign owners to pending back-transfer packets.",
    ],
  },
  {
    id: "T4",
    name: "Continuity-and-Back-Referral Sentinel",
    shortName: "Continuity",
    alertLevel: "amber",
    tone: "warning",
    confidenceScore: 0.86,
    lastUpdatedAt: "16:00",
    summary:
      "Follow-up, home-oxygen, and back-referral tasks are under pressure and could turn discharge speed into unsafe continuity gaps.",
    currentBottleneck:
      "Unconfirmed home-oxygen follow-up and delayed back-referral bundles are limiting safe downstream release.",
    predictedNextBottleneck:
      "Unsafe discharge pressure if continuity teams cannot verify follow-up capacity and receiving-site acceptance.",
    departmentsInvolved: ["Continuity", "Telemedicine", "Social work", "Case management", "Network hospitals"],
    topSignals: [
      "18% of follow-ups are deferred.",
      "143 follow-up calls are overdue.",
      "31 home-oxygen follow-ups are unconfirmed.",
      "Telemedicine fill is 96%, leaving little reserve.",
    ],
    metrics: [
      { id: "t4-deferred", label: "Deferred follow-ups", value: "18%", tone: "warning" },
      { id: "t4-overdue", label: "Overdue calls", value: "143", tone: "high" },
      { id: "t4-home-o2", label: "Home oxygen follow-up unconfirmed", value: "31", tone: "high" },
      { id: "t4-referrals", label: "Pending back referrals", value: "22", tone: "warning" },
      { id: "t4-telemed", label: "Telemedicine fill", value: "96%", tone: "warning" },
    ],
    humanChecks: [
      "Confirm home oxygen availability and follow-up nurse coverage.",
      "Review exceptions where discharge pressure may outrun safe continuity.",
      "Validate receiving-site acceptance for back-referral bundles.",
    ],
    escalationTrigger:
      "Red when time-sensitive deferred care or unsafe discharge risk appears.",
    recommendedActions: [
      "Use telemedicine capacity for high-risk respiratory follow-up first.",
      "Assign follow-up nurses to home-oxygen confirmation list.",
      "Standardize back-referral bundles for receiving sites.",
    ],
  },
  {
    id: "T5",
    name: "IPC-Isolation-Oxygen-PPE Sentinel",
    shortName: "IPC/Infrastructure",
    alertLevel: "red",
    tone: "critical",
    confidenceScore: 0.93,
    lastUpdatedAt: "16:00",
    summary:
      "Isolation utilization, oxygen reserve, PPE days on hand, turnover delay, and staff illness are converging into an infrastructure risk.",
    currentBottleneck:
      "Isolation and oxygen workflows are approaching limits while respiratory-unit absenteeism reduces operational resilience.",
    predictedNextBottleneck:
      "Oxygen reserve and isolation turnover become the next binding constraints within the forecast window.",
    departmentsInvolved: ["IPC", "Engineering", "Nursing", "Supply", "Respiratory units"],
    topSignals: [
      "Isolation utilization is 96%.",
      "Oxygen utilization is 91%.",
      "N95 days on hand dropped to 11 and gowns to 9.",
      "Two nosocomial cluster signals require IPC verification.",
    ],
    metrics: [
      { id: "t5-isolation", label: "Isolation utilization", value: "96%", tone: "critical" },
      { id: "t5-turnover", label: "Negative-pressure turnover", value: "2.4h", target: "1.2h target", tone: "high" },
      { id: "t5-n95", label: "N95 days on hand", value: "11 days", tone: "warning" },
      { id: "t5-gowns", label: "Gown days on hand", value: "9 days", tone: "high" },
      { id: "t5-oxygen", label: "Oxygen utilization", value: "91%", tone: "critical" },
      { id: "t5-staff", label: "Respiratory-unit staff absenteeism", value: "13.2%", tone: "high" },
      { id: "t5-clusters", label: "Cluster signals for IPC review", value: "2", tone: "high" },
    ],
    humanChecks: [
      "Inspect oxygen reserve and manifold workflow with engineering.",
      "Confirm isolation area turnover delays with IPC and nursing leads.",
      "Review staff illness clusters and PPE consumption before external escalation.",
    ],
    escalationTrigger:
      "Red when nosocomial signal, oxygen pressure, or PPE reserve becomes critical.",
    recommendedActions: [
      "Expand isolation surge area after staffing validation.",
      "Tighten PPE controls and supply monitoring.",
      "Run immediate room-turnover and oxygen-reserve inspection.",
    ],
  },
  {
    id: "T6",
    name: "Pandemic Cross-Process Anomaly Sentinel",
    shortName: "Cross-process",
    alertLevel: "red",
    tone: "critical",
    confidenceScore: 0.96,
    lastUpdatedAt: "16:00",
    summary:
      "Five linked signal families are abnormal across six systems, showing a cross-hospital respiratory-surge pattern rather than a single-department queue.",
    currentBottleneck:
      "Front-door crowding, diagnostics, critical-care beds, oxygen, isolation, and staff illness are reinforcing each other.",
    predictedNextBottleneck:
      "Critical-care breach in 18 hours, followed by oxygen redline pressure in 3.4 days.",
    departmentsInvolved: ["Incident command", "Director office", "ED", "ICU", "IPC", "Engineering", "Network coordination"],
    topSignals: [
      "Five signal families are abnormal.",
      "Six corroborating systems are involved.",
      "Critical-care breach is projected in 18 hours.",
      "Oxygen redline is projected in 3.4 days.",
    ],
    metrics: [
      { id: "t6-families", label: "Signal families abnormal", value: "5", tone: "critical" },
      { id: "t6-systems", label: "Corroborating systems", value: "6", tone: "critical" },
      { id: "t6-general", label: "General-bed breach forecast", value: "2.3 days", tone: "high" },
      { id: "t6-critical", label: "Critical-care breach forecast", value: "18h", tone: "critical" },
      { id: "t6-oxygen", label: "Oxygen redline forecast", value: "3.4 days", tone: "high" },
      { id: "t6-staff", label: "Acute-care staff absenteeism", value: "10.5%", tone: "high" },
      { id: "t6-positivity", label: "Synthetic positivity rate", value: "28%", tone: "critical" },
      { id: "t6-admissions", label: "COVID-coded admissions", value: "42/day", tone: "critical" },
    ],
    humanChecks: [
      "Validate denominators and timestamps across bed, oxygen, staffing, IPC, lab, and ED feeds.",
      "Limit immediate recommendations to reversible coordination steps until senior review.",
      "Recheck whether one feed is stale before treating this as whole-hospital command state.",
    ],
    escalationTrigger:
      "Red when three or more linked signal families are abnormal or a forecasted breach is under 24 hours.",
    recommendedActions: [
      "Move to highest surge review tier for 24 hours.",
      "Start 4-hourly director dashboard rhythm.",
      "Notify network and public-health liaisons with simulation-context language.",
      "Defer selected electives only after senior authorization.",
    ],
  },
  {
    id: "T7",
    name: "Data-Quality and Audit Sentinel",
    shortName: "Data trust",
    alertLevel: "amber",
    tone: "warning",
    confidenceScore: 0.82,
    lastUpdatedAt: "15:58",
    summary:
      "The dashboard remains usable, but several feeds need validation before irreversible decisions are considered.",
    currentBottleneck:
      "Bed-board, ADT, inventory, and post-discharge fields need reconciliation for director-level confidence.",
    predictedNextBottleneck:
      "Trust downgrade if a red recommendation depends on stale inventory, mismatched bed denominators, or missing timestamps.",
    departmentsInvolved: ["Data quality", "ADT", "Bed board", "Inventory", "Audit"],
    topSignals: [
      "Bed-board versus ADT mismatches are visible in the critical-capacity denominator.",
      "Inventory freshness is drifting near the trust threshold.",
      "Post-discharge disposition fields are incomplete in a meaningful minority of records.",
    ],
    metrics: [
      { id: "t7-bed-mismatch", label: "Bed-board/ADT mismatches", value: "12", tone: "warning" },
      { id: "t7-inventory", label: "Inventory feed age", value: "18m", target: "Under 15m", tone: "warning" },
      { id: "t7-timestamps", label: "Missing or late timestamps", value: "3.2%", tone: "moderate" },
      { id: "t7-post-discharge", label: "Incomplete disposition fields", value: "7%", tone: "warning" },
    ],
    humanChecks: [
      "Reconcile bed denominators before changing surge tier based on capacity.",
      "Confirm oxygen and PPE inventory feed freshness with supply and engineering.",
      "Log human validation time after denominator review.",
    ],
    escalationTrigger:
      "Red when a red alert depends on untrusted data; black when the dashboard is unsafe for operational use.",
    recommendedActions: [
      "Mark data feeds needing manual verification.",
      "Downgrade confidence where denominators cannot be reconciled.",
      "Pause irreversible decisions until trust checks are complete.",
    ],
  },
  {
    id: "T8",
    name: "Communication-and-Referral Sentinel",
    shortName: "Communication",
    alertLevel: "red",
    tone: "high",
    confidenceScore: 0.84,
    lastUpdatedAt: "16:00",
    summary:
      "Referral communication and acknowledgement latency are now blocking bed-release and network coordination work.",
    currentBottleneck:
      "Unclosed referral tasks and delayed acknowledgement are slowing back-transfer and home-continuity decisions.",
    predictedNextBottleneck:
      "Operational action stalls if critical alerts, receiving-site acceptance, or ownership handoffs are not acknowledged.",
    departmentsInvolved: ["Referral center", "Case management", "Continuity", "Network hospitals", "Director office"],
    topSignals: [
      "Five red alerts remain unread by intended owner groups.",
      "Nine director-priority tasks have delayed acknowledgement.",
      "23 back-transfer packets still need named owner review.",
      "11 referral documents are missing required handoff fields.",
    ],
    metrics: [
      { id: "t8-unread", label: "Unread red alerts", value: "5", tone: "high" },
      { id: "t8-ack", label: "Delayed acknowledgements", value: "9", tone: "high" },
      { id: "t8-packets", label: "Back-transfer packets pending", value: "23", tone: "critical" },
      { id: "t8-docs", label: "Referral documents missing fields", value: "11", tone: "warning" },
      { id: "t8-accept", label: "Transfer acceptance median", value: "6.2h", tone: "high" },
    ],
    humanChecks: [
      "Confirm ownership for every unresolved back-transfer packet.",
      "Check receiving-site acceptance and document completeness.",
      "Review whether alert recipients match the surge command structure.",
    ],
    escalationTrigger:
      "Red when communication delay blocks action; black when command communication breaks down.",
    recommendedActions: [
      "Assign a named role owner to each delayed back-transfer packet.",
      "Create a single acknowledgement list for director-priority alerts.",
      "Close incomplete referral bundles before counting them as releasable capacity.",
    ],
  },
];

export const surgeForecast: SurgeForecastPoint[] = [
  {
    day: 0,
    respiratoryArrivals: 35,
    positivityRate: 4,
    covidAdmissions: 4,
    covidIcuAdmissions: 1,
    staffedBedOccupancy: 85,
    criticalCareOccupancy: 82,
    oxygenSupportedCensus: 26,
    oxygenBurnIndex: 100,
    staffAbsenteeism: 3.5,
    n95DaysOnHand: 26,
  },
  {
    day: 7,
    respiratoryArrivals: 65,
    positivityRate: 10,
    covidAdmissions: 11,
    covidIcuAdmissions: 2,
    staffedBedOccupancy: 88,
    criticalCareOccupancy: 89,
    oxygenSupportedCensus: 54,
    oxygenBurnIndex: 128,
    staffAbsenteeism: 5.5,
    n95DaysOnHand: 21,
  },
  {
    day: 14,
    respiratoryArrivals: 105,
    positivityRate: 19,
    covidAdmissions: 26,
    covidIcuAdmissions: 4,
    staffedBedOccupancy: 92,
    criticalCareOccupancy: 95,
    oxygenSupportedCensus: 112,
    oxygenBurnIndex: 161,
    staffAbsenteeism: 8,
    n95DaysOnHand: 15,
  },
  {
    day: 21,
    respiratoryArrivals: 140,
    positivityRate: 28,
    covidAdmissions: 42,
    covidIcuAdmissions: 6,
    staffedBedOccupancy: 97,
    criticalCareOccupancy: 99,
    oxygenSupportedCensus: 168,
    oxygenBurnIndex: 188,
    staffAbsenteeism: 10.5,
    n95DaysOnHand: 11,
  },
  {
    day: 30,
    respiratoryArrivals: 118,
    positivityRate: 24,
    covidAdmissions: 31,
    covidIcuAdmissions: 5,
    staffedBedOccupancy: 94,
    criticalCareOccupancy: 96,
    oxygenSupportedCensus: 146,
    oxygenBurnIndex: 172,
    staffAbsenteeism: 8.5,
    n95DaysOnHand: 14,
  },
];

export const operationalActions: OperationalActionPlan[] = [
  {
    id: "act-t1",
    sentinelId: "T1",
    title: "Separate respiratory and non-respiratory access flow",
    actions: ["Split front ends", "Open surge registration counters", "Add rapid pre-registration and queue marshals"],
    verifyBeforeAction: "Verify waiting area, segregation, and timestamp reliability with ED, OPD nursing, registration, and IPC.",
    responsibleRoles: ["ED head", "OPD nursing", "Registration manager", "IPC nurse"],
    timeWindow: "30-60m",
  },
  {
    id: "act-t2",
    sentinelId: "T2",
    title: "Prioritize respiratory diagnostics and consult review",
    actions: ["Open portable CXR priority lane", "Batch Pulmonary/ID/ICU consult board", "Fast-track pharmacy verification visibility"],
    verifyBeforeAction: "Review delayed consults and the 17 high-risk oxygen-failure cases with accountable clinical leads.",
    responsibleRoles: ["Pulmonary", "ID", "Radiology", "Pharmacy"],
    timeWindow: "1-2h",
  },
  {
    id: "act-t3",
    sentinelId: "T3",
    title: "Open discharge command center",
    actions: ["Run twice-daily ICU stepdown review", "Use controlled flex beds after staffing check", "Accelerate back-transfer packet ownership"],
    verifyBeforeAction: "Validate the blocked discharge list and capacity denominators before treating beds as releasable.",
    responsibleRoles: ["Bed manager", "Nursing", "Case management", "Medical director"],
    timeWindow: "1-6h",
  },
  {
    id: "act-t4",
    sentinelId: "T4",
    title: "Protect continuity while accelerating release",
    actions: ["Use telemedicine for high-risk follow-up", "Assign home-oxygen follow-up nurses", "Complete back-referral bundles"],
    verifyBeforeAction: "Confirm home oxygen supply, exception list, and downstream acceptance.",
    responsibleRoles: ["Continuity", "Telemedicine", "Social work"],
    timeWindow: "Same day",
  },
  {
    id: "act-t5",
    sentinelId: "T5",
    title: "Inspect IPC, isolation, PPE, and oxygen reserve",
    actions: ["Expand isolation surge area if staffing is confirmed", "Tighten PPE controls", "Review room turnover and oxygen reserve workflow"],
    verifyBeforeAction: "Physical engineering and IPC inspection required before relying on reserve estimates.",
    responsibleRoles: ["IPC", "Engineering", "Nursing"],
    timeWindow: "30-120m",
  },
  {
    id: "act-t6",
    sentinelId: "T6",
    title: "Run highest surge review tier",
    actions: ["Start 4-hourly director dashboard rhythm", "Notify network and public-health liaisons", "Consider selected elective deferral with senior authorization"],
    verifyBeforeAction: "Validate denominators and keep first actions reversible until senior review is complete.",
    responsibleRoles: ["Director", "Incident command", "Dean", "Public-health liaison"],
    timeWindow: "Within 30m",
  },
];

export const thresholdMatrix: ThresholdMatrixRow[] = [
  {
    sentinelId: "T1",
    sentinelName: "Access/Triage",
    amber: "Queue or wait time exceeds 1.5x baseline for two windows.",
    red: "Critical waits, segregation breaches, or predicted overflow.",
    black: "New arrivals cannot be safely triaged.",
  },
  {
    sentinelId: "T2",
    sentinelName: "Diagnostics/Consults",
    amber: "Urgent queue exceeds 1.5x baseline.",
    red: "ICU-eligible or time-critical patients delayed.",
    black: "Critical diagnostics unavailable or unsafe.",
  },
  {
    sentinelId: "T3",
    sentinelName: "Beds/Discharge",
    amber: "High occupancy plus blocked discharges.",
    red: "ICU or ED boarding threatens access.",
    black: "No safe placement available.",
  },
  {
    sentinelId: "T4",
    sentinelName: "Continuity",
    amber: "Follow-up or home-oxygen gap.",
    red: "Time-sensitive deferred care or unsafe discharge risk.",
    black: "Discharge pressure creates unsafe release risk.",
  },
  {
    sentinelId: "T5",
    sentinelName: "IPC/Infrastructure",
    amber: "Isolation, PPE, or oxygen warning.",
    red: "Nosocomial, oxygen, or PPE reserve critical.",
    black: "Immediate care delivery threatened.",
  },
  {
    sentinelId: "T6",
    sentinelName: "Cross-process",
    amber: "Two linked signal families abnormal.",
    red: "Three or more abnormal signal families or breach forecast under 24h.",
    black: "Command failure or system collapse pattern.",
  },
  {
    sentinelId: "T7",
    sentinelName: "Data trust",
    amber: "Important feed stale or denominator inconsistent.",
    red: "Red alert depends on untrusted data.",
    black: "Dashboard unsafe for operational use.",
  },
  {
    sentinelId: "T8",
    sentinelName: "Communication",
    amber: "Delayed acknowledgement or unclear ownership.",
    red: "Communication delay blocks action.",
    black: "Command communication breakdown.",
  },
];

export const governanceBoundaries: GovernanceBoundary[] = [
  {
    id: "pdpa",
    title: "PDPA and privacy",
    summary:
      "Use the minimum operational data needed for coordination and keep identifiable patient-level review inside accountable hospital workflows.",
    requiredPractice: "Show aggregate sentinel signals by default and route sensitive patient lists to authorized human leads.",
  },
  {
    id: "sa-md",
    title: "Thai FDA SaMD boundary",
    summary:
      "CareFlow remains operational surveillance and coordination support, not autonomous diagnosis, triage, or treatment direction.",
    requiredPractice: "Keep language non-clinical and require human review before any clinical or irreversible operational decision.",
  },
  {
    id: "accountability",
    title: "Human accountability",
    summary:
      "The system can recommend review paths, escalation, and role assignment, but hospital leaders retain decision ownership.",
    requiredPractice: "Capture validation time, owner role, and review status for every red or black sentinel action.",
  },
  {
    id: "drift",
    title: "Dataset drift and fairness",
    summary:
      "Surge patterns can shift by wave, department, staffing model, and referral geography; thresholds must be locally validated.",
    requiredPractice: "Track baseline drift, subgroup impact, and false escalation rates across simulated and live-review periods.",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity and resilience",
    summary:
      "A command dashboard becomes critical infrastructure during a surge and must degrade safely if feeds fail.",
    requiredPractice: "Expose feed freshness, trust downgrades, and safe fallback procedures in the director view.",
  },
  {
    id: "communication",
    title: "Communication risk",
    summary:
      "External language must distinguish simulated anomaly surveillance from confirmed clinical or public-health statements.",
    requiredPractice: "Use terms like unusual operational pattern, above baseline, review suggested, and anomaly score.",
  },
];
