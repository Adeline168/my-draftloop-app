import { callOpenAIJson } from "@/lib/ai/openai";
import type { ScoreDimension } from "@/lib/types";
import { SCORE_DIMENSIONS } from "@/lib/types";

const SYSTEM_PROMPT = `You are DraftLoop's scoring engine. Score the given social post body text on
exactly these 7 dimensions, each an integer 0-10: hook, specificity, proof, clarity, cta,
fit_to_platform, shareability. Score honestly based on the text as written.

Respond with ONLY a JSON object: { "scores": { "hook": number, "specificity": number, "proof": number,
"clarity": number, "cta": number, "fit_to_platform": number, "shareability": number } }`;

function clampScore(value: unknown): number {
  const n = Math.round(Number(value));
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(10, n));
}

// Used for the "Re-score" action after a human edits draft text — scores
// only, no framework/pain-driver regeneration (those stay as originally set).
export async function scoreDraftText(
  bodyText: string,
  platform: string,
): Promise<Record<ScoreDimension, number>> {
  const raw = await callOpenAIJson({
    system: SYSTEM_PROMPT,
    user: `Platform: ${platform}\n\nPost text:\n${bodyText}`,
  });

  const rawScores = (raw.scores as Record<string, unknown>) || {};
  const scores = {} as Record<ScoreDimension, number>;
  for (const dim of SCORE_DIMENSIONS) {
    scores[dim] = clampScore(rawScores[dim]);
  }
  return scores;
}
