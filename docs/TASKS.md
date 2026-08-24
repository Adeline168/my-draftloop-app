# Tasks

## Sprint 1 — Database + Brand Profile + Ideas
**Goal:** Data layer and two core CRUD surfaces working, no login wall.
- [ ] Migration SQL applied (brand_profiles, content_pillars, ideas, drafts, scores + permissive RLS + seed data).
- [ ] `lib/data/` data-access layer for all tables.
- [ ] Brand Profile page — view/edit brand name, voice rules, ICP, platform, guardrails, threshold.
- [ ] Content pillar CRUD within brand profile.
- [ ] Ideas backlog page — create, edit, delete, list ideas with status badges.
- [ ] Responsive sidebar shell (Ideas, Drafts, Calendar, Brand Profile).
- **DoD:** Brand profile and ideas persist to DB; pages render with seed data for anonymous visitors; no dead buttons.

## Sprint 2 — Core Draft Engine ⭐ v1 FUNCTIONAL
**Goal:** The one loop works end-to-end — idea in, scored draft out.
- [ ] `lib/ai/generate-draft.ts` — builds prompt from brand profile + idea, calls OpenAI, returns structured draft + framework + pain driver.
- [ ] `lib/ai/score-draft.ts` — applies 7-dimension score, computes total, sets passed flag.
- [ ] Draft detail page — shows generated draft, score breakdown, framework justification, pain driver, readiness badge.
- [ ] Generate Draft button on idea → creates draft + score → navigates to draft detail.
- [ ] Edit draft text → re-score button.
- [ ] Status flow: draft → scored → scheduled (set date) → published.
- [ ] Calendar page — lists drafts by scheduled/published date.
- **DoD:** Success scenario from PRD works — rough idea in, publish-ready scored draft out, under 5 min, needs only light editing. This is the v1 milestone.

## Sprint 3 — Polish + Empty/Error States
**Goal:** All five UI states handled; edge cases covered.
- [ ] Loading skeletons on all async pages.
- [ ] Empty states for ideas, drafts, calendar.
- [ ] Error handling for AI call failures (graceful message + manual draft option).
- [ ] Score-not-passed state clearly communicated.
- [ ] Mobile sidebar tested.
- **DoD:** App handles empty, loading, error, partial, and ready states on every screen.

## Sprint 4 — Lock It Down (Later)
**Goal:** Auth + per-user data isolation.
- [ ] Supabase Auth (email + OAuth).
- [ ] Replace permissive RLS with `auth.uid() = user_id` on all tables.
- [ ] `user_id` populated on create.
- [ ] Redirect unauthenticated users to login (app no longer demo-first).
- **DoD:** Data isolated per user; anonymous access blocked; existing demo data migrated to owner.

## Gantt
```
S1: DB + Brand + Ideas     ████
S2: Draft Engine (v1)      ████
S3: Polish/States          ████
S4: Lock Down (later)      ████
```
