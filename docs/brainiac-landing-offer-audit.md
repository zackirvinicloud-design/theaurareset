# BRAINIAC Audit: Landing Page + Offer

## Verdict

The business has a real product, a real pain point, and a clearer position than most wellness apps. But the current landing page still sells a cheap utility instead of an outcome-driven offer. If the goal is a $1,000,000 per year business, the page and the offer both need to move up-market in clarity, proof, and perceived value.

BRAINIAC's judgment:

- The product is good enough to sell.
- The current offer is not yet strong enough to scale.
- The current landing page is easier to "like" than to buy from.

## Findings

### 1. The current economics are too thin for the $1M target

Current public price on the live landing page is `$27 one time`.

At `$27`, the business needs about `37,038 sales per year` to hit `$1,000,000` gross revenue.

That means roughly:

- `3,086 sales per month`
- `103 sales per day`

That is a volume game. The current page is not built for that kind of scale, and this product is not positioned like a mass commodity. BRAINIAC would not try to brute-force a million-dollar business through bargain pricing unless conversion and distribution were already proven at scale.

### 2. The page leads with mechanism, not the dream outcome

The current page does a good job explaining the product experience:

- prep flow
- shopping list
- daily checklist
- AI help

But it does not hit the dream outcome hard enough:

- finish the reset
- stop wasting money on the wrong supplements
- stop quitting halfway through
- feel confident you are doing it right

Right now the page says "here is the app." It needs to say "here is the before/after in your life."

### 3. Perceived likelihood of success is still too low

Using Hormozi's value equation:

`Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort and Sacrifice)`

The current page improves:

- time delay
- effort

But it is still weak on:

- perceived likelihood
- proof
- authority
- risk reversal

There is no strong guarantee on the current landing page, little hard proof, and no structured objection handling. In a health-adjacent offer, this matters more than clever design.

### 4. The avatar is still too broad

The product brief is directionally right, but the page still speaks to a wide group of "people with gut issues."

The highest-value buyer is narrower:

- they already believe a gut reset could help
- they already tried self-directed wellness content
- they already bought supplements or saved protocols
- they do not trust themselves to organize and finish the process alone

That is a different buyer than:

- a total beginner
- someone looking for diagnosis
- someone wanting a fully custom health plan

BRAINIAC would focus the page around the overwhelmed self-experimenter, not the entire wellness market.

### 5. The offer stack is incomplete

The current page has:

- the core product
- a low price
- a simple "one payment" framing

It does not yet have a true Grand Slam offer structure:

- clear named transformation
- objection-killing bonuses
- risk reversal
- believable urgency
- explicit value stack

This is why the page feels clean but still not yet irresistible.

### 6. The CTA promise is slightly off

The hero CTA says `Show Me Today's Plan`, but the button routes to signup, not the plan itself.

That creates a small expectation break. It is not catastrophic, but it weakens trust at the exact moment trust should be increasing.

### 7. Pricing is inconsistent in the codebase

The current landing page uses `$27`, but there is still a separate pricing component with `$19`.

That mismatch lives in:

- `src/pages/Landing.tsx`
- `src/components/landing/PricingSection.tsx`

Even if the old component is not currently used, inconsistent price memory inside the codebase is an execution risk.

### 8. The page is strong on clarity, but weak on status and certainty

Carlton/Kennedy-style direct response works when the page does three things:

- names the pain brutally clearly
- makes the outcome feel specific and desirable
- makes the offer feel like the obvious move

The current page is clear, but still too polite. It needs more certainty, more consequence, and more financial/emotional specificity, while staying within the product's trust rules.

## What BRAINIAC Would Keep

- The "guided protocol companion" category
- The anti-PDF / anti-chaos positioning
- The real screenshots
- The simple one-product focus
- The emphasis on finishing, not endless learning

These are good foundations.

## What BRAINIAC Would Kill

- Commodity pricing as the primary growth plan
- Generic "gut health" positioning
- Any temptation to use fake scarcity or unsupported health claims
- Any copy that makes the product sound like a broad AI wellness platform
- Any CTA that is softer than the problem deserves

## The Right Customer Avatar

### Primary Avatar

The overwhelmed protocol buyer.

This person:

- already suspects the gut reset can help
- has tried to do it alone
- has a cabinet, cart, or notes app full of unfinished attempts
- wants structure more than more information
- is willing to pay for clarity if it feels concrete and trustworthy

### Core Internal Pain

"I do not trust myself to organize this correctly, and I am tired of wasting money and quitting."

### Core External Pain

- too many supplements
- too much conflicting advice
- too much setup friction
- too easy to lose track after Day 3 or Day 7

### Buying Trigger

They are not buying "gut health."

They are buying:

- certainty
- completion
- simplicity
- reduced wasted money
- reduced wasted time

## Repositioning

### Category

Do not position this as:

