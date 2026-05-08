import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  Hospital,
  ShieldCheck,
  Timer,
  Users,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  directorBriefing,
  governanceBoundaries,
  operationalActions,
  sirirajProfile,
  sirirajSentinels,
  surgeForecast,
  thresholdMatrix,
} from "../data/sirirajSurgeData";
import type {
  OperationalActionPlan,
  SentinelId,
  SentinelOutput,
  SurgeAlertLevel,
  SurgeForecastPoint,
  Tone,
} from "../types";
import { StatusBadge } from "./StatusBadge";

interface SirirajSurgePageProps {
  onOpenActionBrief: () => void;
  onOpenNotifications: () => void;
}

const levelTone: Record<SurgeAlertLevel, Tone> = {
  green: "stable",
  amber: "warning",
  red: "critical",
  black: "critical",
};

const levelLabel: Record<SurgeAlertLevel, string> = {
  green: "Green",
  amber: "Amber",
  red: "Red",
  black: "Black",
};

export function SirirajSurgePage({ onOpenActionBrief, onOpenNotifications }: SirirajSurgePageProps) {
  const [selectedSentinelId, setSelectedSentinelId] = useState<SentinelId>("T6");
  const selectedSentinel =
    sirirajSentinels.find((sentinel) => sentinel.id === selectedSentinelId) ?? sirirajSentinels[5]!;
  const redSentinels = useMemo(
    () => sirirajSentinels.filter((sentinel) => sentinel.alertLevel === "red" || sentinel.alertLevel === "black"),
    [],
  );
  const selectedActions = operationalActions.filter((action) => action.sentinelId === selectedSentinel.id);

  return (
    <main className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-cyan-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label="Synthetic director simulation" tone="ai" />
              <StatusBadge label={sirirajProfile.simulationFrame} tone="neutral" />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Siriraj respiratory-surge command view
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {sirirajProfile.role}. {sirirajProfile.dataStatement}
            </p>
          </div>
          <div className="grid min-w-[240px] gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <InfoLine icon={<Hospital className="h-4 w-4" />} label={sirirajProfile.hospitalName} />
            <InfoLine icon={<Users className="h-4 w-4" />} label={sirirajProfile.bedCountLabel} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
        <div className="border-b border-red-100 bg-red-50/70 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={`T6 level ${levelLabel[directorBriefing.overallLevel]}`} tone="critical" />
              <StatusBadge label={`${Math.round(directorBriefing.confidenceScore * 100)}% confidence`} tone="ai" />
            </div>
            <button
              type="button"
              onClick={onOpenNotifications}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm"
            >
              <BellRing className="h-4 w-4" />
              Notification center
            </button>
          </div>
          <p className="mt-3 max-w-5xl text-lg font-semibold leading-7 text-slate-900">
            {directorBriefing.oneLine}
          </p>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-4">
          <StatusMetric label="Overall signal" value="RED" helper="Cross-process respiratory-surge pattern" tone="critical" />
          <StatusMetric label="Next predicted breach" value="18h" helper="Critical-care capacity" tone="critical" />
          <StatusMetric label="Oxygen redline" value="3.4d" helper="Forecast under current burn index" tone="high" />
          <StatusMetric label="Human validation" value="Due now" helper="Bed, oxygen, staffing, IPC, timestamps" tone="warning" />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle
            icon={<ClipboardList className="h-5 w-5" />}
            title="Director Briefing"
            helper="Required decisions are reversible first, senior authorization only where the report draws a hard boundary."
          />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <BriefColumn title="Top risks" items={directorBriefing.risks} tone="critical" />
            <BriefColumn title="Reversible actions now" items={directorBriefing.reversibleActions} tone="ai" />
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Senior authorization only
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {directorBriefing.seniorAuthorizationOnly.map((item) => (
                <StatusBadge key={item} label={item} tone="warning" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-amber-900">{directorBriefing.mandatoryRecheck}</p>
          </div>
        </section>

        <DeepInsightTrace onOpenActionBrief={onOpenActionBrief} />
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle
            icon={<Workflow className="h-5 w-5" />}
            title="T1-T8 Sentinel Mesh"
            helper="Compact cards show the mesh; selecting one opens the detailed operational evidence."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sirirajSentinels.map((sentinel) => (
              <SentinelButton
                key={sentinel.id}
                sentinel={sentinel}
                isSelected={selectedSentinel.id === sentinel.id}
                onClick={() => setSelectedSentinelId(sentinel.id)}
              />
            ))}
          </div>
        </div>

        <SentinelDetail
          sentinel={selectedSentinel}
          relatedActions={selectedActions}
          onOpenActionBrief={onOpenActionBrief}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <ForecastPanel />
        <NotificationEscalationPanel onOpenActionBrief={onOpenActionBrief} redSentinels={redSentinels} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle
          icon={<Timer className="h-5 w-5" />}
          title="Operational Action Plan"
          helper="Time windows and responsible roles are coordination prompts, not autonomous instructions."
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {operationalActions.map((action) => (
            <ActionPlanCard key={action.id} action={action} onOpenActionBrief={onOpenActionBrief} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <ThresholdMatrix />
        <GovernanceBoundaries />
      </section>
    </main>
  );
}

function DeepInsightTrace({ onOpenActionBrief }: { onOpenActionBrief: () => void }) {
  return (
    <section className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-5 shadow-sm">
      <SectionTitle
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Deep Insight Logic"
        helper="The report treats the surge as a cross-department process pattern, not a single crowded-room signal."
      />
      <div className="mt-4 space-y-3">
        <TraceRow label="Visible problem" text="ED front-door crowding, boarding, and respiratory/PUI waiting pressure." />
        <TraceRow label="Naive explanation" text="Too many respiratory arrivals arrived at once." />
        <TraceRow
          label="Actual cross-department cause"
          text="T1 arrivals, T2 diagnostic delay, T3 blocked beds, T5 oxygen/isolation pressure, and T8 referral delays are reinforcing one another."
        />
        <TraceRow
          label="Supporting evidence"
          text="Critical-care occupancy 99%, 49 discharge-ready patients blocked, oxygen burn index 188, and five abnormal signal families across six systems."
        />
        <TraceRow
          label="Uncertainty"
          text="T7 requires denominator and feed validation before irreversible action."
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenActionBrief}
          className="inline-flex items-center gap-2 rounded-lg bg-ai px-3 py-2 text-xs font-bold text-white shadow-sm"
        >
          <FileText className="h-4 w-4" />
          Add to brief
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-bold text-ai"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark reviewed
        </button>
      </div>
    </section>
  );
}

function SentinelButton({
  sentinel,
  isSelected,
  onClick,
}: {
  sentinel: SentinelOutput;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-36 rounded-lg border p-4 text-left transition",
        isSelected
          ? "border-cyan-300 bg-cyan-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{sentinel.id}</p>
          <h3 className="mt-1 text-sm font-bold leading-5 text-slate-900">{sentinel.shortName}</h3>
        </div>
        <StatusBadge label={levelLabel[sentinel.alertLevel]} tone={levelTone[sentinel.alertLevel]} size="sm" />
      </div>
      <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">{sentinel.summary}</p>
      <p className="mt-3 text-xs font-bold text-ai">{Math.round(sentinel.confidenceScore * 100)}% confidence</p>
    </button>
  );
}

function SentinelDetail({
  sentinel,
  relatedActions,
  onOpenActionBrief,
}: {
  sentinel: SentinelOutput;
  relatedActions: OperationalActionPlan[];
  onOpenActionBrief: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={sentinel.id} tone="ai" />
            <StatusBadge label={levelLabel[sentinel.alertLevel]} tone={levelTone[sentinel.alertLevel]} />
            <StatusBadge label={`${Math.round(sentinel.confidenceScore * 100)}% confidence`} tone="neutral" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-950">{sentinel.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{sentinel.summary}</p>
        </div>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          Updated {sentinel.lastUpdatedAt}
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <InsightBlock label="Current bottleneck" text={sentinel.currentBottleneck} />
        <InsightBlock label="Predicted next bottleneck" text={sentinel.predictedNextBottleneck} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sentinel.metrics.map((metric) => (
          <div key={metric.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold leading-5 text-slate-500">{metric.label}</p>
              <span className={["h-2.5 w-2.5 rounded-full", dotTone(metric.tone)].join(" ")} />
            </div>
            <p className="mt-2 text-xl font-bold text-slate-950">{metric.value}</p>
            {metric.baseline || metric.target ? (
              <p className="mt-1 text-xs font-medium text-slate-500">{metric.baseline ?? metric.target}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ListPanel title="Top signals" items={sentinel.topSignals} />
        <ListPanel title="Human checks" items={sentinel.humanChecks} />
        <ListPanel title="Recommended actions" items={sentinel.recommendedActions} />
      </div>

      {relatedActions.length ? (
        <div className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ai">Brief-ready action</p>
          {relatedActions.map((action) => (
            <div key={action.id} className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{action.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{action.verifyBeforeAction}</p>
              </div>
              <button
                type="button"
                onClick={onOpenActionBrief}
                className="inline-flex items-center gap-2 rounded-lg bg-ai px-3 py-2 text-xs font-bold text-white"
              >
                <FileText className="h-4 w-4" />
                Add to brief
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ForecastPanel() {
  const maxArrivals = Math.max(...surgeForecast.map((point) => point.respiratoryArrivals));
  const maxOxygen = Math.max(...surgeForecast.map((point) => point.oxygenBurnIndex));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle
        icon={<ArrowUpRight className="h-5 w-5" />}
        title="Resource Forecast"
        helper="Day 21 is the synthetic peak snapshot used by the report."
      />
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <th className="py-3 pr-4">Day</th>
              <th className="py-3 pr-4">Respiratory arrivals</th>
              <th className="py-3 pr-4">Synthetic positivity</th>
              <th className="py-3 pr-4">Admits</th>
              <th className="py-3 pr-4">ICU admits</th>
              <th className="py-3 pr-4">Beds</th>
              <th className="py-3 pr-4">Critical care</th>
              <th className="py-3 pr-4">Oxygen burn</th>
              <th className="py-3 pr-4">Staff absent</th>
              <th className="py-3">N95 days</th>
            </tr>
          </thead>
          <tbody>
            {surgeForecast.map((point) => (
              <ForecastRow key={point.day} point={point} maxArrivals={maxArrivals} maxOxygen={maxOxygen} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ForecastRow({
  point,
  maxArrivals,
  maxOxygen,
}: {
  point: SurgeForecastPoint;
  maxArrivals: number;
  maxOxygen: number;
}) {
  const peak = point.day === 21;
  return (
    <tr className={["border-b border-slate-100 last:border-b-0", peak ? "bg-red-50/60" : ""].join(" ")}>
      <td className="py-3 pr-4 font-bold text-slate-900">Day {point.day}</td>
      <td className="py-3 pr-4">
        <BarValue value={point.respiratoryArrivals} max={maxArrivals} suffix="/day" tone={peak ? "critical" : "ai"} />
      </td>
      <td className="py-3 pr-4 font-semibold text-slate-700">{point.positivityRate}%</td>
      <td className="py-3 pr-4 font-semibold text-slate-700">{point.covidAdmissions}/day</td>
      <td className="py-3 pr-4 font-semibold text-slate-700">{point.covidIcuAdmissions}/day</td>
      <td className="py-3 pr-4 font-semibold text-slate-700">{point.staffedBedOccupancy}%</td>
      <td className="py-3 pr-4 font-semibold text-slate-700">{point.criticalCareOccupancy}%</td>
      <td className="py-3 pr-4">
        <BarValue value={point.oxygenBurnIndex} max={maxOxygen} suffix="" tone={peak ? "critical" : "warning"} />
      </td>
      <td className="py-3 pr-4 font-semibold text-slate-700">{point.staffAbsenteeism}%</td>
      <td className="py-3 font-semibold text-slate-700">{point.n95DaysOnHand}</td>
    </tr>
  );
}

function NotificationEscalationPanel({
  onOpenActionBrief,
  redSentinels,
}: {
  onOpenActionBrief: () => void;
  redSentinels: SentinelOutput[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle
        icon={<BellRing className="h-5 w-5" />}
        title="Anomaly Escalation"
        helper="Notification levels follow the report language and avoid diagnostic claims."
      />
      <div className="mt-4 space-y-3">
        <EscalationRow
          level="Passive"
          title="Continuity watch item"
          text="T4 remains visible in the notification center only while follow-up gaps are amber."
          actionLabel="Mark reviewed"
          tone="neutral"
        />
        <EscalationRow
          level="Important"
          title="Unusual operational pattern above baseline"
          text="T1/T2/T3 red signals create a top banner and notification-center item with review suggested."
          actionLabel="Escalate"
          tone="warning"
        />
        <EscalationRow
          level="Escalation"
          title="Cross-process anomaly score 96"
          text={`${redSentinels.length} red sentinels are highlighted. Escalation recommended with an option to add to the action brief.`}
          actionLabel="Add to brief"
          tone="critical"
          onClick={onOpenActionBrief}
        />
      </div>
    </section>
  );
}

function ActionPlanCard({
  action,
  onOpenActionBrief,
}: {
  action: OperationalActionPlan;
  onOpenActionBrief: () => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <StatusBadge label={action.sentinelId} tone="ai" size="sm" />
          <h3 className="mt-3 text-base font-bold text-slate-950">{action.title}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">{action.timeWindow}</p>
        </div>
        <button
          type="button"
          onClick={onOpenActionBrief}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-bold text-ai"
        >
          <FileText className="h-4 w-4" />
          Add to brief
        </button>
      </div>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {action.actions.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-ai" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-lg border border-amber-100 bg-white p-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Verify first</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">{action.verifyBeforeAction}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {action.responsibleRoles.map((role) => (
          <StatusBadge key={role} label={role} tone="neutral" size="sm" />
        ))}
      </div>
    </article>
  );
}

function ThresholdMatrix() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Threshold Matrix"
        helper="The report separates amber, red, and black states so the UI can escalate without overclaiming."
      />
      <div className="mt-4 space-y-3">
        {thresholdMatrix.map((row) => (
          <div key={row.sentinelId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={row.sentinelId} tone="ai" size="sm" />
              <p className="text-sm font-bold text-slate-900">{row.sentinelName}</p>
            </div>
            <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 md:grid-cols-3">
              <ThresholdCell label="Amber" text={row.amber} tone="warning" />
              <ThresholdCell label="Red" text={row.red} tone="critical" />
              <ThresholdCell label="Black" text={row.black} tone="neutral" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GovernanceBoundaries() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle
        icon={<Database className="h-5 w-5" />}
        title="Safety Boundaries"
        helper="Coordina stays in operational coordination support and keeps humans accountable."
      />
      <div className="mt-4 space-y-3">
        {governanceBoundaries.map((boundary) => (
          <article key={boundary.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-950">{boundary.title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">{boundary.summary}</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">{boundary.requiredPractice}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ icon, title, helper }: { icon: ReactNode; title: string; helper: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-ai">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{helper}</p>
      </div>
    </div>
  );
}

function InfoLine({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-700">
      <span className="text-ai">{icon}</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function StatusMetric({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <span className={["h-2.5 w-2.5 rounded-full", dotTone(tone)].join(" ")} />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{helper}</p>
    </div>
  );
}

function BriefColumn({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <span className={["h-2.5 w-2.5 rounded-full", dotTone(tone)].join(" ")} />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TraceRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-cyan-100 bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ai">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function InsightBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ai" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarValue({
  value,
  max,
  suffix,
  tone,
}: {
  value: number;
  max: number;
  suffix: string;
  tone: Tone;
}) {
  const width = `${Math.max(8, Math.round((value / max) * 100))}%`;
  return (
    <div className="min-w-32">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-800">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div className={["h-2 rounded-full", barTone(tone)].join(" ")} style={{ width }} />
      </div>
    </div>
  );
}

function EscalationRow({
  level,
  title,
  text,
  actionLabel,
  tone,
  onClick,
}: {
  level: string;
  title: string;
  text: string;
  actionLabel: string;
  tone: Tone;
  onClick?: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <StatusBadge label={level} tone={tone} size="sm" />
          <h3 className="mt-2 text-sm font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
        </div>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function ThresholdCell({ label, text, tone }: { label: string; text: string; tone: Tone }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <div className="flex items-center gap-2">
        <span className={["h-2.5 w-2.5 rounded-full", dotTone(tone)].join(" ")} />
        <p className="font-bold text-slate-800">{label}</p>
      </div>
      <p className="mt-2 text-slate-600">{text}</p>
    </div>
  );
}

function dotTone(tone: Tone) {
  if (tone === "critical" || tone === "high") return "bg-red-500";
  if (tone === "warning" || tone === "moderate") return "bg-amber-500";
  if (tone === "ai") return "bg-ai";
  if (tone === "stable") return "bg-green-500";
  return "bg-slate-400";
}

function barTone(tone: Tone) {
  if (tone === "critical" || tone === "high") return "bg-red-500";
  if (tone === "warning" || tone === "moderate") return "bg-amber-500";
  if (tone === "ai") return "bg-ai";
  return "bg-slate-500";
}
