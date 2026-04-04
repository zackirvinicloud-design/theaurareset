# BRAINIAC Backend Architecture

## Purpose

BRAINIAC is a backend planning system for business growth. It is not a UI personality and it is not a general chatbot. Its job is to inspect business state, identify the current bottleneck, choose a small number of growth bets, and log those decisions so the business compounds instead of improvising.

## System Loop

1. Ingest business state.
2. Score likely constraints across measurement, acquisition, activation, retention, conversion, and operations.
3. Select the primary constraint.
4. Generate a focused growth plan with 3 decisions, a kill list, and an operating cadence.
5. Optionally synthesize a short CEO memo from the structured plan.
6. Persist the run and decisions for future review.

## Files

- `supabase/functions/_shared/brainiac.ts`
  Deterministic planner logic. This is the architectural brain.
- `supabase/functions/brainiac-ceo/index.ts`
  Secure backend endpoint for running the planner.
- `supabase/migrations/20260313000000_brainiac_backend.sql`
  Persistent memory for planner runs and growth decisions.

## Why This Is Not Just A Prompt Pack

The planner does real system work before the model is called:

- normalizes business inputs
- derives missing metrics where possible
- scores bottlenecks deterministically
- chooses which area matters most right now
- selects decisions from playbooks tied to that constraint
- creates a repeatable weekly operating cadence

The model is optional and only turns the structured plan into a cleaner memo.

## Request Shape

POST `supabase/functions/v1/brainiac-ceo`

Headers:

- `x-brainiac-key: <BRAINIAC_API_KEY>`

Example body:

```json
{
  "businessState": {
    "businessName": "The Gut Brain Journal",
    "northStarMetric": "Day 21 completion rate",
    "currentFocus": "guided protocol adherence and paid conversion",
    "timeHorizon": "weekly",
    "metrics": {
      "visitors30d": 1800,
      "signups30d": 54,
      "activationRate": 0.31,
      "paidConversionRate": 0.02,
      "day7CompletionRate": 0.18,
      "day21CompletionRate": 0.05
    },
    "constraints": {
      "teamSize": 1,
      "devCapacityHoursPerWeek": 18,
      "cashTight": true
    }
  },
  "persist": true,
  "withMemo": true
}
```

## Output Shape

The function returns:

- `plan`
  Structured growth plan with scores, primary constraint, decisions, assumptions, and cadence.
- `memo`
  Optional short operator memo synthesized from the plan.
- `runId`
  Database id if persistence is enabled and Supabase credentials are available.

## Next Step

To make BRAINIAC act on its own, schedule this function to run on a fixed cadence and feed it fresh business metrics. The planner is already separated from the frontend, so that automation can happen without making the product UI autonomous.
