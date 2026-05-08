import { Clock3, Radar, UsersRound } from "lucide-react";
import type { InsightSeverity, SecondaryIssue, Tone } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { StatusBadge } from "./StatusBadge";

interface SecondaryMonitoredIssuesProps {
  issues: SecondaryIssue[];
}

export function SecondaryMonitoredIssues({ issues }: SecondaryMonitoredIssuesProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-ai" />
            <h2 className="text-xl font-bold text-ink">Secondary Monitored Issues</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Important signals that explain or watch the primary bottleneck without competing for attention.
          </p>
        </div>
        <span className="rounded-xl bg-cyan-50 px-3 py-2 text-xs font-bold text-ai">
          {issues.length} active signals
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {issues.map((issue) => (
          <article key={issue.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">{issue.title}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">Updated {issue.lastUpdatedAt}</p>
              </div>
              <StatusBadge label={issue.relationToPrimary} tone={roleTone(issue.relationToPrimary)} size="sm" />
            </div>
            <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{issue.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                <UsersRound className="h-3.5 w-3.5 text-ai" />
                {issue.affectedPatients} patients
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                <Clock3 className="h-3.5 w-3.5 text-red-500" />
                {minutesToHuman(issue.estimatedTimeLostMinutes)}
              </span>
              <StatusBadge label={issue.trend} tone={trendTone(issue.trend)} size="sm" />
              <StatusBadge label={issue.severity} tone={severityTone(issue.severity)} size="sm" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function roleTone(role: SecondaryIssue["relationToPrimary"]): Tone {
  if (role === "primary contributor") {
    return "ai";
  }

  if (role === "secondary contributor") {
    return "warning";
  }

  return "neutral";
}

function trendTone(trend: SecondaryIssue["trend"]): Tone {
  if (trend === "worsening" || trend === "new") {
    return "warning";
  }

  if (trend === "improving") {
    return "stable";
  }

  return "neutral";
}

function severityTone(severity: InsightSeverity): Tone {
  if (severity === "critical") {
    return "critical";
  }

  if (severity === "high") {
    return "high";
  }

  if (severity === "moderate") {
    return "warning";
  }

  return "stable";
}
