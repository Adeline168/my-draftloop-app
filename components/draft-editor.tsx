"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { rescoreDraftAction, updateDraftTextAction } from "@/lib/actions/drafts";

export function DraftEditor({ draftId, initialText }: { draftId: string; initialText: string }) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [dirty, setDirty] = useState(false);
  const [savePending, startSave] = useTransition();
  const [scorePending, startScore] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleChange(value: string) {
    setText(value);
    setDirty(true);
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startSave(async () => {
      const result = await updateDraftTextAction(draftId, text);
      if (!result.ok) setError(result.error);
      else {
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function handleRescore() {
    setError(null);
    startScore(async () => {
      let result;
      if (dirty) {
        const saveResult = await updateDraftTextAction(draftId, text);
        if (!saveResult.ok) {
          setError(saveResult.error);
          return;
        }
        setDirty(false);
      }
      result = await rescoreDraftAction(draftId);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Draft text</h2>
        {saved && <span className="text-xs text-emerald-600">Saved</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm leading-relaxed focus:border-neutral-900 focus:outline-none"
      />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={savePending || !dirty}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {savePending ? "Saving…" : "Save text"}
        </button>
        <button
          onClick={handleRescore}
          disabled={scorePending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {scorePending ? "Scoring…" : "Re-score"}
        </button>
      </div>
    </div>
  );
}
