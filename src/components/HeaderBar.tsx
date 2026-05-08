import { ChevronDown, Clock3, Database, Hospital, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import type { HospitalSnapshot } from "../types";
import { NotificationBell } from "./NotificationBell";

interface HeaderBarProps {
  snapshot: HospitalSnapshot;
  unreadCount: number;
  onOpenNotifications: () => void;
}

export function HeaderBar({ snapshot, unreadCount, onOpenNotifications }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ai-soft text-ai sm:h-11 sm:w-11">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-ink sm:text-2xl">CareFlow</div>
            <div className="hidden text-xs font-medium text-slate-500 sm:block">
              Multi-Agent Hospital Flow Intelligence
            </div>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-3 xl:flex">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <Hospital className="h-4 w-4 text-ai" />
            {snapshot.hospitalName}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
            <Clock3 className="h-4 w-4 text-ai" />
            {snapshot.snapshotTime}
          </div>
          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
            <Database className="h-4 w-4 text-ai" />
            {snapshot.dataLabel}
          </div>
          <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-ai" />
            {snapshot.safetyLabel}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell unreadCount={unreadCount} onClick={onOpenNotifications} />
          <div className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm sm:flex">
            <UserRound className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
