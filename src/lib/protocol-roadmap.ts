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
        shortPromise: 'Set the stage so you never have to think or guess once the cleanse begins.',
        overview: 'Prep Day isn’t about dramatic detoxing. It’s about organizing your environment so that executing the protocol tomorrow is absolutely frictionless. We are eliminating the decisions that cause people to fail on Day 3.',
        why: 'Willpower is a terrible strategy for a cleanse. If your kitchen is a mess, your supplements aren’t organized, and you don’t know what you’re eating tomorrow, you will panic and quit. Prep Day solves this.',
        whatIsHappening: 'You are lowering the baseline stress on your gut. By removing the worst inflammatory foods today, your digestive system gets a 24-hour head start to clear the runway before we introduce the heavier protocol.',
        whatChanges: 'You stop eating garbage. You start hydrating. You physically organize your pills and powders. You pre-plan your meals for Day 1 so it requires zero brain effort tomorrow.',
        whatToExpect: 'You might feel a little caffeine or sugar withdrawal early on. Mostly, you’ll feel clarity and relief that you finally have a system in place.',
        whatMattersMost: 'Having all your supplements purchased and tomorrow’s meals completely figured out.',
        commonMistakes: 'Trying to fast or "detox" today. Don’t push it. Just prep the environment.',
        nextPhaseBridge: 'A perfect Prep Day means tomorrow morning you just wake up and execute without friction.',
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
        title: 'Week 1: Fungal Flush',
        dayRange: 'Days 1-7',
        shortPromise: 'Starve the yeast and break the fungal shield before we go after the deeper parasites.',
        overview: 'We do not start by dropping a nuclear bomb on your gut. We start by stripping away the fungal overgrowth (like Candida) that creates a protective biofilm over everything else. This is the critical first pass.',
        why: 'Most cleanses fail because they attack parasites first, but parasites hide underneath thick fungal walls. If you don’t flush the fungus first, the parasite cleanse just bounces off.',
        whatIsHappening: 'As we cut off their sugar supply and introduce targeted antifungals, the yeast colonies begin to starve and break apart. The binders you are taking will catch these dead toxins and sweep them into your stool.',
        whatChanges: 'Your diet tightens. Sugar is completely cut. Your supplement routine points directly toward keeping the dead fungal toxins moving rapidly out of your system.',
        whatToExpect: 'You may experience brain fog, sugar cravings, or fatigue as the fungal colonies die off and release temporary toxins (die-off). This is physiological proof the protocol is working.',
        whatMattersMost: 'Taking your binders exactly on time and drinking massive amounts of water to flush the system.',
        commonMistakes: 'Caving to sugar cravings on Day 3, or skipping binders and letting the toxins re-absorb into your bloodstream.',
        nextPhaseBridge: 'By the end of Week 1, the fungal shield is broken. The parasites have nowhere left to hide. Now we strike.',
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
                description: 'This is where people usually decide whether they trust the structure or start freestyling.',
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
        title: 'Week 2: Parasite Purge',
        dayRange: 'Days 8-14',
        shortPromise: 'Evict the deep-rooted parasites now that their fungal armor is gone.',
        overview: 'This is the main event. We are introducing strong, targeted herbs to paralyze and expel the parasites that have been draining your energy and hijacking your gut for potentially years.',
        why: 'Parasites steal your nutrients, spike your cortisol, and lay eggs that create chronic cycles of bloating and exhaustion. We must disrupt their lifecycle and forcefully clear them out.',
        whatIsHappening: 'The herbal compounds are paralyzing adult parasites so they let go of your intestinal walls, while other compounds attempt to neutralize their eggs. Your body will aggressively push this debris into your bowels for elimination.',
        whatChanges: 'We introduce the heaviest, most potent supplements of the entire protocol. You must maintain absolute consistency with your daily routine.',
        whatToExpect: 'Visual confirmation in your stool (yes, really). You might also feel emotional swings, sudden fatigue, or mild nausea as the massive parasite burden is neutralized.',
        whatMattersMost: 'Daily bowel movements. If the dead parasites stay inside you, they become highly toxic. You must keep the bowels moving.',
        commonMistakes: 'Freaking out when you see things in the toilet and stopping the protocol out of fear. Keep going. Better out than in.',
        nextPhaseBridge: 'With the massive biological burden of parasites lifted, Week 3 will step in to mop up the heavy metals they leave behind in their wake.',
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
        title: 'Week 3: Metal Detox',
        dayRange: 'Days 15-21',
        shortPromise: 'Magnetize and extract the deep-rooted metals and lock in a permanent clean state.',
        overview: 'Parasites act like sponges for heavy metals. When you kill them in Week 2, they release those toxic metals back into your system. Week 3 is the ultimate clean-up operation to bind those metals and pull them out for good.',
        why: 'If you stop after Week 2, you are leaving toxic sludge floating in your bloodstream. This causes long-term brain fog, mood swings, and fatigue. We have to finish the job cleanly.',
        whatIsHappening: 'We introduce powerful chelators (like Chlorella or Zeolite) that act like magnetic sponges. They attach to metal particles in your tissue and safely escort them out through your urine and stool.',
        whatChanges: 'The intense parasite herbs are dialed back, and powerful binding agents take priority. The strategy shifts entirely from "killing" to "clearing".',
        whatToExpect: 'A sudden, profound lifting of brain fog. As the metals leave, many people report feeling "lighter", sharper, and more energetic than they have in a decade.',
        whatMattersMost: 'Hydration. Metals are dense and toxic—your kidneys need maximum water flow to filter them out safely without getting bogged down.',
        commonMistakes: 'Stopping early because you "feel fine". Do not skip the metal detox; it is the true secret to preventing a relapse.',
        nextPhaseBridge: 'Once this week is complete, your gut is a blank slate. You are ready to transition into long-term maintenance and rebuilding.',
        shoppingPhase: 'Heavy Metal Detox',
        milestones: [
            {
                id: 'day-15',
                label: 'Shift',
                title: 'Day 15',
                description: 'The metal phase begins. This is where calm flush-support matters more than bravado.',
                startDay: 15,
            },
            {
                id: 'maintenance',
                label: 'Finish',
                title: 'Completion and maintenance',
                description: 'Day 21 is a graduation. Keep the habits that created baseline stability.',
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
