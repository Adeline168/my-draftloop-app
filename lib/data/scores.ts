import { createClient } from "@/lib/supabase/server";
import type { Score, ScoreDimension, ScoreSource } from "@/lib/types";
import { SCORE_DIMENSIONS } from "@/lib/types";

export async function getLatestScoreForDraft(draftId: string): Promise<Score | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("draft_id", draftId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load score: ${error.message}`);
  return data as Score | null;
}

export async function getLatestScoresForDrafts(draftIds: string[]): Promise<Record<string, Score>> {
  if (draftIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .in("draft_id", draftIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load scores: ${error.message}`);
  const byDraft: Record<string, Score> = {};
  for (const row of (data ?? []) as Score[]) {
    // first hit per draft_id is the latest, since ordered desc
    if (!byDraft[row.draft_id]) byDraft[row.draft_id] = row;
  }
  return byDraft;
}

export interface CreateScoreInput {
  draft_id: string;
  values: Record<ScoreDimension, number>;
  threshold: number;
  source: ScoreSource;
  confidence?: number | null;
}

export function computeTotal(values: Record<ScoreDimension, number>): number {
  return SCORE_DIMENSIONS.reduce((sum, dim) => sum + (values[dim] ?? 0), 0);
}

export async function createScore(input: CreateScoreInput): Promise<Score> {
  const supabase = await createClient();
  const total = computeTotal(input.values);
  const passed = total >= input.threshold;

  const { data, error } = await supabase
    .from("scores")
    .insert({
      draft_id: input.draft_id,
      ...input.values,
      total,
      passed,
      source: input.source,
      confidence: input.confidence ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create score: ${error.message}`);
  return data as Score;
}
