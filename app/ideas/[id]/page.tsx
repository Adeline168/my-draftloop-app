import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdeaById } from "@/lib/data/ideas";
import { getDraftsByIdeaId } from "@/lib/data/drafts";
import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { listContentPillars } from "@/lib/data/content-pillars";
import { getLatestScoresForDrafts } from "@/lib/data/scores";
import { IdeaEditForm } from "@/components/idea-edit-form";
import { GenerateDraftPanel } from "@/components/generate-draft-panel";
import { StatusBadge, ReadinessBadge } from "@/components/status-badge";

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = await getIdeaById(id);
  if (!idea) notFound();

  const [brand, drafts] = await Promise.all([getActiveBrandProfile(), getDraftsByIdeaId(id)]);
  const pillars = brand ? await listContentPillars(brand.id) : [];
  const scores = await getLatestScoresForDrafts(drafts.map((d) => d.id));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/ideas" className="text-sm text-neutral-500 hover:underline">
          ← Ideas
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{idea.raw_topic}</h1>
        <div className="mt-2">
          <StatusBadge status={idea.status} />
        </div>
      </div>

      <IdeaEditForm idea={idea} pillars={pillars} />

      <GenerateDraftPanel ideaId={idea.id} defaultPlatform={brand?.platform ?? "LinkedIn"} />

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Drafts from this idea</h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-neutral-500">No drafts yet. Generate one above.</p>
        ) : (
          <ul className="space-y-2">
            {drafts.map((draft) => {
              const score = scores[draft.id];
              return (
                <li key={draft.id}>
                  <Link
                    href={`/drafts/${draft.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-4 py-3 hover:border-neutral-300"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {draft.platform} · {draft.framework_name ?? "Manual draft"}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {draft.body_text?.slice(0, 80)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {score && <span className="text-xs text-neutral-500">{score.total}/70</span>}
                      {score && <ReadinessBadge passed={score.passed} />}
                      <StatusBadge status={draft.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
