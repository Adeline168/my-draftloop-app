# DraftLoop — Product Requirements

## Problem
Drafting organic social posts is ad hoc: inconsistent hooks, no scoring, no repeatable framework. Each post starts from a blank page and is gut-checked, not measured.

## Target User
A solo social media operator managing content across multiple platforms for one brand. Wants a repeatable, scored drafting process — not a rewrite every time.

## Core Objects
- **Brand Profile** — voice/tone rules, ICP, platform mix, content pillars, guardrails (one active brand in v1).
- **Content Pillar** — theme/tag linked to brand profile.
- **Idea** — raw topic or half-formed hook in the backlog.
- **Draft** — platform-native post text generated from an idea; passes through a 7-dimension self-score gate.
- **Score** — 7 dimensions (Hook, Specificity, Proof, Clarity, CTA, Fit-to-Platform, Shareability); draft must clear a threshold to be "ready."
- **Variant** — linked drafts of the same idea for different platforms.
- **Calendar Item** — draft marked scheduled/published with a date (manual, no auto-post).

## MVP (v1) Checklist
- [ ] One brand profile, editable once (voice, ICP, platform, pillars, guardrails).
- [ ] Idea backlog: create, edit, delete raw ideas.
- [ ] Core loop: raw idea in → platform-native draft out → 7-dimension score applied → draft marked ready if it clears threshold.
- [ ] Framework Justifier labels which copywriting framework was used and why.
- [ ] Pain Depth Engine surfaces emotional driver before writing the hook.
- [ ] Draft editing and status flow: idea → draft → scored → scheduled → published.
- [ ] One platform fully working end-to-end.
- [ ] All screens viewable without login (demo-first).

## Non-goals (v1)
- Multi-brand profiles / brand switching (v2).
- Auto-posting or scheduling to platform APIs.
- Live analytics pull from platforms.
- Video/reel generation.
- Approval workflows or multi-user roles.
- Coaching/roleplay tiered modes.
- Bundled multimodal output on every post.

## Success Criteria
Hand the app a rough idea, pick a platform, and receive a publish-ready draft (cleared the 7-dimension score with framework named and pain driver surfaced) in under 5 minutes needing only light editing — no rewrite.
