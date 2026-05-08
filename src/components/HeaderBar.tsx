import { Circle, Clock3, Database, Hospital, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { HospitalSnapshot } from "../types";
import { NotificationBell } from "./NotificationBell";

interface HeaderBarProps {
  snapshot: HospitalSnapshot;
  unreadCount: number;
  isLive: boolean;
  onToggleLive: () => void;
  onOpenNotifications: () => void;
}

export function HeaderBar({
  snapshot,
  unreadCount,
  isLive,
  onToggleLive,
  onOpenNotifications,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:ml-64">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="inline-flex h-11 min-w-0 max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-ink shadow-sm">
            <Hospital className="h-4 w-4 shrink-0 text-slate-600" />
            <span className="truncate">{snapshot.hospitalName}</span>
          </div>

          <div className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-slate-700">
            <Clock3 className="h-4 w-4 text-slate-500" />
            {snapshot.snapshotTime}
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
          <Badge icon={<Database className="h-4 w-4" />} tone="cyan">
            {snapshot.dataLabel}
          </Badge>
          <Badge icon={<ShieldCheck className="h-4 w-4" />} tone="amber">
            {snapshot.safetyLabel}
          </Badge>

          <div className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
            <Circle className={["h-2.5 w-2.5 fill-current", isLive ? "text-green-500" : "text-slate-400"].join(" ")} />
            <span>{isLive ? "Live" : "Snapshot"}</span>
            <span className="text-slate-400">•</span>
            <span className="hidden sm:inline">{isLive ? snapshot.liveOps.autoRefreshLabel : "Frozen for review"}</span>
          </div>

          <button
            type="button"
            onClick={onToggleLive}
            aria-pressed={isLive}
            className="inline-flex h-11 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-xs font-bold shadow-sm"
          >
            <span
              className={[
                "inline-flex items-center rounded-md px-3 transition",
                isLive ? "bg-ai text-white" : "text-slate-500",
              ].join(" ")}
            >
              Live
            </span>
            <span
              className={[
                "inline-flex items-center rounded-md px-3 transition",
                !isLive ? "bg-slate-700 text-white" : "text-slate-500",
              ].join(" ")}
            >
              Snapshot
            </span>
          </button>

          <NotificationBell unreadCount={unreadCount} onClick={onOpenNotifications} />
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 shadow-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ai text-xs text-white">PC</span>
            <UserRound className="hidden h-4 w-4 text-slate-500 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}

interface BadgeProps {
  icon: ReactNode;
  children: ReactNode;
  tone: "cyan" | "amber";
}

function Badge({ icon, children, tone }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-bold",
        tone === "cyan"
          ? "border-cyan-200 bg-cyan-50 text-ai"
          : "border-amber-200 bg-amber-50 text-amber-700",
      ].join(" ")}
    >
      {icon}
      {children}
    </span>
  );
}
