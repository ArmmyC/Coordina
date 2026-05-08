import { Ambulance, Bed, ClipboardList, Timer, TrendingUp } from "lucide-react";
import type { Kpi } from "../types";
import { IconTile } from "./IconTile";
import { MiniSparkline } from "./MiniSparkline";
import { StatusBadge } from "./StatusBadge";

interface KpiCardProps {
  kpi: Kpi;
}

const iconByKpi = {
  "ed-occupancy": Ambulance,
  "ward-occupancy": Bed,
  "discharge-blockers": ClipboardList,
  "time-loss": Timer,
};

const tileToneByKpi = {
  "ed-occupancy": "red",
  "ward-occupancy": "amber",
  "discharge-blockers": "red",
  "time-loss": "red",
} as const;

const sparkToneByKpi = {
  "ed-occupancy": "red",
  "ward-occupancy": "amber",
  "discharge-blockers": "red",
  "time-loss": "red",
} as const;

export function KpiCard({ kpi }: KpiCardProps) {
  const Icon = iconByKpi[kpi.id as keyof typeof iconByKpi] ?? Timer;
  const tileTone = tileToneByKpi[kpi.id as keyof typeof tileToneByKpi] ?? "teal";
  const sparkTone = sparkToneByKpi[kpi.id as keyof typeof sparkToneByKpi] ?? "teal";

  return (
    <article className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <IconTile tone={tileTone}>
            <Icon className="h-6 w-6" />
          </IconTile>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-ink">{kpi.label}</p>
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                i
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-bold leading-none text-ink">{kpi.value}</span>
              <StatusBadge label={kpi.status} tone={kpi.tone} size="sm" />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600">{kpi.supportingLine}</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <MiniSparkline values={kpi.sparkline} tone={sparkTone} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-red-600">
        <TrendingUp className="h-3.5 w-3.5" />
        {kpi.trend}
      </div>
    </article>
  );
}