- an AI health platform
- a wellness app
- a generic protocol tracker

Position it as:

`The execution layer for a 21-day gut reset.`

Or more consumer-friendly:

`The app that turns a confusing gut reset into a simple day-by-day plan.`

### Differentiator

The differentiator is not "AI."

The differentiator is:

- protocol-specific
- day-aware
- phase-aware
- shopping-aware
- built to get people to finish

The cleanest differentiator statement is:

`Most gut reset products give you information. This one gives you execution.`

### Market Angle

The strongest angle is not "heal your gut."

That is too broad and too credibility-sensitive.

The strongest angle is:

`Stop failing the reset because of confusion, setup friction, and inconsistency.`

That angle is:

- easier to prove
- easier to sell honestly
- more tightly aligned to the product

## BRAINIAC Offer Direction

### Named Transformation

`The 21-Day Reset Companion`

Or:

`The Finish-Your-Reset System`

Or:

`The 21-Day Gut Reset, Organized For You`

The naming should emphasize completion and execution, not vague healing.

### Core Offer

`Get a day-by-day execution system for your 21-day gut reset so you know exactly what to do, buy, take, and track without building your own system from scratch.`

### Bonus Stack That Actually Reduces Objections

Instead of random bonuses, use bonuses that lower effort and increase perceived likelihood:

1. `Prep Day Fast-Start`
   A stripped-down checklist for getting ready in one sitting.

2. `Buy This First Guide`
   A budget-protection guide showing must-haves versus later-phase items.

3. `Stuck Day Rescue Prompts`
   Quick help for common dropout moments like Day 1, Day 3, Day 7, and phase switches.

4. `What Can I Eat Today? Cheat Sheet`
   Faster decision-making during the first week.

5. `Supplement Timing Quick Reference`
   The most confusion-prone questions answered before they become friction.

These are good bonuses because they attack effort and uncertainty directly.

### Guarantee

Use a real trust-based guarantee, not hype:

`If the app does not make your first 3 days materially clearer within 7 days, email us and we will refund you.`

That is specific, believable, and operationally real.

### Urgency

Only use urgency if it is real:

- founder price before a documented price increase
- early-user cohort price
- bonus expiration tied to a specific date or release milestone

No fake countdown timers. No fake scarcity.

## Pricing Judgment

BRAINIAC would not anchor the whole business to `$27 forever`.

Recommended pricing path:

- test core offer at `$49-$79`
- target average order value above `$79`
- later introduce a higher-ticket upsell or companion product

Why:

- low pricing weakens perceived value
- low pricing attracts lower-commitment buyers
- the million-dollar target becomes too dependent on huge traffic volume

Revenue math:

- at `$79`, you need about `12,658 sales/year`
- at `$99`, you need about `10,102 sales/year`
- at `$149`, you need about `6,712 sales/year`

BRAINIAC's bias would be to improve the offer and test a higher price rather than assume the answer is more traffic.

## Recommended Landing Page Hierarchy

### Section 1: Big Promise

Headline should sell outcome plus mechanism:

`Finish your 21-day gut reset without guessing what to do each day.`

Subhead:

`The Gut Brain Journal turns a confusing protocol into a simple daily plan: what to buy, what to take, what to do today, and where to ask when you get stuck.`

### Section 2: Who This Is For

Call out the real buyer:

- tried before
- got overwhelmed
- bought supplements
- never finished

This increases resonance fast.

### Section 3: Why Other Approaches Fail

Not because the buyer is lazy.

Because:

- the protocol is dense
- setup is chaotic
- phase changes are confusing
- generic tools are not built for protocol execution

### Section 4: The New Mechanism

Show that the product solves the execution gap:

- Prep Day
- Today
- Ask when stuck
- Track progress

### Section 5: The Offer Stack

Present:

- core product
- bonuses
- guarantee
- one clear price

### Section 6: Proof

Real proof only:

- testimonials
- screenshots
- before/after clarity stories
- "I finally finished" stories

Avoid inflated health claims unless they are provable and compliant.

### Section 7: Final CTA

Direct and consequence-aware:

`You can keep trying to organize this yourself, or you can start the reset with a system that already did the organizing for you.`

## Sample Direction For Stronger Copy

### Headline

`Stop trying to manage your gut reset from a PDF, a notes app, and memory.`

### Subhead

`The Gut Brain Journal turns your 21-day protocol into a simple day-by-day plan so you know exactly what to buy, take, and do without second-guessing yourself.`

### Offer Framing

`You are not paying for more information. You are paying for clarity, structure, and a much better chance of actually finishing the reset.`

## Final Judgment

BRAINIAC would not reposition this as a flashy wellness promise machine. It would reposition it as the execution system for people who already want the reset, but do not trust themselves to organize and finish it alone.

That is the honest angle.
That is the higher-conversion angle.
That is the angle with the best shot at becoming a real business instead of a nice-looking page.
