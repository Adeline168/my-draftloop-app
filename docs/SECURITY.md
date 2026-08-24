# Security

## Secret Handling
- OpenAI API key stored in Supabase Edge env / Vercel env — never exposed to frontend.
- AI calls made server-side only (server actions / route handlers).
- No secrets in client bundles or repo.

## Permission Model
- **v1 (demo-first):** Permissive RLS — all tables readable/writable without login so the app renders for anonymous visitors.
- **Lock-down sprint:** Replace permissive policies with `auth.uid() = user_id` on every table. Only the owner sees/edits their data.
- Agent (AI generation) inherits the calling user's permissions — no elevated access.

## Approved-Tools Rule
- Only named tools (`generate_draft`, `score_draft`) are callable.
- No raw SQL execution or arbitrary API calls exposed to the frontend.
- All writes go through the data-access layer.

## Audit Principle
- Every meaningful state change (draft generated, scored, scheduled, published, deleted) is logged with user_id, action, target, timestamp.
- Logs are append-only.
