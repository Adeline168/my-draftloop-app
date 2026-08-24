import Link from "next/link";
import { listDraftsWithDates } from "@/lib/data/drafts";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export default async function CalendarPage() {
  let drafts: Awaited<ReturnType<typeof listDraftsWithDates>> = [];
  let loadError: string | null = null;

  try {
    drafts = await listDraftsWithDates();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load calendar";
  }

  const scheduled = drafts
    .filter((d) => d.status === "scheduled" && d.scheduled_date)
    .sort((a, b) => (a.scheduled_date! < b.scheduled_date! ? -1 : 1));
  const published = drafts
    .filter((d) => d.status === "published" && d.published_date)
    .sort((a, b) => (a.published_date! > b.published_date! ? -1 : 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-neutral-500">Drafts by scheduled and published date.</p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t reach the database: {loadError}
        </div>
      ) : drafts.length === 0 ? (
        <EmptyState title="Nothing scheduled." />
      ) : (
        <>
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 font-semibold">Scheduled</h2>
            {scheduled.length === 0 ? (
              <p className="text-sm text-neutral-500">Nothing scheduled.</p>
            ) : (
              <ul className="space-y-2">
                {scheduled.map((draft) => (
                  <li key={draft.id}>
                    <Link
                      href={`/drafts/${draft.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-4 py-3 hover:border-neutral-300"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{draft.scheduled_date}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {draft.platform} · {draft.body_text?.slice(0, 80)}
                        </p>
                      </div>
                      <StatusBadge status={draft.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 font-semibold">Published</h2>
            {published.length === 0 ? (
              <p className="text-sm text-neutral-500">Nothing published yet.</p>
            ) : (
              <ul className="space-y-2">
                {published.map((draft) => (
                  <li key={draft.id}>
                    <Link
                      href={`/drafts/${draft.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-4 py-3 hover:border-neutral-300"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{draft.published_date}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {draft.platform} · {draft.body_text?.slice(0, 80)}
                        </p>
                      </div>
                      <StatusBadge status={draft.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
