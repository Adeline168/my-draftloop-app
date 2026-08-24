# Intelligence Layer

## Messy Inputs
- Raw idea text (free-form, often vague).
- Brand profile (structured but human-written prose).

## Auto-Structure Schema
```json
{
  "pain_driver": "fear of being invisible in a noisy feed",
  "framework": "PAS",
  "framework_reason": "audience feels the pain acutely; agitating it creates tension before the solution",
  "hook": "You're posting into the void. Here's why nobody stops.",
  "body": "...",
  "cta": "Comment 'STOP' for the checklist.",
  "scores": {
    "hook": 8, "specificity": 7, "proof": 6,
    "clarity": 9, "cta": 8, "fit_to_platform": 9, "shareability": 7
  },
  "total": 54,
  "passed": true
}
```

## Events to Track
- draft_generated, draft_scored, draft_edited, draft_rescored, draft_scheduled, draft_published.

## Scoring Rules (v1, start rule-based)
- Each dimension scored 0–10. Total = sum (0–70).
- `passed` = total ≥ brand profile's `score_threshold` (default 70).
- If not passed, draft status stays `draft` with score breakdown shown for editing.

## What Gets Ranked
Ideas in backlog by recency. Drafts by total score. Calendar by scheduled date.

## v1 vs Later
- **v1:** Single AI call for draft + framework + pain driver + scores. Manual re-score on edit.
- **Later:** Multi-platform variant generation in one call, score history trend, pillar-level performance aggregation.
