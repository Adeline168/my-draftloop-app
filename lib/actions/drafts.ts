"use server";

import { revalidatePath } from "next/cache";
import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { getIdeaById, updateIdea } from "@/lib/data/ideas";
import { createDraft, deleteDraft, getDraftById, updateDraft } from "@/lib/data/drafts";
import { createScore } from "@/lib/data/scores";
import { generateDraft, assembleBodyText } from "@/lib/ai/generate-draft";
import { scoreDraftText } from "@/lib/ai/score-draft";
import { AIError } from "@/lib/ai/openai";
import type { ActionResult } from "@/lib/actions/brand";

// AI-provided per-field confidence isn't modeled by the generation prompt
// (only overall scores are), so framework/pain fields get a fixed heuristic
// confidence when AI-sourced, per the DATA_MODEL's value+source+confidence shape.
const AI_FIELD_CONFIDENCE = 0.8;

// The core loop: idea + platform in → generated, scored, persisted draft out.
export async function generateDraftAction(
  ideaId: string,
  platform: string,
): Promise<ActionResult<{ draftId: string }>> {
  try {
    const [idea, brand] = await Promise.all([getIdeaById(ideaId), getActiveBrandProfile()]);
    if (!idea) return { ok: false, error: "Idea not found" };
    if (!brand) return { ok: false, error: "No brand profile found. Set one up first." };

    let payload;
    try {
      payload = await generateDraft(brand, idea, platform);
    } catch (err) {
      const message =
        err instanceof AIError
          ? err.message
          : "Couldn't generate draft. You can write one manually below.";
      return { ok: false, error: message };
    }

    const draft = await createDraft({
      idea_id: idea.id,
      platform,
      body_text: assembleBodyText(payload),
      framework_name: payload.framework,
      framework_source: "AI",
      framework_confidence: AI_FIELD_CONFIDENCE,
      framework_justification: payload.framework_reason,
      pain_driver: payload.pain_driver,
      pain_source: "AI",
      pain_confidence: AI_FIELD_CONFIDENCE,
      status: "scored",
    });

    await createScore({
      draft_id: draft.id,
      values: payload.scores,
      threshold: brand.score_threshold,
      source: "AI",
      confidence: AI_FIELD_CONFIDENCE,
    });

    await updateIdea(idea.id, { status: "scored" });

    revalidatePath("/ideas");
    revalidatePath(`/ideas/${idea.id}`);
    revalidatePath("/drafts");
    revalidatePath(`/drafts/${draft.id}`);
    revalidatePath("/");

    return { ok: true, data: { draftId: draft.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to generate draft" };
  }
}

// Fallback path when AI generation fails: the user writes the post by hand.
export async function createManualDraftAction(input: {
  ideaId: string;
  platform: string;
  bodyText: string;
}): Promise<ActionResult<{ draftId: string }>> {
  try {
    if (!input.bodyText.trim()) return { ok: false, error: "Draft text is required" };
    const draft = await createDraft({
      idea_id: input.ideaId,
      platform: input.platform,
      body_text: input.bodyText.trim(),
      status: "draft",
    });
    await updateIdea(input.ideaId, { status: "drafted" });

    revalidatePath("/ideas");
    revalidatePath(`/ideas/${input.ideaId}`);
    revalidatePath("/drafts");
    revalidatePath("/");

    return { ok: true, data: { draftId: draft.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create draft" };
  }
}

export async function updateDraftTextAction(
  draftId: string,
  bodyText: string,
): Promise<ActionResult> {
  try {
    if (!bodyText.trim()) return { ok: false, error: "Draft text can't be empty" };
    await updateDraft(draftId, { body_text: bodyText.trim() });
    revalidatePath(`/drafts/${draftId}`);
    revalidatePath("/drafts");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save draft" };
  }
}

// Re-runs the 7-dimension score against the current (possibly hand-edited) body text.
export async function rescoreDraftAction(draftId: string): Promise<ActionResult> {
  try {
    const draft = await getDraftById(draftId);
    if (!draft) return { ok: false, error: "Draft not found" };
    if (!draft.body_text) return { ok: false, error: "Draft has no text to score yet" };

    const brand = await getActiveBrandProfile();
    const threshold = brand?.score_threshold ?? 70;

    let scores;
    try {
      scores = await scoreDraftText(draft.body_text, draft.platform);
    } catch (err) {
      const message =
        err instanceof AIError ? err.message : "Couldn't score draft. Try again shortly.";
      return { ok: false, error: message };
    }

    await createScore({
      draft_id: draftId,
      values: scores,
      threshold,
      source: "AI",
      confidence: AI_FIELD_CONFIDENCE,
    });

    if (draft.status === "draft") {
      await updateDraft(draftId, { status: "scored" });
      await updateIdea(draft.idea_id, { status: "scored" });
    }

    revalidatePath(`/drafts/${draftId}`);
    revalidatePath("/drafts");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to re-score draft" };
  }
}

export async function scheduleDraftAction(
  draftId: string,
  date: string,
): Promise<ActionResult> {
  try {
    if (!date) return { ok: false, error: "Pick a date" };
    const draft = await updateDraft(draftId, { status: "scheduled", scheduled_date: date });
    await updateIdea(draft.idea_id, { status: "scheduled" });

    revalidatePath(`/drafts/${draftId}`);
    revalidatePath("/drafts");
    revalidatePath("/calendar");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to schedule draft" };
  }
}

export async function publishDraftAction(draftId: string): Promise<ActionResult> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const draft = await updateDraft(draftId, { status: "published", published_date: today });
    await updateIdea(draft.idea_id, { status: "published" });

    revalidatePath(`/drafts/${draftId}`);
    revalidatePath("/drafts");
    revalidatePath("/calendar");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to publish draft" };
  }
}

export async function deleteDraftAction(draftId: string): Promise<ActionResult> {
  try {
    await deleteDraft(draftId);
    revalidatePath("/drafts");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete draft" };
  }
}
