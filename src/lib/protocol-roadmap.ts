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
        description: 'This protocol works best when the order stays simple: set up the environment, lock in the routine, then finish with consistency.',
    },
    {
        title: 'Consistency wins',
        description: 'If food, hydration, and timing fall apart, the protocol gets harder than it needs to be.',
    },
    {
        title: 'Support beats force',
        description: 'The goal is not to stack more intensity. The goal is to keep the day organized enough that you can actually finish.',
    },
];

export const PROTOCOL_ROADMAP_SURFACES: ProtocolRoadmapSurfaceHint[] = [
    {
        title: 'Today',
        description: 'Use this for execution. It is your daily move list, not the place to re-learn the whole protocol.',
    },
    {
        title: 'Guide',
        description: 'Use this when you need context, not another research spiral. Shopping, roadmap, and daily check-ins live here.',
    },
    {
        title: 'GutBrain',
        description: 'Use this when your real-life question does not fit neatly into a checklist and you need help with food, timing, shopping, or missed steps.',
    },
];

export const PROTOCOL_ROADMAP_PHASES: ProtocolRoadmapPhase[] = [
    {
        id: 'prep',
        phaseNumber: 1,
        railLabel: 'Prep Day',
        title: 'Prep Day and Foundation',
        dayRange: 'Day 0',
        shortPromise: 'Set the stage so Day 1 feels obvious instead of chaotic.',
        overview: 'Prep Day is not about doing more. It is about organizing your environment so tomorrow feels easy to follow. We are removing the decisions that usually break people by Day 3.',
        why: 'Willpower is a weak system. If your kitchen is a mess, your supplements are scattered, and tomorrow\'s meals are undefined, you will start overthinking immediately. Prep Day fixes that.',
        whatIsHappening: 'You are turning the protocol from information into a repeatable daily setup. The point is clarity, not intensity.',
        whatChanges: 'You clean up the kitchen, organize the supplements, and pre-plan meals for Day 1 so tomorrow requires less brainpower.',
        whatToExpect: 'Mostly relief. Once the setup is handled, the protocol stops feeling abstract and starts feeling doable.',
        whatMattersMost: 'Having all your supplements purchased and tomorrow’s meals completely figured out.',
        commonMistakes: 'Trying to do everything at once. Keep today focused on setup.',
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
        title: 'Week 1: Reset the routine',
        dayRange: 'Days 1-7',
        shortPromise: 'Lock in the daily rhythm before the plan gets more layered.',
        overview: 'Week 1 is where the protocol stops being a concept and starts becoming a routine. The biggest win is not intensity. It is keeping food, timing, and reminders steady enough that the checklist feels repeatable.',
        why: 'Most people do not fail because they lack motivation. They fail because the first week feels noisy, and they start improvising. This week is about building a rhythm you can trust.',
        whatIsHappening: 'Your day becomes more structured. Meals get simpler, timing matters more, and the checklist starts doing the thinking for you.',
        whatChanges: 'Sugar is cut, timing windows matter more, and the app becomes your daily reference instead of TikTok, PDFs, and screenshots.',
        whatToExpect: 'Some cravings, some friction, and a strong temptation to overthink. The goal is to keep choosing the simple next step.',
        whatMattersMost: 'Protecting timing windows, keeping meals predictable, and staying hydrated across the day.',
        commonMistakes: 'Adding random hacks, changing the plan midweek, or skipping the simple habits because they feel boring.',
        nextPhaseBridge: 'By the end of Week 1, the routine should feel familiar enough that Week 2 can slot in without drama.',
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
                description: 'Get the Week 2 supplies ready before the phase change sneaks up on you.',
                startDay: 5,
                endDay: 7,
            },
        ],
    },
    {
        id: 'week-2',
        phaseNumber: 3,
        railLabel: 'Week 2',
        title: 'Week 2: Keep the routine steady',
        dayRange: 'Days 8-14',
        shortPromise: 'Add the next layer without losing the routine that got you here.',
        overview: 'Week 2 changes the stack, but it should not change your discipline. The foundation from Week 1 stays in place while the middle of the day becomes a little more structured.',
        why: 'This section works best when it feels like an adjustment to the system, not a brand new protocol. The less you reinvent, the smoother it goes.',
        whatIsHappening: 'The checklist adds new steps, the shopping list shifts, and the timing windows matter even more because the day has more moving pieces.',
        whatChanges: 'You add the Week 2 stack, keep meals predictable, and use check-ins instead of trying to interpret every rough patch in real time.',
        whatToExpect: 'More temptation to research, compare, and second-guess. The app should keep bringing you back to the next practical move.',
        whatMattersMost: 'Keeping meals stable, staying hydrated, and following the timing windows cleanly.',
        commonMistakes: 'Turning every hard day into a research spiral or changing the whole plan because one day felt messy.',
        nextPhaseBridge: 'If Week 2 stays orderly, the final week feels like a controlled finish instead of another reset.',
        shoppingPhase: 'Parasite Elimination',
        milestones: [
            {
                id: 'day-8',
                label: 'Switch',
                title: 'Day 8',
                description: 'Week 2 starts here. The foundation should stay steady while the stack changes.',
                startDay: 8,
            },
            {
                id: 'days-10-14',
                label: 'Peak stretch',
                title: 'Days 10-14',
                description: 'This is usually the busiest section of the protocol. Calm execution matters more than intensity.',
                startDay: 10,
                endDay: 14,
            },
        ],
    },
    {
        id: 'week-3',
        phaseNumber: 4,
        railLabel: 'Week 3',
        title: 'Week 3: Finish with consistency',
        dayRange: 'Days 15-21',
        shortPromise: 'Keep the final week calm, orderly, and complete.',
        overview: 'Week 3 is a finish, not a victory lap. The stack changes again, but the job stays the same: keep the days simple enough that you actually finish what you started.',
        why: 'A messy final week turns a clean handoff into a half-finished protocol. This section protects the finish line.',
        whatIsHappening: 'The routine shifts again, but the checklist remains the anchor. Meals, timing, hydration, and consistency still do most of the work.',
        whatChanges: 'The final-week stack takes priority, and the goal becomes finishing steadily instead of chasing a dramatic result.',
        whatToExpect: 'A temptation to either coast because you are almost done or overpush because you want a strong finish. Both create noise.',
        whatMattersMost: 'Hydration, sleep, and sticking with the schedule all the way through Day 21.',
        commonMistakes: 'Stopping early because you feel close enough or adding extra intensity because you want to finish harder.',
        nextPhaseBridge: 'Once this week is complete, you should have a cleaner handoff into maintenance habits and a much clearer record of what worked for you.',
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
