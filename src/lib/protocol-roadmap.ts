export type ProtocolRoadmapPhaseId = 'prep' | 'week-1' | 'week-2' | 'week-3';

export interface ProtocolRoadmapMilestone {
    id: string;
    label: string;
    title: string;
    description: string;
    startDay: number;
    endDay?: number;
}

export interface ProtocolRoadmapLesson {
    id: string;
    title: string;
    description: string;
    eyebrow?: string;
}

export interface ProtocolRoadmapPhase {
    id: ProtocolRoadmapPhaseId;
    phaseNumber: 1 | 2 | 3 | 4;
    railLabel: string;
    title: string;
    dayRange: string;
    shortPromise: string;
    overview: string;
    why: string;
    whatIsHappening: string;
    whatChanges: string;
    whatToExpect: string;
    whatMattersMost: string;
    commonMistakes: string;
    nextPhaseBridge: string;
    shoppingPhase: string;
    milestones: ProtocolRoadmapMilestone[];
}

export interface ProtocolRoadmapPrinciple {
    title: string;
    description: string;
}

export interface ProtocolRoadmapSurfaceHint {
    title: string;
    description: string;
}

export const PROTOCOL_ROADMAP_PRINCIPLES: ProtocolRoadmapPrinciple[] = [
    {
        title: 'Sequence matters',
        description: 'This cleanse is stacked in layers. You lower incoming chaos first, then apply pressure, then clean up what gets mobilized.',
    },
    {
        title: 'Elimination wins',
        description: 'If food, hydration, binder timing, and bowel support fall apart, the protocol feels louder than it needs to.',
    },
    {
        title: 'Support beats force',
        description: 'The goal is not to hit the body harder. The goal is to keep detox moving without turning the plan into a stress test.',
    },
];

export const PROTOCOL_ROADMAP_SURFACES: ProtocolRoadmapSurfaceHint[] = [
    {
        title: 'Today',
        description: 'Use this for execution. It is your daily move list, not the place to re-learn the whole protocol.',
    },
    {
        title: 'Guide',
        description: 'Use this when you need context, not reassurance loops. Shopping, roadmap, and normal-today live here.',
    },
    {
        title: 'Coach',
        description: 'Use this when your real-life question does not fit neatly into a checklist or when you need help interpreting what is happening.',
    },
];

