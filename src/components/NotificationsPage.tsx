import { AlertTriangle, Bell, Check, Eye, FileText } from "lucide-react";
import type { NotificationItem, NotificationSeverity, Tone } from "../types";
import { StatusBadge } from "./StatusBadge";

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onNotificationAction: (notification: NotificationItem) => void;
  onMarkReviewed: (notificationId: string) => void;
}

export function NotificationsPage({ notifications, onNotificationAction, onMarkReviewed }: NotificationsPageProps) {
  return (
    <main className="space-y-5 px-4 py-5 sm:px-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-ai">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-ai">Notification center</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">Operational Updates</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Anomalies and bottleneck changes stay here unless they require visible review. Coordina reports
              operational patterns, not diagnoses.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={[
              "rounded-lg border bg-white p-5 shadow-soft",
              notification.reviewed
                ? "border-slate-200 opacity-80"
                : notification.severity === "Escalation"
                  ? "border-red-200"
                  : notification.severity === "Important"
                    ? "border-amber-200"
                    : "border-slate-200",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <NotificationIcon severity={notification.severity} reviewed={notification.reviewed} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={notification.severity} tone={severityTone(notification.severity)} size="sm" />
                    <span className="text-xs font-bold text-slate-500">{notification.timestamp}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {notification.type}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-ink">{notification.title}</h2>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">{notification.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    {notification.relatedDepartment ? <span>Department: {notification.relatedDepartment}</span> : null}
                    {notification.relatedInsightId ? <span>Insight: {notification.relatedInsightId}</span> : null}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onNotificationAction(notification)}
                  className="inline-flex items-center gap-2 rounded-lg bg-ai px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
                >
                  {notification.target === "brief" ? <FileText className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {notification.actionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onMarkReviewed(notification.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:text-ai"
                >
                  <Check className="h-4 w-4" />
                  {notification.reviewed ? "Reviewed" : "Mark reviewed"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function NotificationIcon({ severity, reviewed }: { severity: NotificationSeverity; reviewed: boolean }) {
  if (reviewed) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
        <Check className="h-5 w-5" />
      </div>
    );
  }

  if (severity === "Escalation") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
    );
  }

  if (severity === "Important") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-ai">
      <Bell className="h-5 w-5" />
    </div>
  );
}

function severityTone(severity: NotificationSeverity): Tone {
  if (severity === "Escalation") {
    return "critical";
  }

  if (severity === "Important") {
    return "warning";
  }

  return "neutral";
}

