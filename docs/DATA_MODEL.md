# Data Model

## brand_profiles
- id: uuid pk
- user_id: uuid (nullable)
- brand_name: text
- voice_rules: text
- icp_description: text
- platform: text (single active platform v1)
- guardrails: text
- score_threshold: int (default 70)
- created_at: timestamptz

## content_pillars
- id: uuid pk
- user_id: uuid (nullable)
- brand_profile_id: uuid → brand_profiles
- name: text
- description: text
- created_at: timestamptz

## ideas
- id: uuid pk
- user_id: uuid (nullable)
- raw_topic: text
- half_formed_hook: text
- pillar_id: uuid → content_pillars (nullable)
- status: text default 'idea' (idea→drafted→scored→scheduled→published)
- created_at: timestamptz

## drafts
- id: uuid pk
- user_id: uuid (nullable)
- idea_id: uuid → ideas
- platform: text
- body_text: text
- framework_name: text (AI; +source, +confidence, +review_status)
- framework_justification: text (AI; +source, +confidence, +review_status)
- pain_driver: text (AI; +source, +confidence, +review_status)
- status: text default 'draft'
- variant_group_id: uuid (nullable; links platform variants)
- scheduled_date: date (nullable)
- published_date: date (nullable)
- created_at: timestamptz

## scores
- id: uuid pk
- draft_id: uuid → drafts
- hook: int (0-10)
- specificity: int (0-10)
- proof: int (0-10)
- clarity: int (0-10)
- cta: int (0-10)
- fit_to_platform: int (0-10)
- shareability: int (0-10)
- total: int (0-70, computed)
- passed: boolean (derived from total vs threshold)
- source: text (AI or manual)
- confidence: numeric
- review_status: text default 'unreviewed'
- created_at: timestamptz

## Notes
- All AI fields: value + source + confidence + review_status stored.
- RLS v1: permissive (demo-first). Lock-down sprint replaces with `auth.uid() = user_id`.
- `drafts.variant_group_id` — secondary, used later for multi-platform linking. Created in v1 schema for forward-compat.
