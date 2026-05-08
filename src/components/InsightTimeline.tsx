import { Check, Clock3, History, Plus } from "lucide-react";
import type { InsightTimelineEvent, NotificationSeverity } from "../types";

interface InsightTimelineProps {
  events: InsightTimelineEvent[];
  onEventAction: (event: InsightTimelineEvent) => void;
}

export function InsightTimeline({ events, onEventAction }: InsightTimelineProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-ai" />
            <h2 className="text-xl font-bold text-ink">Insight Timeline</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Chronological changes in the bottleneck and supporting signals.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          <Clock3 className="h-4 w-4 text-ai" />
          Live feed
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {events.map((event, index) => (
          <article key={event.id} className="relative pl-7">
            {index < events.length - 1 ? (
              <span className="absolute left-[7px] top-7 h-full w-px bg-slate-200" aria-hidden="true" />
            ) : null}
            <span
              className={[
                "absolute left-0 top-2 h-3.5 w-3.5 rounded-full ring-4 ring-white",
                severityDot(event.severity),
              ].join(" ")}
              aria-hidden="true"
            />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-ink">{event.timestamp}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {event.eventType}
                  </span>
                  <span className={["rounded-full px-2.5 py-1 text-xs font-bold", severityPill(event.severity)].join(" ")}>
                    {event.severity}
                  </span>
                </div>
                {event.actionLabel ? (
                  <button
                    type="button"
                    onClick={() => onEventAction(event)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-200 hover:text-ai"
                  >
                    {event.actionLabel === "Add to brief" ? <Plus className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    {event.actionLabel}
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{event.explanation}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function severityDot(severity: NotificationSeverity) {
  if (severity === "Escalation") {
    return "bg-red-500";
  }

  if (severity === "Important") {
    return "bg-amber-500";
  }

  return "bg-ai";
}

function severityPill(severity: NotificationSeverity) {
  if (severity === "Escalation") {
    return "bg-red-50 text-red-700";
  }

  if (severity === "Important") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-cyan-50 text-ai";
}
