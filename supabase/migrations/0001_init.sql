-- DraftLoop v1 schema (demo-first, permissive RLS)

create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  brand_name text not null,
  voice_rules text,
  icp_description text,
  platform text default 'LinkedIn',
  guardrails text,
  score_threshold int default 70,
  created_at timestamptz not null default now()
);

create table if not exists content_pillars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  brand_profile_id uuid references brand_profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  raw_topic text not null,
  half_formed_hook text,
  pillar_id uuid references content_pillars(id) on delete set null,
  status text default 'idea',
  created_at timestamptz not null default now()
);

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  idea_id uuid references ideas(id) on delete cascade,
  platform text default 'LinkedIn',
  body_text text,
  framework_name text,
  framework_source text,
  framework_confidence numeric,
  framework_review_status text default 'unreviewed',
  framework_justification text,
  pain_driver text,
  pain_source text,
  pain_confidence numeric,
  pain_review_status text default 'unreviewed',
  status text default 'draft',
  variant_group_id uuid,
  scheduled_date date,
  published_date date,
  created_at timestamptz not null default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  draft_id uuid references drafts(id) on delete cascade,
  hook int default 0,
  specificity int default 0,
  proof int default 0,
  clarity int default 0,
  cta int default 0,
  fit_to_platform int default 0,
  shareability int default 0,
  total int default 0,
  passed boolean default false,
  source text default 'AI',
  confidence numeric,
  review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

-- RLS enable + permissive v1 policies
alter table brand_profiles enable row level security;
drop policy if exists "brand_profiles_v1_read" on brand_profiles;
create policy "brand_profiles_v1_read" on brand_profiles for select using (true);
drop policy if exists "brand_profiles_v1_write" on brand_profiles;
create policy "brand_profiles_v1_write" on brand_profiles for all using (true) with check (true);

alter table content_pillars enable row level security;
drop policy if exists "content_pillars_v1_read" on content_pillars;
create policy "content_pillars_v1_read" on content_pillars for select using (true);
drop policy if exists "content_pillars_v1_write" on content_pillars;
create policy "content_pillars_v1_write" on content_pillars for all using (true) with check (true);

alter table ideas enable row level security;
drop policy if exists "ideas_v1_read" on ideas;
create policy "ideas_v1_read" on ideas for select using (true);
drop policy if exists "ideas_v1_write" on ideas;
create policy "ideas_v1_write" on ideas for all using (true) with check (true);

alter table drafts enable row level security;
drop policy if exists "drafts_v1_read" on drafts;
create policy "drafts_v1_read" on drafts for select using (true);
drop policy if exists "drafts_v1_write" on drafts;
create policy "drafts_v1_write" on drafts for all using (true) with check (true);

alter table scores enable row level security;
drop policy if exists "scores_v1_read" on scores;
create policy "scores_v1_read" on scores for select using (true);
drop policy if exists "scores_v1_write" on scores;
create policy "scores_v1_write" on scores for all using (true) with check (true);

-- Seed data
insert into brand_profiles (brand_name, voice_rules, icp_description, platform, guardrails, score_threshold)
values
  ('DraftLoop Co.', 'Confident but not loud. Short sentences. Second person. One idea per post.', 'Solo founders and small marketing teams posting organic content on LinkedIn', 'LinkedIn', 'No clickbait. No emojis in the first line. Never promise something we can''t deliver in the post itself.', 70)
on conflict do nothing;

insert into content_pillars (brand_profile_id, name, description)
select bp.id, 'Content Systems', 'Repeatable frameworks for planning and producing content' from brand_profiles bp where bp.brand_name = 'DraftLoop Co.'
on conflict do nothing;

insert into content_pillars (brand_profile_id, name, description)
select bp.id, 'Audience Growth', 'Tactics for reaching and retaining the right audience' from brand_profiles bp where bp.brand_name = 'DraftLoop Co.'
on conflict do nothing;

insert into content_pillars (brand_profile_id, name, description)
select bp.id, 'Hook Writing', 'Crafting opening lines that stop the scroll' from brand_profiles bp where bp.brand_name = 'DraftLoop Co.'
on conflict do nothing;

insert into ideas (raw_topic, half_formed_hook, status)
values
  ('Why most content calendars fail', 'You built a calendar. You still post nothing. Here''s why.', 'idea'),
  ('The 3-line hook formula', 'Most hooks die in line 2. This formula fixes that.', 'idea'),
  ('How to repurpose one post for 3 platforms', 'One idea. Three platforms. Zero extra writing time.', 'idea')
on conflict do nothing;

insert into drafts (idea_id, platform, body_text, framework_name, framework_source, framework_confidence, framework_review_status, framework_justification, pain_driver, pain_source, pain_confidence, pain_review_status, status, scheduled_date)
select i.id, 'LinkedIn', 'You built a content calendar.

It''s beautiful. Color-coded. 30 days mapped out.

And you''ve posted twice this month.

The calendar isn''t the system. The calendar is the output of a system you don''t have yet.

What you need is a drafting engine: raw idea in, scored draft out. Every time.

Comment ENGINE and I''ll send you the breakdown.', 'PAS', 'AI', 0.88, 'unreviewed', 'PAS works because the audience feels the pain of an unused calendar acutely; agitating it before the solution creates tension that earns the scroll.', 'frustration of investing in planning tools that still produce zero output', 'AI', 0.85, 'unreviewed', 'scheduled', current_date + 3
from ideas i where i.raw_topic = 'Why most content calendars fail'
limit 1
on conflict do nothing;

insert into scores (draft_id, hook, specificity, proof, clarity, cta, fit_to_platform, shareability, total, passed, source, confidence, review_status)
select d.id, 8, 7, 6, 9, 8, 9, 7, 54, false, 'AI', 0.85, 'unreviewed'
from drafts d where d.body_text like 'You built a content calendar%' limit 1
on conflict do nothing;
