import { PHASE_INFO, SHOPPING_LIST } from "@/hooks/useProtocolData";

export type ProtocolSectionId =
  | "overview"
  | "rhythm"
  | "phases"
  | "shopping"
  | "troubleshooting"
  | "maintenance";

export interface ProtocolSectionMeta {
  id: ProtocolSectionId;
  label: string;
  eyebrow: string;
  description: string;
}

export interface ProtocolDayGroup {
  label: string;
  focus: string[];
}

export interface ProtocolPhaseGuide {
  phase: 1 | 2 | 3 | 4;
  days: string;
  summary: string;
  nonNegotiables: string[];
  watchFor: string[];
  keepSimple: string[];
  dayGroups: ProtocolDayGroup[];
  nextMove: string;
}

export interface TroubleshootingCard {
  title: string;
  normal: string;
  doNow: string[];
  escalateIf: string;
}

export const FULL_PROTOCOL_SECTIONS: ProtocolSectionMeta[] = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Start here",
    description: "See the reset at a glance and understand what success actually looks like.",
  },
  {
    id: "rhythm",
    label: "Daily rhythm",
    eyebrow: "How to run the day",
    description: "Keep the reset steady without turning it into a full-time job.",
  },
  {
    id: "phases",
    label: "Week guide",
    eyebrow: "21-day playbook",
    description: "Move through Prep Day, Week 1, Week 2, and Week 3 without losing the foundation.",
  },
  {
    id: "shopping",
    label: "Shopping",
    eyebrow: "Buy what matters first",
    description: "Use the guide to buy what you need now and defer what belongs to later phases.",
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    eyebrow: "Stay calm when something feels off",
    description: "Know what to simplify, what to watch, and when to stop guessing.",
  },
  {
    id: "maintenance",
    label: "After Day 21",
    eyebrow: "Finish cleanly",
    description: "Review what changed, keep the useful habits, and avoid immediately jumping into another experiment.",
  },
];

export const FULL_PROTOCOL_OVERVIEW = [
  "This product is an execution layer for a 21-day reset, not an invitation to read everything at once.",
  "Prep Day exists to reduce friction before Day 1. The goal is readiness, not intensity.",
  "Days 1-21 use the same core rhythm: keep meals clean, hydrate, protect binder timing, and stay consistent with the daily stack.",
  "Coach is for blockers and clarifying questions. The checklist is still the source of truth for what to do today.",
];

export const DAILY_RHYTHM_RULES = [
  "Start with the morning routine before you improvise.",
  "Keep binders in a clean two-hour window away from food and supplements.",
  "Treat compliant meals, hydration, and sleep as protocol tools, not side notes.",
  "Use the guide to read ahead, but finish the day in front of you before planning the next phase.",
  "If symptoms spike, simplify first. Do not stack extra experiments on top of an already demanding day.",
];

export const QUICK_REFERENCE_CARDS = [
  {
    title: "Morning",
    items: [
      "Do the morning ritual and first meal rhythm before the day gets noisy.",
      "Take the phase-specific breakfast support on schedule instead of saving it for later.",
    ],
  },
  {
    title: "Midday",
    items: [
      "Protect hydration, lunch timing, and the midday support stack.",
      "If a binder window is part of the day, keep it clean instead of squeezing it in randomly.",
    ],
  },
  {
    title: "Evening",
    items: [
      "Finish the final meal and support stack without drifting into late-night snacking.",
      "Set up tomorrow before bed so the next morning feels lighter.",
    ],
  },
];

