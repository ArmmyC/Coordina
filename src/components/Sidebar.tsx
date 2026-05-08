import {
  Bell,
  BrainCircuit,
  Building2,
  ChevronLeft,
  FileText,
  Plus,
  Settings,
  Siren,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppPage = "siriraj-surge" | "central-ai" | "departments" | "action-brief" | "notifications" | "settings";

interface SidebarProps {
  activePage: AppPage;
  unreadCount: number;
  onNavigate: (page: AppPage) => void;
}

const navItems = [
  { id: "siriraj-surge", label: "Siriraj Surge", icon: Siren },
  { id: "central-ai", label: "Central AI", icon: BrainCircuit },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "action-brief", label: "Action Brief", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] satisfies Array<{ id: AppPage; label: string; icon: LucideIcon }>;

export function Sidebar({ activePage, unreadCount, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white/95 shadow-sm lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-ai">
          <Plus className="h-6 w-6" strokeWidth={2.7} />
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight text-ai">Coordina</p>
          <p className="text-xs font-semibold text-slate-500">Operations AI</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-5" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={[
                "flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-bold transition",
                isActive
                  ? "border-l-4 border-ai bg-cyan-50 text-ai"
                  : "text-slate-700 hover:bg-slate-50 hover:text-ai",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Collapse
        </button>
      </div>
    </aside>
  );
}
