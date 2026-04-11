# Distribution-First Plan

## Positioning

The Gut Brain Journal is not launching as a native mobile app company. It is launching as a focused web product with SMS as the re-entry layer.

The offer is:

- one job
- one protocol
- one price

That job is simple: tell the user what to do today, when to do it, what feels normal, and how to get back on track fast.

## Offer

- Price: `$79` one-time
- Product: 21-day cleanse execution system
- Core promise: clarity, adherence, and trust
- Delivery: browser-first workspace with optional text reminders

## Funnel

1. Short-form content drives traffic.
2. Advertorial or landing page converts the confused cleanser.
3. Checkout unlocks the product.
4. Account creation attaches payment to the user.
5. Post-purchase SMS setup captures phone + consent.
6. Prep Day activation moves the user into execution.

## Product Shell

The app remains the command center:

- `Today` answers what to do next.
- `Guide` handles shopping, roadmap, and symptom context.
- `Coach` clarifies when the user is stuck.

SMS is not a second product. SMS is the re-entry shell:

- day-start cue
- reminder for a chosen task
- missed-day rescue
- symptom tracker nudge
- shopping reminder before the next phase

Every text should deep-link into the exact app surface the user needs.

## Reminder Architecture

### Canonical storage

- `sms_subscriptions`
- `task_reminders`
- `sms_delivery_events`

### Reminder channels

- `local`
- `sms`

`local` remains the default until the user opts into SMS. Once SMS is enabled, reminders can send a text that reopens the exact plan step.

### Edge function

`supabase/functions/send-sms-reminders`

Purpose:

- find due SMS reminders
- look up active transactional SMS subscriptions
- send via Twilio
- mark delivery outcomes
- log failures and retries

Invoke this function on a fixed cadence such as every 5 minutes from a secure cron or automation layer, and pass `x-reminder-secret` when that secret is configured.

### Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_APP_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` or `TWILIO_MESSAGING_SERVICE_SID`
- optional: `REMINDER_WEBHOOK_SECRET`

## Metrics That Matter

- landing visit -> paid conversion
- paid -> Prep Day activation
- paid -> SMS opt-in
- SMS click-through -> app open
- Day 1 completion
- Day 3 completion
- Day 7 completion
- Day 21 completion

## MERCURY Operating Loop

Every week:

1. `RESEARCHER` ranks the hottest cleanse questions from TikTok, IG, and Reddit.
2. `SCRIBE` turns each question into a 30-45 second script with one pain, one proof point, and one CTA.
3. `EDITOR` packages that script with screen recordings of the app solving the exact problem.
4. `DISTRIBUTOR` publishes 3-5 assets per day and reports which hooks drive clicks, purchases, and activation.

## What We Are Not Building Right Now

- native iPhone app
- native Android app
- free-form SMS coaching
- supplement manufacturing
- broad wellness utilities
- feature bundles that increase novelty more than adherence

## Exit Logic

The exit thesis is not “sell an app.”

The exit thesis is: sell a focused wellness commerce and distribution engine with:

- owned audience
- permissioned SMS list
- repeatable short-form acquisition
- conversion data
- adherence data
- protocol IP

That is the asset stack worth compounding.