export const FULL_PROTOCOL_PHASES: ProtocolPhaseGuide[] = [
  {
    phase: 1,
    days: "Prep Day",
    summary:
      "Prep Day is for shopping, setup, and clearing obvious friction before the active reset starts.",
    nonNegotiables: [
      "Finish the starter shopping list before Day 1.",
      "Remove the easiest off-plan foods from the house.",
      "Organize supplements and pick a realistic breakfast and lunch for tomorrow.",
    ],
    watchFor: [
      "Buying everything at once instead of what matters first.",
      "Reading so far ahead that prep becomes more research.",
      "Forgetting to make the first morning easy before you stop for the day.",
    ],
    keepSimple: [
      "The goal is readiness, not perfection.",
      "Choose clarity over quantity. Buy the must-haves first and defer later phases.",
    ],
    dayGroups: [
      {
        label: "Prep block",
        focus: [
          "Clear the kitchen, stock the basics, and lay out the first day of supplements.",
          "Use shopping and setup to remove decision fatigue from Day 1.",
        ],
      },
    ],
    nextMove: "Start Day 1 with the kitchen, supplements, and meal plan already in place.",
  },
  {
    phase: 2,
    days: "Days 1-7",
    summary:
      "The first active phase is about establishing the base rhythm and staying steady while fungal support comes in.",
    nonNegotiables: [
      "Keep sugar out and meals simple.",
      "Take the antifungal stack on schedule without overcomplicating the day.",
      "Stay consistent with binders, hydration, and the base liver support.",
    ],
    watchFor: [
      "Die-off fear turning into random changes.",
      "Supplement timing slipping because the day gets busy.",
      "Assuming intensity means you should add even more support.",
    ],
    keepSimple: [
      "Food, hydration, and timing matter more than heroic effort.",
      "Use Coach when you feel unsure instead of opening five tabs.",
    ],
    dayGroups: [
      {
        label: "Days 1-3",
        focus: [
          "Set the daily rhythm and expect the adjustment period to feel louder than the results.",
          "Use the checklist to keep the routine clean while your body adapts.",
        ],
      },
      {
        label: "Days 4-7",
        focus: [
          "Let the routine get more automatic instead of adding more complexity.",
          "Start planning Week 2 shopping before the transition arrives.",
        ],
      },
    ],
    nextMove: "By around Day 5, get the Week 2 supplies lined up so the next shift feels smooth.",
  },
  {
    phase: 3,
    days: "Days 8-14",
    summary:
      "The parasite phase keeps the same foundation but asks for steadier execution while the stack changes.",
    nonNegotiables: [
      "Keep the foundation habits even as the phase-specific stack changes.",
      "Use binders and symptom awareness to keep the phase manageable.",
      "Prepare the heavy metal supplies before Day 15.",
    ],
    watchFor: [
      "Dropping the base routine because the phase feels more intense.",
      "Treating every signal as an emergency instead of a data point.",
      "Reading ahead so aggressively that you stop executing today well.",
    ],
    keepSimple: [
      "The job is to stay observant, not experimental.",
      "Steady execution beats chasing dramatic results.",
    ],
    dayGroups: [
      {
        label: "Days 8-10",
        focus: [
          "Expect a new phase transition without rebuilding your entire system.",
          "Keep the food, binder, and hydration rhythm as stable as possible.",
        ],
      },
      {
        label: "Days 11-14",
        focus: [
          "Stay consistent and use the guide to prep for Week 3.",
          "Do not confuse intensity with a need to improvise.",
        ],
      },
    ],
    nextMove: "Shop for Week 3 before Day 15 so the finish stays calm instead of rushed.",
  },
  {
    phase: 4,
    days: "Days 15-21",
    summary:
      "The final phase is about finishing cleanly with a slower, steadier pace and stronger recovery support.",
    nonNegotiables: [
      "Go slower if the system feels more reactive.",
      "Keep sleep, hydration, and elimination support high.",
      "Finish the protocol before deciding what comes next.",
    ],
    watchFor: [
      "Pushing harder because you want a stronger finish.",
      "Adding new supplements or side experiments late in the reset.",
      "Ignoring recovery habits because the phase sounds technical.",
    ],
    keepSimple: [
      "A clean finish is better than an intense finish.",
      "Notice what is changing so Day 21 gives you useful signal, not just exhaustion.",
    ],
    dayGroups: [
      {
        label: "Days 15-17",
        focus: [
          "Let the body adjust to the final phase without adding noise.",
          "Keep the day calm and predictable while the chelation support settles in.",
        ],
      },
      {
        label: "Days 18-21",
        focus: [
          "Stay with the plan you already have and finish with consistency.",
          "Review what changed and where you felt strongest before you decide on maintenance.",
        ],
      },
    ],
    nextMove: "Finish Day 21, review the signal, and only then decide what maintenance should look like.",
  },
];

export const TROUBLESHOOTING_CARDS: TroubleshootingCard[] = [
  {
    title: "Symptoms feel louder than expected",
    normal: "A temporary rise in fatigue, brain fog, food cravings, or detox discomfort can happen when a phase changes.",
    doNow: [
      "Simplify the day before you add anything else.",
      "Protect hydration, food, and binder timing.",
      "Use Coach to sanity-check the signal instead of guessing.",
    ],
    escalateIf: "You have chest tightness, trouble breathing, severe confusion, or any symptom that feels dangerous rather than uncomfortable.",
  },
  {
    title: "Constipation or elimination slows down",
    normal: "The reset works better when elimination stays regular, and slower bowel movement can happen when binders or diet changes stack up.",
    doNow: [
      "Increase water and keep meals simple.",
      "Check whether binder timing has become too aggressive.",
      "Prioritize movement, sleep, and schedule consistency.",
    ],
    escalateIf: "Pain becomes sharp, localized, or steadily worse, or you cannot keep fluids down.",
  },
  {
    title: "Nausea or supplement fatigue",
    normal: "Week changes and tighter meal timing can make the stack feel heavier for a day or two.",
    doNow: [
      "Take the day slower and keep meals plain.",
      "Use the checklist and guide to confirm timing instead of stacking pills randomly.",
      "Ask Coach for the simplest version of the day.",
    ],
    escalateIf: "Vomiting persists, hydration drops, or symptoms move beyond mild-to-moderate discomfort.",
  },
  {
    title: "Sleep gets disrupted",
    normal: "Detox support, phase transitions, and late meals can all make the next night feel harder.",
    doNow: [
      "Tighten the evening routine and stop reading ahead late at night.",
      "Finish the day earlier so tomorrow starts lighter.",
      "Keep the final meal and support stack predictable.",
    ],
    escalateIf: "Sleep loss is severe for multiple nights and pushes you toward unsafe exhaustion.",
  },
];

export const MAINTENANCE_GUIDE = [
  "Finish Day 21 before deciding what to repeat, extend, or drop.",
  "Keep the habits that clearly reduced confusion: cleaner meals, a stable morning rhythm, simpler timing, and less random research.",
  "Use your Day 21 review to note what improved, what felt hardest, and what would make a second run cleaner if you choose one later.",
  "Do not treat maintenance as an excuse to turn the protocol into a permanent all-day project.",
];

export const PHASE_SHORT_NAMES = FULL_PROTOCOL_PHASES.reduce<Record<number, string>>((acc, item) => {
  acc[item.phase] = PHASE_INFO[item.phase].name;
  return acc;
}, {});

export { SHOPPING_LIST };
