# Agentic Layer

## Draftable Actions (low risk — auto)
- Generate draft from idea + brand profile → AI, auto-applied.
- Score draft on 7 dimensions → AI, auto-applied.
- Extract pain driver → AI, auto-applied.
- Name copywriting framework + justification → AI, auto-applied.

## Executable After Approval (medium risk)
- Mark draft scheduled (sets `scheduled_date`).
- Mark draft published (sets `published_date`).
- Delete idea or draft.

## Human-Only (high risk)
- Edit brand profile guardrails.
- Edit draft body text (human judgment on voice fit).
- Change score threshold.

## Named Tools
- `generate_draft(idea_id, platform)` → draft + framework + pain driver.
- `score_draft(draft_id)` → 7-dimension score.
- No generic `run_any` / `send_any` exposed.

## Audit Log Fields
- id, user_id, action, target_type, target_id, timestamp, metadata (jsonb).
- Logged: draft_generated, draft_scored, status_changed, deleted.

## v1 vs Later
- **v1:** generate + score tools only; status transitions are direct user actions.
- **Later:** batch variant generation tool, auto-rescore on edit, calendar auto-suggest tool.
