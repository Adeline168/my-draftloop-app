# Test Plan

## v1 Success Scenario
1. Open app (no login) → see Ideas, Drafts, Calendar, Brand Profile in sidebar.
2. Go to Brand Profile → verify seed data loads; edit guardrails; save → persists on refresh.
3. Go to Ideas → create new idea: "Why most content calendars fail." → appears in list.
4. Click idea → click "Generate Draft" → wait < 30s.
5. Draft page shows: post body text, framework name + justification, pain driver, 7-dimension score breakdown, total, passed badge.
6. Edit draft text → click "Re-score" → new score reflects edit.
7. Set status to scheduled → pick date → appears on Calendar page.
8. Set status to published → date recorded.

## Empty States
- No ideas yet → Ideas page shows "No ideas yet. Add your first raw topic."
- No drafts → Drafts page shows "No drafts yet. Generate one from an idea."
- No scheduled items → Calendar shows "Nothing scheduled."

## Error States
- AI call fails → Draft page shows "Couldn't generate draft. You can write one manually below." + empty draft form.
- Draft doesn't pass threshold → badge shows "Needs work" with score breakdown highlighted.
- DB unreachable → error message on page, no silent failure.

## Manual Checks
- Create/edit/delete idea persists across refresh.
- Brand profile changes reflected in next generated draft.
- Score total = sum of 7 dimensions.
- Scheduled draft appears on correct calendar date.
- Mobile: hamburger menu opens sidebar; all pages reachable.
