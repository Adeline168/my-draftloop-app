"use server";

import { revalidatePath } from "next/cache";
import { createIdea, deleteIdea, updateIdea } from "@/lib/data/ideas";
import type { ActionResult } from "@/lib/actions/brand";

export async function createIdeaAction(input: {
  raw_topic: string;
  half_formed_hook?: string;
  pillar_id?: string | null;
}): Promise<ActionResult> {
  try {
    if (!input.raw_topic.trim()) return { ok: false, error: "Topic is required" };
    await createIdea({
      raw_topic: input.raw_topic.trim(),
      half_formed_hook: input.half_formed_hook?.trim() || null,
      pillar_id: input.pillar_id || null,
    });
    revalidatePath("/ideas");
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create idea" };
  }
}

export async function updateIdeaAction(
  id: string,
  input: { raw_topic: string; half_formed_hook?: string; pillar_id?: string | null },
): Promise<ActionResult> {
  try {
    if (!input.raw_topic.trim()) return { ok: false, error: "Topic is required" };
    await updateIdea(id, {
      raw_topic: input.raw_topic.trim(),
      half_formed_hook: input.half_formed_hook?.trim() || null,
      pillar_id: input.pillar_id || null,
    });
    revalidatePath("/ideas");
    revalidatePath(`/ideas/${id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update idea" };
  }
}

export async function deleteIdeaAction(id: string): Promise<ActionResult> {
  try {
    await deleteIdea(id);
    revalidatePath("/ideas");
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete idea" };
  }
}
