"use client";

import { useState, useTransition } from "react";
import { createIdeaAction } from "@/lib/actions/ideas";
import type { ContentPillar } from "@/lib/types";

export function AddIdeaForm({ pillars }: { pillars: ContentPillar[] }) {
  const [topic, setTopic] = useState("");
  const [hook, setHook] = useState("");
  const [pillarId, setPillarId] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createIdeaAction({
        raw_topic: topic,
        half_formed_hook: hook,
        pillar_id: pillarId || null,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        setTopic("");
        setHook("");
        setPillarId("");
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        + Add idea
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Raw topic</label>
        <input
          required
          autoFocus
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Why most content calendars fail"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Half-formed hook (optional)</label>
        <input
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          placeholder="You built a calendar. You still post nothing."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>
      {pillars.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Content pillar (optional)</label>
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
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !topic.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add idea"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
