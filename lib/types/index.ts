// Shared domain types for DraftLoop — mirrors supabase/migrations/0001_init.sql

export type IdeaStatus = "idea" | "drafted" | "scored" | "scheduled" | "published";
export type DraftStatus = "draft" | "scored" | "scheduled" | "published";
export type ReviewStatus = "unreviewed" | "reviewed";
export type ScoreSource = "AI" | "manual";

export interface BrandProfile {
  id: string;
  user_id: string | null;
  brand_name: string;
  voice_rules: string | null;
  icp_description: string | null;
  platform: string;
  guardrails: string | null;
  score_threshold: number;
  created_at: string;
}

export interface ContentPillar {
  id: string;
  user_id: string | null;
  brand_profile_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Idea {
  id: string;
  user_id: string | null;
  raw_topic: string;
  half_formed_hook: string | null;
  pillar_id: string | null;
  status: IdeaStatus;
  created_at: string;
}

export interface Draft {
  id: string;
  user_id: string | null;
  idea_id: string;
  platform: string;
  body_text: string | null;
  framework_name: string | null;
  framework_source: string | null;
  framework_confidence: number | null;
  framework_review_status: ReviewStatus;
  framework_justification: string | null;
  pain_driver: string | null;
  pain_source: string | null;
  pain_confidence: number | null;
  pain_review_status: ReviewStatus;
  status: DraftStatus;
  variant_group_id: string | null;
  scheduled_date: string | null;
  published_date: string | null;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string | null;
  draft_id: string;
  hook: number;
  specificity: number;
  proof: number;
  clarity: number;
  cta: number;
  fit_to_platform: number;
  shareability: number;
  total: number;
  passed: boolean;
  source: ScoreSource;
  confidence: number | null;
  review_status: ReviewStatus;
  created_at: string;
}

export const SCORE_DIMENSIONS = [
  "hook",
  "specificity",
  "proof",
  "clarity",
  "cta",
  "fit_to_platform",
  "shareability",
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export interface GeneratedDraftPayload {
  pain_driver: string;
  framework: string;
  framework_reason: string;
  hook: string;
  body: string;
  cta: string;
  scores: Record<ScoreDimension, number>;
}

export const PLATFORMS = [
  "LinkedIn",
  "Twitter/X",
  "Instagram",
  "Facebook",
  "TikTok",
] as const;

export type Platform = (typeof PLATFORMS)[number];
