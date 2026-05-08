import { Bell, Check, ClipboardPlus, Eye, X } from "lucide-react";
import type { NotificationItem } from "../types";

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onOpenInsight: () => void;
  onOpenAnomaly: () => void;
  onAddBriefSuggestions: () => void;
  onMarkReviewed: (id: string) => void;
}

const severityClasses = {
  Passive: "bg-slate-100 text-slate-600",
  Important: "bg-amber-100 text-amber-700",
  Escalation: "bg-red-100 text-red-700",
  Update: "bg-cyan-50 text-ai",
};

export function NotificationPanel({
  notifications,
  onClose,
  onOpenInsight,
  onOpenAnomaly,
  onAddBriefSuggestions,
  onMarkReviewed,
}: NotificationPanelProps) {
  const handleAction = (notification: NotificationItem) => {
    if (notification.target === "insight") {
      onOpenInsight();
    }

    if (notification.target === "anomaly") {
      onOpenAnomaly();
    }

    if (notification.target === "brief") {
      onAddBriefSuggestions();
    }

    onMarkReviewed(notification.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ai-soft text-ai">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ai">Notification center</p>
              <h2 className="text-2xl font-bold text-ink">Operational updates</h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close notification panel"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-cyan-200 hover:text-ai"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Alerts stay passive unless an operational pattern needs human review. CareFlow does not infer diagnoses or
          confirm outbreaks.
        </p>

        <div className="mt-6 space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={[
                "rounded-2xl border p-4 shadow-sm",
                notification.reviewed ? "border-slate-200 bg-slate-50" : "border-cyan-100 bg-white",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "rounded-full px-2 py-1 text-[11px] font-bold",
                        severityClasses[notification.severity],
                      ].join(" ")}
                    >
                      {notification.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{notification.timestamp}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-ink">{notification.title}</h3>
                </div>
                {notification.reviewed ? <Check className="h-5 w-5 text-green-600" /> : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{notification.explanation}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(notification)}
                  className="inline-flex items-center gap-2 rounded-xl bg-ai px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
                >
                  {notification.target === "brief" ? <ClipboardPlus className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {notification.actionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => onMarkReviewed(notification.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:text-ai"
                >
                  <Check className="h-4 w-4" />
                  Mark reviewed
                </button>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
