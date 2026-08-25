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
  business_identity: string | null;
  objections_notes: string | null;
  founder_story: string | null;
  created_at: string;
}

export type BrandFileSection = "business_identity" | "objections" | "founder_story";

export const BRAND_FILE_SECTIONS: { key: BrandFileSection; label: string; helper: string }[] = [
  {
    key: "business_identity",
    label: "Business identity",
    helper: "Positioning, mission, what makes you different.",
  },
  {
    key: "objections",
    label: "Objections",
    helper: "Common pushback and how you respond to it.",
  },
  {
    key: "founder_story",
    label: "Founder story",
    helper: "Your journey — fuel for storytelling frameworks.",
  },
];

export type ExtractionStatus = "pending" | "done" | "failed" | "unsupported";

export interface BrandFile {
  id: string;
  user_id: string | null;
  brand_profile_id: string;
  section: BrandFileSection;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  extracted_text: string | null;
  extraction_status: ExtractionStatus;
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
