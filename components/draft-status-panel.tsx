"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteDraftAction, publishDraftAction, scheduleDraftAction } from "@/lib/actions/drafts";
import type { Draft } from "@/lib/types";

export function DraftStatusPanel({ draft }: { draft: Draft }) {
  const router = useRouter();
  const [date, setDate] = useState(draft.scheduled_date ?? "");
  const [schedulePending, startSchedule] = useTransition();
  const [publishPending, startPublish] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startSchedule(async () => {
      const result = await scheduleDraftAction(draft.id, date);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handlePublish() {
    setError(null);
    startPublish(async () => {
      const result = await publishDraftAction(draft.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this draft?")) return;
    startDelete(async () => {
      const result = await deleteDraftAction(draft.id);
      if (result.ok) router.push("/drafts");
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="font-semibold">Status</h2>

      <form onSubmit={handleSchedule} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Scheduled date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={schedulePending || !date}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {schedulePending ? "Saving…" : "Mark scheduled"}
        </button>
      </form>

      {draft.published_date && (
        <p className="text-sm text-neutral-500">Published on {draft.published_date}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
        <button
          onClick={handlePublish}
          disabled={publishPending || draft.status === "published"}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {publishPending ? "Saving…" : draft.status === "published" ? "Published" : "Mark published"}
        </button>
        <button
          onClick={handleDelete}
          disabled={deletePending}
          className="ml-auto text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          Delete draft
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
