const actionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "ownerRole",
    "impact",
    "affectedPatients",
    "estimatedTimeSavedMinutes",
    "confidence",
    "safetyNote",
    "briefText",
  ],
  properties: {
    title: { type: "string" },
    ownerRole: { type: "string" },
    impact: { type: "string", enum: ["High", "Medium", "Low"] },
    affectedPatients: { type: "number" },
    estimatedTimeSavedMinutes: { type: "number" },
    confidence: { type: "string", enum: ["High confidence", "Moderate confidence", "Limited confidence"] },
    safetyNote: { type: "string" },
    briefText: { type: "string" },
  },
};

export const centralInsightSchema = {
  name: "careflow_central_insight",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "title",
      "visibleProblem",
      "naiveExplanation",
      "actualInsight",
      "supportingEvidence",
      "departmentsInvolved",
      "suggestedActions",
      "confidence",
      "uncertainty",
      "trend",
      "severity",
      "changedSincePrevious",
    ],
    properties: {
      title: { type: "string" },
      visibleProblem: { type: "string" },
      naiveExplanation: { type: "string" },
      actualInsight: { type: "string" },
      supportingEvidence: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
      departmentsInvolved: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
      suggestedActions: { type: "array", items: actionSchema, minItems: 3, maxItems: 4 },
      confidence: { type: "string", enum: ["High confidence", "Moderate confidence", "Limited confidence"] },
      uncertainty: { type: "string" },
      trend: { type: "string", enum: ["worsening", "stable", "improving", "new"] },
      severity: { type: "string", enum: ["low", "moderate", "high", "critical"] },
      changedSincePrevious: { type: "string" },
    },
  },
};

export const departmentInsightSchema = {
  name: "careflow_department_insight",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "department",
      "summary",
      "localProblem",
      "whyItMatters",
      "bottleneckRole",
      "evidence",
      "trend",
      "confidence",
    ],
    properties: {
      department: { type: "string", enum: ["ed", "beds", "pharmacy", "discharge", "transport", "radiology"] },
      summary: { type: "string" },
      localProblem: { type: "string" },
      whyItMatters: { type: "string" },
      bottleneckRole: {
        type: "string",
        enum: ["primary contributor", "secondary contributor", "monitored only"],
      },
      evidence: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
      trend: { type: "string", enum: ["worsening", "stable", "improving", "new"] },
      confidence: { type: "string", enum: ["High confidence", "Moderate confidence", "Limited confidence"] },
    },
  },
};

export const anomalySchema = {
  name: "careflow_anomaly",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "severity", "summary", "whyEscalated", "reviewSuggestedFor", "safetyNote"],
    properties: {
      title: { type: "string" },
      severity: { type: "string", enum: ["info", "warning", "escalation"] },
      summary: { type: "string" },
      whyEscalated: { type: "string" },
      reviewSuggestedFor: { type: "string" },
      safetyNote: { type: "string" },
    },
  },
};

export const briefSchema = {
  name: "careflow_brief",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "summary", "actions", "safetyNote"],
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      actions: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
      safetyNote: { type: "string" },
    },
  },
};

