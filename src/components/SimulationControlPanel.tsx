import { Pause, Play, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { SimulationScenarioId, SimulationSpeed, SimulationState } from "../lib/simulation/types";
import type { ScenarioPreset } from "../lib/simulation/types";
import { StatusBadge } from "./StatusBadge";

interface SimulationControlPanelProps {
  state: SimulationState;
  scenarios: ScenarioPreset[];
  scenarioId: SimulationScenarioId;
  isPlaying: boolean;
  isLive: boolean;
  speed: SimulationSpeed;
  aiStatus: string;
  onTogglePlay: () => void;
  onReset: () => void;
  onScenarioChange: (scenarioId: SimulationScenarioId) => void;
  onSpeedChange: (speed: SimulationSpeed) => void;
  onToggleLive: () => void;
}

export function SimulationControlPanel({
  state,
  scenarios,
  scenarioId,
  isPlaying,
  isLive,
  speed,
  aiStatus,
  onTogglePlay,
  onReset,
  onScenarioChange,
  onSpeedChange,
  onToggleLive,
}: SimulationControlPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-ai">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-ink">Live Simulation</h2>
              <StatusBadge label="Synthetic respiratory-surge simulation" tone="ai" size="sm" />
              <StatusBadge label={aiStatus} tone={aiStatus.includes("OpenAI") ? "stable" : "neutral"} size="sm" />
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Simulated time {state.simulatedTime} · Anomaly score {Math.round(state.anomalyScore * 100)} · Primary{" "}
              {state.primaryBottleneck}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={scenarioId}
            onChange={(event) => onScenarioChange(event.target.value as SimulationScenarioId)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none"
            aria-label="Simulation scenario"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>

          <div className="inline-flex h-10 rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold">
            {([1, 2, 4] as SimulationSpeed[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSpeedChange(item)}
                className={[
                  "rounded-md px-3 transition",
                  speed === item ? "bg-ai text-white" : "text-slate-500 hover:text-ai",
                ].join(" ")}
              >
                {item}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleLive}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-bold transition",
              isLive ? "border-cyan-200 bg-cyan-50 text-ai" : "border-slate-200 bg-white text-slate-700",
            ].join(" ")}
          >
            {isLive ? "Live" : "Snapshot"}
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="inline-flex items-center gap-2 rounded-lg bg-ai px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:text-ai"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

