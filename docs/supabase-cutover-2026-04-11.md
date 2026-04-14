# Supabase Cutover (April 11, 2026)

## New production project
- Project ref: `kcmtwnzmeelaypolufjf`
- Dashboard: `https://supabase.com/dashboard/project/kcmtwnzmeelaypolufjf`
- Region: `West US (North California)`

## What was migrated
- Linked local repo to the new project in `supabase/config.toml`.
- Applied all SQL migrations with `supabase db push`.
- Deployed edge functions:
  - `protocol-chat`
  - `analyze-insights`
  - `brainiac-ceo`
  - `activate-subscription`
  - `send-sms-reminders`
  - `send-push-reminders`

## Provider architecture change
- Removed Lovable gateway dependency from chat execution path.
- `protocol-chat`, `analyze-insights`, and `brainiac-ceo` now use Gemini via:
  - `GEMINI_API_KEY` (preferred), or
  - `GOOGLE_API_KEY`
- Shared resolver lives at `supabase/functions/_shared/ai-provider.ts`.

## Push reminder setup completed
- Added + migrated push tables/events:
  - `web_push_subscriptions`
  - `push_delivery_events`
- Extended reminders and onboarding schema for push channel.
- Added service worker support in web app.
- Set edge secrets for push delivery (`WEB_PUSH_*`, `REMINDER_WEBHOOK_SECRET`, `PUBLIC_APP_URL`).
- Enabled scheduler jobs in Postgres cron:
  - `send-push-reminders-every-minute`
  - `send-sms-reminders-every-5-minutes`

## Required final secret before chat works
- Set one of:
  - `GEMINI_API_KEY`
  - `GOOGLE_API_KEY`

Command:
```bash
npx supabase@latest secrets set GEMINI_API_KEY="YOUR_REAL_GEMINI_KEY" --project-ref kcmtwnzmeelaypolufjf
```

Without this, `protocol-chat` returns:
- `No AI provider key configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY).`

## Local frontend defaults
- App defaults now point to the new Supabase project.
- `.env.example` added with required client env vars.

## Suggested next hardening steps
1. Add alerting/log checks on edge-function failures.
2. Rotate and store operational secrets in a team-owned secure vault.
3. Remove SMS pathway if product direction remains push-only.