export const PROTOCOL_ROADMAP_PHASES: ProtocolRoadmapPhase[] = [
    {
        id: 'prep',
        phaseNumber: 1,
        railLabel: 'Prep Day',
        title: 'Prep Day and Foundation',
        dayRange: 'Day 0',
        shortPromise: 'Set the stage so Day 1 feels clear, calm, and easy to follow.',
        overview: 'Prep Day is the setup day. You clean up the food, organize the supplements, and prepare digestion and elimination support before the active part of the cleanse begins.',
        why: 'This phase comes first because the gut, immune system, liver, and brain all respond to food stress, poor digestion, and inconsistent routine. If those basics are unstable, the rest of the cleanse becomes harder to interpret and harder to tolerate. Prep Day reduces that background stress before active pressure begins.',
        whatIsHappening: 'You are not trying to force a big detox moment yet. You are lowering food triggers, improving digestion, protecting elimination, and creating a steadier daily rhythm so the later phases have more support behind them.',
        whatChanges: 'The kitchen changes first. Off-plan food comes out. Clean basics come in. Supplement timing becomes real. Binder windows become real. Tomorrow morning stops being a mystery. This is the moment the cleanse stops being an idea and starts becoming your actual routine.',
        whatToExpect: 'Most people feel two things at once here: relief and overwhelm. Relief because there is finally a plan. Overwhelm because there is a lot to set up. It is normal to want to buy everything, read everything, and do everything perfectly. That is not the goal.',
        whatMattersMost: 'Buy enough to start strong, remove the obvious friction, organize what you need, and make the next 24 hours feel simple. A good Prep Day feels like waking up to a calm kitchen and a clear plan instead of a scramble.',
        commonMistakes: 'Trying to shop for every possible scenario, memorizing the whole protocol tonight, meal-prepping like a machine, or treating optional extras like non-negotiables.',
        nextPhaseBridge: 'If tomorrow\'s breakfast, shopping, binder window, bowel support, and first supplement rhythm are already decided, Week 1 lands on a steadier system and becomes easier to execute well.',
        shoppingPhase: 'Foundation',
        milestones: [
            {
                id: 'prep-day',
                label: 'Now',
                title: 'Prep Day',
                description: 'Shopping, kitchen reset, supplement setup, and a realistic tomorrow plan.',
                startDay: 0,
            },
            {
                id: 'day-1-preview',
                label: 'Up next',
                title: 'Day 1 preview',
                description: 'Your only job tomorrow is to follow the rhythm you set up today.',
                startDay: 1,
            },
        ],
    },
    {
        id: 'week-1',
        phaseNumber: 2,
        railLabel: 'Week 1',
        title: 'Week 1: Fungal Colony Elimination',
        dayRange: 'Days 1-7',
        shortPromise: 'Go after the fungal colonies first so the next phase has less chaos to fight through.',
        overview: 'Week 1 starts with fungal colony elimination on purpose. Many people want to jump straight to parasites, but this protocol begins by reducing fungal overgrowth, sugar-driven pressure, and the kind of gut environment that keeps the whole problem more active.',
        why: 'This phase comes first because fungal overgrowth can add to bloating, cravings, brain fog, inflammation, and a more reactive gut environment. In the logic of this protocol, the fungal terrain is reduced first so the next phase is working on a cleaner system instead of a more chaotic one.',
        whatIsHappening: 'You are cutting off the fuel that supports fungal overgrowth, adding antifungal support, and asking the body to clear more waste than usual. This can increase symptoms for a few days because the body is adjusting while microbial pressure shifts.',
        whatChanges: 'Food gets simpler fast. Sugar becomes a problem fast. Timing matters more. Hydration matters more. Binders matter more. Many users suddenly notice how much their gut and brain were already reacting before the cleanse had any structure at all.',
        whatToExpect: 'Headaches, fatigue, cravings, brain fog, irritability, and low energy can all show up here. That does not mean the cleanse is failing. It often means the body is adjusting to a new environment. Week 1 can look quiet on the calendar while feeling loud in the body.',
        whatMattersMost: 'Keep meals clean, keep binder windows clean, stay hydrated, keep things moving, and do not start freelancing just because symptoms got louder. Week 1 is not a small intro week. It is the part that makes Week 2 cleaner, sharper, and easier to handle.',
        commonMistakes: 'Panicking at normal die-off, skipping real meals, getting sloppy with timing, adding random wellness hacks, or deciding the protocol is failing because the first week is not pretty.',
        nextPhaseBridge: 'The cleaner the fungal terrain gets in Week 1, the cleaner the parasite phase tends to feel in Week 2. This phase is the setup for the one that follows.',
        shoppingPhase: 'Fungal Elimination',
        milestones: [
            {
                id: 'day-1',
                label: 'Start',
                title: 'Day 1',
                description: 'Initiation day. The routine matters more than trying to understand everything at once.',
                startDay: 1,
            },
            {
                id: 'day-3',
                label: 'Reality check',
                title: 'Day 3',
                description: 'This is where people usually decide whether they trust the structure or start freelancing.',
                startDay: 3,
            },
            {
                id: 'week-2-prep',
                label: 'Setup next',
                title: 'Week 2 handoff',
                description: 'Get the parasite-phase supplies ready before the phase change sneaks up on you.',
                startDay: 5,
                endDay: 7,
            },
        ],
    },
    {
        id: 'week-2',
        phaseNumber: 3,
        railLabel: 'Week 2',
        title: 'Week 2: Parasite Elimination',
        dayRange: 'Days 8-14',
        shortPromise: 'Go after parasites after the terrain is cleaner and the body has more support in place.',
        overview: 'Week 2 is the parasite phase. It comes after Week 1 because the protocol is designed to apply parasite-focused pressure on a cleaner, steadier foundation instead of dropping that pressure into a more inflamed and disorganized system on Day 1.',
        why: 'This phase is more targeted and often more intense. That is exactly why it is not first. By the time you reach Week 2, food is cleaner, timing is steadier, and elimination support is already in place. The order matters because this phase is easier to execute when the basics are not falling apart.',
        whatIsHappening: 'You are turning up parasite-focused pressure while still relying on the same foundation from Week 1. That can create stronger reactions, stranger bathroom changes, and more noticeable symptom waves because the body is now handling a louder phase of cleanup.',
        whatChanges: 'The stack changes and the middle of the cleanse starts to feel more serious. This is where people start reading too much into every symptom, every bowel movement, and every energy dip. The real move is not to panic. The real move is to stay steady while the body works through the louder phase.',
        whatToExpect: 'Bowel changes, stronger die-off, odd timing patterns, temporary fatigue, and intensity spikes are common here. Days 10-14 are often the loudest part of the whole cleanse. Loud does not always mean dangerous, but it does mean you need better hydration, cleaner timing, and less improvising.',
        whatMattersMost: 'Do not drop the basics because this phase feels dramatic. Food, hydration, binder timing, liver support, and keeping things moving still decide whether Week 2 feels manageable or chaotic. This week is won by staying steady when the body gets louder.',
        commonMistakes: 'Research spirals, abandoning meals, overinterpreting every symptom, stopping binders because timing is inconvenient, or treating odd outputs like proof the protocol has gone off the rails.',
        nextPhaseBridge: 'If Week 2 stays grounded, Week 3 can become a controlled cleanup phase instead of a crash. The protocol does not stay in high-pressure mode forever.',
        shoppingPhase: 'Parasite Elimination',
        milestones: [
            {
                id: 'day-8',
                label: 'Switch',
                title: 'Day 8',
                description: 'The parasite phase starts here. The foundation should stay steady while the focus changes.',
                startDay: 8,
            },
            {
                id: 'days-10-14',
                label: 'Peak stretch',
                title: 'Days 10-14',
                description: 'This is usually the loudest section of the protocol. Calm execution matters more than intensity.',
                startDay: 10,
                endDay: 14,
            },
        ],
    },
    {
        id: 'week-3',
        phaseNumber: 4,
        railLabel: 'Week 3',
        title: 'Week 3: Heavy Metal Elimination',
        dayRange: 'Days 15-21',
        shortPromise: 'Finish by binding and clearing, not by pushing harder and harder.',
        overview: 'Week 3 is the heavy metal elimination phase. This last phase is built as a slower bind-and-clear phase after the earlier parts of the protocol have already lowered some of the gut burden and made the daily routine steadier.',
        why: 'Heavy metals come last because this is the phase that needs the most control. It asks the body to bind and clear a burden that can feel heavier and more destabilizing if digestion, hydration, bowel regularity, and liver support are already struggling. That is why the protocol saves this phase for the end instead of using it first.',
        whatIsHappening: 'You are asking the body to bind, carry, and remove a heavier kind of burden while keeping the gut, liver, and nervous system from getting overwhelmed. This phase depends more on recovery, pacing, and clean support than on intensity.',
        whatChanges: 'Sleep matters more. Hydration matters more. Bowel regularity matters more. Sweating and recovery matter more. This is the phase where people often want a dramatic finish, but the smarter move is usually a calmer finish. The body can feel more sensitive here, so clean support wins.',
        whatToExpect: 'Some people feel clearer here. Others feel more tired, more headachy, or more emotionally flat if they push too hard or let things slow down. Week 3 often reveals whether the user is actually supporting the body or just asking too much from it.',
        whatMattersMost: 'Keep things moving, keep the routine stable, protect sleep, and finish without adding extra chaos. Week 3 is not about proving how intense you can be. It is about ending the cleanse with more clarity than when you started.',
        commonMistakes: 'Adding extra supplements for a stronger finish, underestimating sleep and hydration, ignoring constipation, or treating fatigue like proof you should force the protocol harder.',
        nextPhaseBridge: 'Completion is not the end. The real win is learning which habits keep the gut calmer, the brain clearer, and the system more stable after Day 21.',
        shoppingPhase: 'Heavy Metal Detox',
        milestones: [
            {
                id: 'day-15',
                label: 'Shift',
                title: 'Day 15',
                description: 'The heavy metal phase begins. This is where calm support matters more than bravado.',
                startDay: 15,
            },
            {
                id: 'maintenance',
                label: 'Finish',
                title: 'Completion and maintenance',
                description: 'Day 21 is a handoff, not a cliff. Keep the habits that created signal and stability.',
                startDay: 21,
            },
        ],
    },
];

