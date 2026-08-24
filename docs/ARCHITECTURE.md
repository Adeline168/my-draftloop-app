# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres + RLS) + Vercel. AI via OpenAI API (server-side only).

## Build Sequence
**Now:** Brand profile, idea backlog, core draft loop with scoring (one platform, no login wall).
**Next:** Variant linking, calendar view, multi-platform expansion.
**Later:** Multi-brand switching, lock-down auth + RLS, analytics manual entry, export.

## Key User Action Flow (Core Loop)
1. User adds raw idea to backlog.
2. User selects idea + target platform → "Generate Draft."
3. Server reads brand profile + idea → AI runs Pain Depth Engine → AI writes platform-native draft using a named copywriting framework.
4. AI applies 7-dimension self-score.
5. Draft + score + framework justification persisted to DB.
6. UI shows draft, score breakdown, and readiness status.
7. User edits draft → can re-score → marks scheduled/published.

## Responsive Nav Shell
Persistent left sidebar on desktop (Ideas, Drafts, Calendar, Brand Profile), collapses to hamburger on mobile.

## Layer Plan
1. **Data layer** (`lib/data/`) — all DB reads/writes (Supabase queries, typed functions).
2. **App logic** (`lib/actions/`) — server actions for CRUD, status transitions, scoring rules.
3. **AI module** (`lib/ai/`) — prompt building, draft generation, scoring calls.

## Why Core Runs Without AI
Ideas, drafts, scores, status transitions, brand profile, and calendar are all plain DB CRUD. The AI generation step is the only piece that calls an external API — if it fails, the user can write a draft manually and score it themselves. The pipeline, storage, scoring display, and status flow are all coded logic.

## Repo Structure
```
app/            # routes/pages (feature-oriented folders)
  ideas/
  drafts/
  calendar/
  brand/
components/     # shared UI
lib/data/        # data-access layer
lib/actions/     # server actions
lib/ai/          # AI generation + scoring
lib/types/       # shared types
tests/           # beside features
supabase/migrations/
```

## Module Map
| Module | Responsibility | Data owned | Build order |
|--------|---------------|------------|-------------|
| Brand Profile | Store/serve brand config | brand_profiles, content_pillars | 1 |
| Ideas | Backlog CRUD | ideas | 2 |
| Draft Engine | Generate + score drafts | drafts, scores | 3 |
| Variants | Link platform variants | draft_variants | later |
| Calendar | Date-based view | drafts (date fields) | 4 |
| Auth | Lock-down RLS | all tables | later |
