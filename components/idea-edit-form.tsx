"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteIdeaAction, updateIdeaAction } from "@/lib/actions/ideas";
import type { ContentPillar, Idea } from "@/lib/types";

export function IdeaEditForm({ idea, pillars }: { idea: Idea; pillars: ContentPillar[] }) {
  const router = useRouter();
  const [topic, setTopic] = useState(idea.raw_topic);
  const [hook, setHook] = useState(idea.half_formed_hook ?? "");
  const [pillarId, setPillarId] = useState(idea.pillar_id ?? "");
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateIdeaAction(idea.id, {
        raw_topic: topic,
        half_formed_hook: hook,
        pillar_id: pillarId || null,
      });
      if (!result.ok) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this idea and all its drafts?")) return;
    startDeleteTransition(async () => {
      const result = await deleteIdeaAction(idea.id);
      if (result.ok) router.push("/ideas");
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Raw topic</label>
        <input
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Half-formed hook</label>
        <input
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>
      {pillars.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Content pillar</label>
          <select
            value={pillarId}
            onChange={(e) => setPillarId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          >
            <option value="">None</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          Delete idea
        </button>
      </div>
    </form>
  );
}
