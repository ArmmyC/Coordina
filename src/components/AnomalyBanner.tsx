import { AlertTriangle, ClipboardPlus, Eye } from "lucide-react";
import type { AnomalyEvent } from "../types";

interface AnomalyBannerProps {
  anomaly: AnomalyEvent;
  isInBrief: boolean;
  onOpen: () => void;
  onAddToBrief: (anomaly: AnomalyEvent) => void;
}

export function AnomalyBanner({ anomaly, isInBrief, onOpen, onAddToBrief }: AnomalyBannerProps) {
  const isEscalation = anomaly.severity === "Escalation";

  return (
    <section className="mx-auto mt-5 max-w-[1560px] px-4 sm:px-6">
      <div
        className={[
          "flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-sm",
          isEscalation ? "border border-red-200 bg-red-50" : "border border-amber-200 bg-amber-50",
        ].join(" ")}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl bg-white",
              isEscalation ? "text-red-600" : "text-amber-600",
            ].join(" ")}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={["text-sm font-bold", isEscalation ? "text-red-800" : "text-amber-800"].join(" ")}>
                {anomaly.title}
              </p>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600">
                Anomaly score {Math.round(anomaly.anomalyScore * 100)}
              </span>
              {isEscalation ? (
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                  Escalation recommended
                </span>
              ) : null}
            </div>
            <p
              className={[
                "mt-1 break-words text-sm leading-6",
                isEscalation ? "text-red-900/80" : "text-amber-900/80",
              ].join(" ")}
            >
              {anomaly.summary}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
          >
            <Eye className="h-4 w-4" />
            Review anomaly
          </button>
          <button
            type="button"
            onClick={() => onAddToBrief(anomaly)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            <ClipboardPlus className="h-4 w-4" />
            {isInBrief ? "In brief" : "Add to brief"}
          </button>
        </div>
      </div>
    </section>
  );
}
