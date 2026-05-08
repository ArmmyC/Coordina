import { Check, Clock3, Copy, FileText, GitBranch, RefreshCw, Save, ShieldCheck, Trash2 } from "lucide-react";
import type { BriefSnapshot, CareFlowInsight, SuggestedAction, Tone } from "../types";
import { minutesToHuman } from "../utils/insightEngine";
import { EvidenceChip } from "./EvidenceChip";
import { StatusBadge } from "./StatusBadge";

interface ActionBriefPageProps {
  currentInsight: CareFlowInsight;
  snapshots: BriefSnapshot[];
  selectedSnapshot?: BriefSnapshot;
  stagedActions: SuggestedAction[];
  briefReviewNeeded: boolean;
  onSelectSnapshot: (snapshotId: string) => void;
  onSaveBriefFromCurrent: () => void;
  onDuplicateBrief: (snapshotId: string) => void;
  onUpdateBriefFromCurrent: (snapshotId: string) => void;
  onKeepCurrentBrief: () => void;
  onMarkBriefReviewed: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  onRemoveStagedAction: (action: SuggestedAction) => void;
  onRemoveActionFromSnapshot: (snapshotId: string, actionId: string) => void;
}

export function ActionBriefPage({
  currentInsight,
  snapshots,
  selectedSnapshot,
  stagedActions,
  briefReviewNeeded,
  onSelectSnapshot,
  onSaveBriefFromCurrent,
  onDuplicateBrief,
  onUpdateBriefFromCurrent,
  onKeepCurrentBrief,
  onMarkBriefReviewed,
  onDeleteSnapshot,
  onRemoveStagedAction,
  onRemoveActionFromSnapshot,
}: ActionBriefPageProps) {
  return (
    <main className="space-y-5 px-4 py-5 sm:px-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-ai">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-ai">Snapshot-based handoff</p>
              <h1 className="mt-1 text-3xl font-bold text-ink">Action Brief</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Saved briefs are stable operational snapshots. They do not rewrite when the live Central AI insight
                changes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSaveBriefFromCurrent}
            className="inline-flex items-center gap-2 rounded-lg bg-ai px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
          >
            <Save className="h-4 w-4" />
            Save brief
          </button>
        </div>
      </section>

      {briefReviewNeeded ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-900">
                Central insight has changed materially since this brief was created.
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Review update or keep the current version for this handoff.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSnapshot ? (
                <button
                  type="button"
                  onClick={() => onUpdateBriefFromCurrent(selectedSnapshot.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-ai px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Review update
                </button>
              ) : null}
              <button
                type="button"
                onClick={onKeepCurrentBrief}
                className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
              >
                Keep current brief
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid items-start gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-ai" />
            <h2 className="text-base font-bold text-ink">Saved snapshots</h2>
          </div>
          <div className="mt-4 space-y-2">
            {snapshots.map((snapshot) => (
              <button
                key={snapshot.id}
                type="button"
                onClick={() => onSelectSnapshot(snapshot.id)}
                className={[
                  "w-full rounded-lg border p-3 text-left transition",
                  selectedSnapshot?.id === snapshot.id
                    ? "border-cyan-200 bg-cyan-50"
                    : "border-slate-200 bg-white hover:border-cyan-200",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{snapshot.title}</p>
                  <StatusBadge label={`v${snapshot.version}`} tone="neutral" size="sm" />
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">{snapshot.createdAt}</p>
                <div className="mt-2">
                  <StatusBadge label={snapshot.reviewStatus} tone={reviewTone(snapshot.reviewStatus)} size="sm" />
                </div>
              </button>
            ))}
          </div>
          {selectedSnapshot ? (
            <button
              type="button"
              onClick={() => onDeleteSnapshot(selectedSnapshot.id)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete selected snapshot
            </button>
          ) : null}
        </aside>

        <div className="space-y-5">
          {selectedSnapshot ? (
            <BriefDocument
              snapshot={selectedSnapshot}
              onDuplicateBrief={onDuplicateBrief}
              onUpdateBriefFromCurrent={onUpdateBriefFromCurrent}
              onMarkBriefReviewed={onMarkBriefReviewed}
              onDeleteSnapshot={onDeleteSnapshot}
              onRemoveActionFromSnapshot={onRemoveActionFromSnapshot}
            />
          ) : (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-slate-600">No saved brief selected.</p>
            </section>
          )}

          <CurrentInsightDraft
            currentInsight={currentInsight}
            stagedActions={stagedActions}
            onRemoveStagedAction={onRemoveStagedAction}
            onSave={onSaveBriefFromCurrent}
          />
        </div>
      </section>
    </main>
  );
}

function BriefDocument({
  snapshot,
  onDuplicateBrief,
  onUpdateBriefFromCurrent,
  onMarkBriefReviewed,
  onDeleteSnapshot,
  onRemoveActionFromSnapshot,
}: {
  snapshot: BriefSnapshot;
  onDuplicateBrief: (snapshotId: string) => void;
  onUpdateBriefFromCurrent: (snapshotId: string) => void;
  onMarkBriefReviewed: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  onRemoveActionFromSnapshot: (snapshotId: string, actionId: string) => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-bold text-ai">{snapshot.title}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Operational snapshot v{snapshot.version}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Generated {snapshot.createdAt} from Central AI insight updated {snapshot.sourceInsightUpdatedAt}
          </p>
        </div>
        <StatusBadge label={snapshot.reviewStatus} tone={reviewTone(snapshot.reviewStatus)} />
      </div>

      <section className="mt-5">
        <h3 className="text-xs font-bold uppercase text-slate-500">Source central insight</h3>
        <p className="mt-2 text-base font-bold text-ink">{snapshot.sourceInsightTitle}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{snapshot.summary}</p>
      </section>

      <section className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
        <div className="flex items-center gap-2 text-ai">
          <GitBranch className="h-5 w-5" />
          <h3 className="text-sm font-bold">Root cause summary</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-700">{snapshot.rootCauseSummary}</p>
      </section>

      <section className="mt-5">
        <h3 className="text-xs font-bold uppercase text-slate-500">Suggested follow-up actions</h3>
        <div className="mt-3 space-y-3">
          {snapshot.actions.map((action) => (
            <div key={action.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{action.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{action.briefText}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <StatusBadge label={action.impact} tone={action.impact === "High" ? "high" : "warning"} size="sm" />
                  <button
                    type="button"
                    onClick={() => onRemoveActionFromSnapshot(snapshot.id, action.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <EvidenceChip label={action.ownerRole} />
                <EvidenceChip label={`${action.affectedPatients} patients`} />
                <EvidenceChip label={`${minutesToHuman(action.estimatedTimeSavedMinutes)} potential time saved`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-ai">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="text-sm font-bold">Safety note</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-700">{snapshot.safetyNote}</p>
      </section>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => onDuplicateBrief(snapshot.id)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:text-ai"
        >
          <Copy className="h-4 w-4" />
          Duplicate brief
        </button>
        <button
          type="button"
          onClick={() => onUpdateBriefFromCurrent(snapshot.id)}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-bold text-ai transition hover:bg-cyan-50"
        >
          <RefreshCw className="h-4 w-4" />
          Update from current insight
        </button>
        <button
          type="button"
          onClick={() => onMarkBriefReviewed(snapshot.id)}
          className="inline-flex items-center gap-2 rounded-lg bg-ai px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
        >
          <Check className="h-4 w-4" />
          Mark brief reviewed
        </button>
        <button
          type="button"
          onClick={() => onDeleteSnapshot(snapshot.id)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete brief snapshot
        </button>
      </div>
    </article>
  );
}

function CurrentInsightDraft({
  currentInsight,
  stagedActions,
  onRemoveStagedAction,
  onSave,
}: {
  currentInsight: CareFlowInsight;
  stagedActions: SuggestedAction[];
  onRemoveStagedAction: (action: SuggestedAction) => void;
  onSave: () => void;
}) {
  const actionCountLabel =
    stagedActions.length > 0 ? `${stagedActions.length} staged action${stagedActions.length === 1 ? "" : "s"}` : "Top actions will be used";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ai">Current insight draft</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{currentInsight.mainBottleneck}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Save this as a new stable snapshot when the team is ready to use it for review or handoff.
          </p>
        </div>
        <StatusBadge label={actionCountLabel} tone="ai" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <EvidenceChip label={`Source updated ${currentInsight.lastUpdatedAt}`} />
        <EvidenceChip label={currentInsight.confidence} />
        <EvidenceChip label="Human review required" />
      </div>
      {stagedActions.length ? (
        <div className="mt-4 space-y-2">
          {stagedActions.map((action) => (
            <div key={action.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-ink">{action.title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{action.ownerRole}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveStagedAction(action)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove from draft
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onSave}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ai px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
      >
        <Save className="h-4 w-4" />
        Save brief from current insight
      </button>
    </section>
  );
}

function reviewTone(status: BriefSnapshot["reviewStatus"]): Tone {
  if (status === "Reviewed") {
    return "stable";
  }

  if (status === "Review requested") {
    return "warning";
  }

  if (status === "Draft") {
    return "neutral";
  }

  return "ai";
}
