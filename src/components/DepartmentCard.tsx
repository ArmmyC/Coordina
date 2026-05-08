import { Clock3 } from "lucide-react";
import type { DepartmentSignal, Tone } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { getDepartmentIcon, getDepartmentTone } from "./departmentIcons";
import { IconTile } from "./IconTile";
import { StatusBadge } from "./StatusBadge";

interface DepartmentCardProps {
  department: DepartmentSignal;
  onOpen: (department: DepartmentSignal) => void;
}

export function DepartmentCard({ department, onOpen }: DepartmentCardProps) {
  const Icon = getDepartmentIcon(department.id);
  const iconTone = getDepartmentTone(department.id);

  return (
    <button
      type="button"
      onClick={() => onOpen(department)}
      className="glass-card group rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile tone={iconTone}>
            <Icon className="h-6 w-6" />
          </IconTile>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">{department.name}</p>
            <StatusBadge label={department.status} tone={department.tone} size="sm" />
          </div>
        </div>
        <StatusBadge label={department.bottleneckRole} tone={roleTone(department.bottleneckRole)} size="sm" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">Affected patients</p>
          <p className="mt-1 text-xl font-bold text-ink">{department.affectedPatients}</p>
        </div>
        <div className="border-l border-slate-200 pl-3">
          <p className="text-xs font-semibold text-slate-500">Est. time lost</p>
          <p className="mt-1 flex items-center gap-1 text-xl font-bold text-red-600">
            <Clock3 className="h-4 w-4" />
            {minutesToHuman(department.timeLostMinutes)}
          </p>
        </div>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{department.summary}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">Updated {department.lastUpdatedAt}</p>
      <p className="mt-3 text-xs font-bold text-ai opacity-0 transition group-hover:opacity-100">
        Open detail drawer
      </p>
    </button>
  );
}

function roleTone(role: DepartmentSignal["bottleneckRole"]): Tone {
  if (role === "primary contributor") {
    return "ai";
  }

  if (role === "secondary contributor") {
    return "warning";
  }

  return "neutral";
}
