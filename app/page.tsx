import Link from "next/link";
import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { listIdeas } from "@/lib/data/ideas";
import { listDrafts, listDraftsWithDates } from "@/lib/data/drafts";
import { getLatestScoresForDrafts } from "@/lib/data/scores";
import { StatusBadge } from "@/components/status-badge";

export default async function DashboardPage() {
  let loadError: string | null = null;
  let brand = null as Awaited<ReturnType<typeof getActiveBrandProfile>> | null;
  let ideas: Awaited<ReturnType<typeof listIdeas>> = [];
  let drafts: Awaited<ReturnType<typeof listDrafts>> = [];
  let upcoming: Awaited<ReturnType<typeof listDraftsWithDates>> = [];

  try {
    [brand, ideas, drafts, upcoming] = await Promise.all([
      getActiveBrandProfile(),
      listIdeas(),
      listDrafts(),
      listDraftsWithDates(),
    ]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load dashboard data";
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Couldn&apos;t reach the database: {loadError}
      </div>
    );
  }

  const scores = await getLatestScoresForDrafts(drafts.map((d) => d.id));
  const readyDrafts = drafts.filter((d) => scores[d.id]?.passed).length;
  const scheduledCount = upcoming.filter((d) => d.status === "scheduled").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {brand ? `Building for ${brand.brand_name}` : "No brand profile set up yet."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Ideas in backlog" value={ideas.length} href="/ideas" />
        <StatCard label="Drafts" value={drafts.length} href="/drafts" />
        <StatCard label="Ready drafts" value={readyDrafts} href="/drafts" />
        <StatCard label="Scheduled" value={scheduledCount} href="/calendar" />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Start the loop</h2>
          <Link href="/ideas" className="text-sm font-medium text-neutral-900 underline underline-offset-2">
            Go to Ideas
          </Link>
        </div>
        <p className="text-sm text-neutral-500">
          Add a raw idea, pick a platform, and click Generate Draft — you&apos;ll get a
          platform-native draft with a named framework, pain driver, and 7-dimension score in
          under a minute.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Recent ideas</h2>
        {ideas.length === 0 ? (
          <p className="text-sm text-neutral-500">No ideas yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {ideas.slice(0, 5).map((idea) => (
              <li key={idea.id} className="flex items-center justify-between py-2.5">
                <Link href={`/ideas/${idea.id}`} className="truncate text-sm hover:underline">
                  {idea.raw_topic}
                </Link>
                <StatusBadge status={idea.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300"
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </Link>
  );
}
