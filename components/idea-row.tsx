"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteIdeaAction } from "@/lib/actions/ideas";
import { StatusBadge } from "@/components/status-badge";
import type { Idea } from "@/lib/types";

export function IdeaRow({ idea }: { idea: Idea }) {
  const [pending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this idea and its drafts?")) return;
    startTransition(async () => {
      await deleteIdeaAction(idea.id);
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-neutral-300">
      <Link href={`/ideas/${idea.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{idea.raw_topic}</p>
        {idea.half_formed_hook && (
          <p className="truncate text-xs text-neutral-500">{idea.half_formed_hook}</p>
        )}
      </Link>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={idea.status} />
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
