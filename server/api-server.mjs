import http from "node:http";
import {
  fallbackAnomaly,
  fallbackBrief,
  fallbackCentralInsight,
  fallbackDepartmentInsight,
} from "./lib/ai/fallbacks.mjs";
import { generateStructured } from "./lib/ai/openai.mjs";
import { anomalyPrompt, briefPrompt, centralPrompt, departmentPrompt } from "./lib/ai/prompts.mjs";
import {
  anomalySchema,
  briefSchema,
  centralInsightSchema,
  departmentInsightSchema,
} from "./lib/ai/schemas.mjs";
import { stepSimulationFallback } from "./lib/simulation/step.mjs";

const port = Number(process.env.CAREFLOW_API_PORT || 8787);

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readJson(request);
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (url.pathname === "/api/simulation/step") {
      sendJson(response, 200, stepSimulationFallback(body.state, body.speed));
      return;
    }

    if (url.pathname === "/api/ai/central-insight") {
      const result = await generateStructured({
        instructions: centralPrompt(),
        input: compactState(body.state),
        schema: centralInsightSchema,
        fallback: () => fallbackCentralInsight(body.state),
      });
      sendJson(response, 200, result);
      return;
    }

    if (url.pathname === "/api/ai/department-insight") {
      const department = body.department;
      const result = await generateStructured({
        instructions: departmentPrompt(department),
        input: { state: compactState(body.state), department },
        schema: departmentInsightSchema,
        fallback: () => fallbackDepartmentInsight(body.state, department),
      });
      sendJson(response, 200, result);
      return;
    }

    if (url.pathname === "/api/ai/anomaly") {
      const result = await generateStructured({
        instructions: anomalyPrompt(),
        input: compactState(body.state),
        schema: anomalySchema,
        fallback: () => fallbackAnomaly(body.state),
      });
      sendJson(response, 200, result);
      return;
    }

    if (url.pathname === "/api/ai/brief") {
      const result = await generateStructured({
        instructions: briefPrompt(),
        input: {
          state: compactState(body.state),
          insight: body.insight,
          actions: body.actions,
        },
        schema: briefSchema,
        fallback: () => fallbackBrief(body),
      });
      sendJson(response, 200, result);
      return;
    }

    sendJson(response, 404, { error: "Unknown CareFlow API route" });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error",
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CareFlow API listening on http://127.0.0.1:${port}`);
});

function compactState(state) {
  if (!state) {
    return {};
  }

  return {
    tick: state.tick,
    simulatedTime: state.simulatedTime,
    scenario: state.scenario,
    primaryBottleneck: state.primaryBottleneck,
    primaryBottleneckScore: state.primaryBottleneckScore,
    centralTrend: state.centralTrend,
    severity: state.severity,
    materialChange: state.materialChange,
    changedSincePrevious: state.changedSincePrevious,
    anomalyScore: state.anomalyScore,
    metrics: state.metrics,
    departments: state.departments,
    recentEvents: (state.events ?? []).slice(0, 5),
  };
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  if (status !== 204) {
    response.end(JSON.stringify(payload));
  } else {
    response.end();
  }
}

