import Link from "next/link";
import { listDrafts } from "@/lib/data/drafts";
import { getLatestScoresForDrafts } from "@/lib/data/scores";
import { StatusBadge, ReadinessBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export default async function DraftsPage() {
  let drafts: Awaited<ReturnType<typeof listDrafts>> = [];
  let loadError: string | null = null;

  try {
    drafts = await listDrafts();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load drafts";
  }

  const scores = loadError ? {} : await getLatestScoresForDrafts(drafts.map((d) => d.id));

  const sorted = [...drafts].sort((a, b) => (scores[b.id]?.total ?? -1) - (scores[a.id]?.total ?? -1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
        <p className="mt-1 text-sm text-neutral-500">Ranked by total score.</p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t reach the database: {loadError}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No drafts yet. Generate one from an idea."
          action={
            <Link href="/ideas" className="text-sm font-medium text-neutral-900 underline underline-offset-2">
              Go to Ideas
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {sorted.map((draft) => {
            const score = scores[draft.id];
            return (
              <li key={draft.id}>
                <Link
                  href={`/drafts/${draft.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {draft.platform} · {draft.framework_name ?? "Manual draft"}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{draft.body_text?.slice(0, 100)}</p>
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
  );
}
