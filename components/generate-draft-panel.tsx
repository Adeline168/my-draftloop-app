"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { generateDraftAction, createManualDraftAction } from "@/lib/actions/drafts";
import { PLATFORMS } from "@/lib/types";

export function GenerateDraftPanel({
  ideaId,
  defaultPlatform,
}: {
  ideaId: string;
  defaultPlatform: string;
}) {
  const router = useRouter();
  const [platform, setPlatform] = useState(defaultPlatform || PLATFORMS[0]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const [manualPending, startManualTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    setShowManual(false);
    startTransition(async () => {
      const result = await generateDraftAction(ideaId, platform);
      if (!result.ok) {
        setError(result.error);
        setShowManual(true);
      } else {
        router.push(`/drafts/${result.data.draftId}`);
      }
    });
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    startManualTransition(async () => {
      const result = await createManualDraftAction({ ideaId, platform, bodyText: manualText });
      if (result.ok) router.push(`/drafts/${result.data.draftId}`);
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="font-semibold">Generate a draft</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Generating… (up to 30s)" : "Generate Draft"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t generate draft. {error} You can write one manually below.
        </div>
      )}

      {showManual && (
        <form onSubmit={handleManualSubmit} className="space-y-2 border-t border-neutral-100 pt-4">
          <label className="block text-sm font-medium text-neutral-700">Write the draft manually</label>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={6}
            placeholder="Write your post here…"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={manualPending || !manualText.trim()}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            {manualPending ? "Saving…" : "Save manual draft"}
          </button>
        </form>
      )}
    </div>
  );
}
