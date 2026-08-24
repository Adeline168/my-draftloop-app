import { callOpenAIJson } from "@/lib/ai/openai";
import type { BrandProfile, GeneratedDraftPayload, Idea, ScoreDimension } from "@/lib/types";
import { SCORE_DIMENSIONS } from "@/lib/types";

const SYSTEM_PROMPT = `You are DraftLoop's drafting engine. You turn a raw content idea into a
platform-native, scored social post for a specific brand.

Process, in order:
1. Run a Pain Depth Engine pass: identify the specific emotional driver behind the idea before
   writing anything — the real pain/fear/desire the reader has, stated concretely (not generic).
2. Pick ONE named copywriting framework (e.g. PAS, AIDA, BAB, 4Ps, Problem-Agitate-Solve, Listicle,
   Storytelling, Question-Hook) that best fits this pain driver and platform, and justify why.
3. Write a platform-native draft using that framework: a hook, a body, and a CTA, in the brand's voice,
   respecting its guardrails.
4. Self-score the draft on exactly these 7 dimensions, each an integer 0-10: hook, specificity, proof,
   clarity, cta, fit_to_platform, shareability. Score honestly — most first-pass drafts should NOT max
   out every dimension.

Respond with ONLY a JSON object matching this exact shape, no extra keys, no markdown:
{
  "pain_driver": string,
  "framework": string,
  "framework_reason": string,
  "hook": string,
  "body": string,
  "cta": string,
  "scores": {
    "hook": number, "specificity": number, "proof": number, "clarity": number,
    "cta": number, "fit_to_platform": number, "shareability": number
  }
}`;

function buildUserPrompt(brand: BrandProfile, idea: Idea, platform: string): string {
  return [
    `## Brand Profile`,
    `Name: ${brand.brand_name}`,
    `Voice rules: ${brand.voice_rules || "(none specified)"}`,
    `ICP: ${brand.icp_description || "(none specified)"}`,
    `Guardrails: ${brand.guardrails || "(none specified)"}`,
    ``,
    `## Target Platform`,
    platform,
    ``,
    `## Raw Idea`,
    `Topic: ${idea.raw_topic}`,
    idea.half_formed_hook ? `Half-formed hook: ${idea.half_formed_hook}` : "",
    ``,
    `Write the draft now.`,
  ]
    .filter(Boolean)
    .join("\n");
}

function clampScore(value: unknown): number {
  const n = Math.round(Number(value));
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(10, n));
}

export async function generateDraft(
  brand: BrandProfile,
  idea: Idea,
  platform: string,
): Promise<GeneratedDraftPayload> {
  const raw = await callOpenAIJson({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(brand, idea, platform),
  });

  const rawScores = (raw.scores as Record<string, unknown>) || {};
  const scores = {} as Record<ScoreDimension, number>;
  for (const dim of SCORE_DIMENSIONS) {
    scores[dim] = clampScore(rawScores[dim]);
  }

  const body = typeof raw.body === "string" ? raw.body : "";
  const hook = typeof raw.hook === "string" ? raw.hook : "";
  const cta = typeof raw.cta === "string" ? raw.cta : "";

  return {
    pain_driver: typeof raw.pain_driver === "string" ? raw.pain_driver : "Unspecified",
    framework: typeof raw.framework === "string" ? raw.framework : "Unspecified",
    framework_reason:
      typeof raw.framework_reason === "string" ? raw.framework_reason : "",
    hook,
    body,
    cta,
    scores,
  };
}

// Assembles the full post body from hook + body + cta so it reads as one
// platform-native post, the way a human would paste it.
export function assembleBodyText(payload: GeneratedDraftPayload): string {
  return [payload.hook, payload.body, payload.cta].filter(Boolean).join("\n\n");
}
