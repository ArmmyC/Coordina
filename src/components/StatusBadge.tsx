import type { Tone } from "../types";

const toneClasses: Record<Tone, string> = {
  critical: "bg-red-50 text-red-700 ring-red-100",
  high: "bg-red-50 text-red-700 ring-red-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  moderate: "bg-amber-50 text-amber-700 ring-amber-100",
  stable: "bg-green-50 text-green-700 ring-green-100",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  ai: "bg-cyan-50 text-ai ring-cyan-100",
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  size?: "sm" | "md";
}

export function StatusBadge({ label, tone = "neutral", size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-semibold ring-1 ring-inset",
        size === "sm" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        toneClasses[tone],
      ].join(" ")}
    >
      {label}
    </span>
  );
}
