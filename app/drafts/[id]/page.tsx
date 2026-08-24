import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraftById } from "@/lib/data/drafts";
import { getIdeaById } from "@/lib/data/ideas";
import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { getLatestScoreForDraft } from "@/lib/data/scores";
import { DraftEditor } from "@/components/draft-editor";
import { DraftStatusPanel } from "@/components/draft-status-panel";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { StatusBadge } from "@/components/status-badge";

export default async function DraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await getDraftById(id);
  if (!draft) notFound();

  const [idea, brand, score] = await Promise.all([
    getIdeaById(draft.idea_id),
    getActiveBrandProfile(),
    getLatestScoreForDraft(draft.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        {idea && (
          <Link href={`/ideas/${idea.id}`} className="text-sm text-neutral-500 hover:underline">
            ← {idea.raw_topic}
          </Link>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{draft.platform} draft</h1>
          <StatusBadge status={draft.status} />
        </div>
      </div>

      {(draft.framework_name || draft.pain_driver) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {draft.framework_name && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-1 font-semibold">Framework: {draft.framework_name}</h2>
              <p className="text-sm text-neutral-600">{draft.framework_justification}</p>
            </div>
          )}
          {draft.pain_driver && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-1 font-semibold">Pain driver</h2>
              <p className="text-sm text-neutral-600">{draft.pain_driver}</p>
            </div>
          )}
        </div>
      )}

      <DraftEditor draftId={draft.id} initialText={draft.body_text ?? ""} />

      {score ? (
        <ScoreBreakdown score={score} threshold={brand?.score_threshold ?? 70} />
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-500">
          Not scored yet. Click <span className="font-medium">Re-score</span> above to run the
          7-dimension score.
        </div>
      )}

      <DraftStatusPanel draft={draft} />
    </div>
  );
}
