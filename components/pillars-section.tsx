"use client";

import { useState, useTransition } from "react";
import { createPillarAction, deletePillarAction, updatePillarAction } from "@/lib/actions/brand";
import type { ContentPillar } from "@/lib/types";

export function PillarsSection({
  brandId,
  pillars,
}: {
  brandId: string | null;
  pillars: ContentPillar[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!brandId) {
      setError("Save the brand profile first.");
      return;
    }
    startTransition(async () => {
      const result = await createPillarAction({ brand_profile_id: brandId, name, description });
      if (!result.ok) setError(result.error);
      else {
        setName("");
        setDescription("");
      }
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-3 font-semibold">Content pillars</h2>

      {pillars.length === 0 ? (
        <p className="mb-4 text-sm text-neutral-500">No pillars yet. Add your first one below.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {pillars.map((pillar) => (
            <PillarRow key={pillar.id} pillar={pillar} />
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-2 border-t border-neutral-100 pt-4 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pillar name"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function PillarRow({ pillar }: { pillar: ContentPillar }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pillar.name);
  const [description, setDescription] = useState(pillar.description ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updatePillarAction(pillar.id, { name, description });
      if (result.ok) setEditing(false);
    });
  }

  function remove() {
    startTransition(async () => {
      await deletePillarAction(pillar.id);
    });
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{pillar.name}</p>
        {pillar.description && <p className="truncate text-xs text-neutral-500">{pillar.description}</p>}
      </div>
      <div className="flex shrink-0 gap-3 pl-3">
        <button onClick={() => setEditing(true)} className="text-xs font-medium text-neutral-600 hover:underline">
          Edit
        </button>
        <button onClick={remove} disabled={pending} className="text-xs font-medium text-red-600 hover:underline">
          Delete
        </button>
      </div>
    </li>
  );
}
