import { listIdeas } from "@/lib/data/ideas";
import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { listContentPillars } from "@/lib/data/content-pillars";
import { AddIdeaForm } from "@/components/idea-form";
import { IdeaRow } from "@/components/idea-row";
import { EmptyState } from "@/components/empty-state";

export default async function IdeasPage() {
  let ideas: Awaited<ReturnType<typeof listIdeas>> = [];
  let pillars: Awaited<ReturnType<typeof listContentPillars>> = [];
  let loadError: string | null = null;

  try {
    const brand = await getActiveBrandProfile();
    [ideas, pillars] = await Promise.all([
      listIdeas(),
      brand ? listContentPillars(brand.id) : Promise.resolve([]),
    ]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load ideas";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ideas</h1>
          <p className="mt-1 text-sm text-neutral-500">Raw topics waiting to become drafts.</p>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t reach the database: {loadError}
        </div>
      ) : (
        <>
          <AddIdeaForm pillars={pillars} />

          {ideas.length === 0 ? (
            <EmptyState title="No ideas yet. Add your first raw topic." />
          ) : (
            <ul className="space-y-2">
              {ideas.map((idea) => (
                <IdeaRow key={idea.id} idea={idea} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
