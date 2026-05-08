import { ShieldCheck } from "lucide-react";
import type { ConfidenceLabel } from "../types";

interface ConfidenceBadgeProps {
  label: ConfidenceLabel;
  score?: number;
}

export function ConfidenceBadge({ label, score }: ConfidenceBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-ai-soft px-3 py-1.5 text-xs font-semibold text-ai ring-1 ring-cyan-100">
      <ShieldCheck className="h-4 w-4" />
      <span className="font-semibold">{label}</span>
      {score !== undefined ? <span className="text-slate-500">{Math.round(score * 100)}%</span> : null}
    </div>
  );
}