export function getProtocolRoadmapPhaseForDay(day: number): ProtocolRoadmapPhase {
    if (day <= 0) {
        return PROTOCOL_ROADMAP_PHASES[0];
    }

    if (day <= 7) {
        return PROTOCOL_ROADMAP_PHASES[1];
    }

    if (day <= 14) {
        return PROTOCOL_ROADMAP_PHASES[2];
    }

    return PROTOCOL_ROADMAP_PHASES[3];
}

export function getProtocolRoadmapLessons(phase: ProtocolRoadmapPhase): ProtocolRoadmapLesson[] {
    return [
        {
            id: 'why',
            title: 'Why this phase exists',
            eyebrow: 'Why',
            description: phase.why,
        },
        {
            id: 'what-is-happening',
            title: 'What is happening in the body',
            eyebrow: 'What',
            description: phase.whatIsHappening,
        },
        {
            id: 'what-changes',
            title: 'What changes in daily life',
            eyebrow: 'How',
            description: phase.whatChanges,
        },
        {
            id: 'what-to-expect',
            title: 'What people usually feel',
            eyebrow: 'Expect',
            description: phase.whatToExpect,
        },
        {
            id: 'what-matters-most',
            title: 'What matters most',
            eyebrow: 'Focus',
            description: phase.whatMattersMost,
        },
        {
            id: 'common-mistakes',
            title: 'What people often overdo or misunderstand',
            eyebrow: 'Avoid',
            description: phase.commonMistakes,
        },
        {
            id: 'next-phase-bridge',
            title: 'What sets up the next phase',
            eyebrow: 'Bridge',
            description: phase.nextPhaseBridge,
        },
    ];
}
