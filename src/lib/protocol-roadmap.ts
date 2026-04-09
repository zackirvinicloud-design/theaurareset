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
        shortPromise: 'Stabilize inputs and elimination so active cleansing starts on a controlled baseline.',
        overview: 'Prep Day is systems setup. You reduce inflammatory food triggers, lock your daily timing, and protect elimination pathways before active microbial pressure begins.',
        why: 'Detox byproducts have to leave the body through stool, bile, urine, and sweat. If those exits are slow, symptoms rise and the protocol gets noisy. Prep Day protects clearance first so later phases are safer and easier to read.',
        whatIsHappening: 'You are lowering incoming gut stress while building a predictable routine for hydration, meals, binder windows, and bowel regularity. This lowers baseline chaos before Week 1 applies direct pressure.',
        whatChanges: 'Your kitchen and schedule are restructured for execution. Meals become cleaner, supplement timing becomes consistent, and tomorrow is pre-decided so Day 1 starts with low friction.',
        whatToExpect: 'Use What\'s normal today for symptom reassurance. In the roadmap, the signal is execution: clarity of setup, not intensity.',
        whatMattersMost: 'Complete essentials first: starter shopping, food cleanup, supplement layout, and tomorrow\'s first two meals.',
        commonMistakes: 'Overbuying, overreading, and trying to “detox hard” before the system is ready to clear.',
        nextPhaseBridge: 'A clean Prep Day creates the metabolic and logistical baseline Week 1 needs for fungal-terrain cleanup.',
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
        shortPromise: 'Lower fungal/biofilm terrain first so parasite targeting is less chaotic in Week 2.',
        overview: 'Week 1 targets fungal overgrowth and the terrain that sustains it: high sugar flux, unstable digestion, and weak clearance rhythm. This is the foundational “terrain reset” week.',
        why: 'Protocol logic: do not start with the loudest kill phase. Fungal colonies and biofilm-like terrain can protect mixed microbial communities. In this protocol model, reducing that terrain first makes downstream parasite work cleaner and more controlled.',
        whatIsHappening: 'Diet and antifungal support reduce fungal pressure while binders, hydration, and bowel support help carry out mobilized byproducts. You are clearing fuel sources and weakening habitat, not chasing dramatic day-to-day swings.',
        whatChanges: 'Compliance gets strict: cleaner meals, tighter timing, consistent hydration, and predictable binder windows. Week 1 works when routine is repeatable, not heroic.',
        whatToExpect: 'Symptom reassurance belongs in What\'s normal today. In roadmap terms, Week 1 is about lowering fungal terrain and strengthening clearance reliability.',
        whatMattersMost: 'Keep sugar low, meals simple, timing stable, and elimination moving.',
        commonMistakes: 'Jumping straight to parasite intensity, changing protocol daily, or letting timing drift because symptoms feel distracting.',
        nextPhaseBridge: 'By Day 8, a lower-fungal terrain and steadier clearance rhythm set up parasite-phase execution with less systemic noise.',
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
        shortPromise: 'Apply parasite-focused pressure on top of Week 1 terrain cleanup.',
        overview: 'Week 2 is the targeted parasite phase. It is intentionally sequenced after fungal cleanup so the gut environment and elimination rhythm are more stable before pressure increases.',
        why: 'Week 2 is typically the most active phase. In this protocol model, parasites and egg-cycle persistence are harder to address when fungal terrain is still high. Week 1 lowers that terrain first, then Week 2 targets parasites with the same clearance foundation intact.',
        whatIsHappening: 'Parasite-focused support is layered onto Week 1 fundamentals. The body must process additional microbial debris, so binder timing, hydration, bowel regularity, and liver support remain non-negotiable.',
        whatChanges: 'Execution discipline matters most here: less improvising, tighter timing, and faster recovery after any slip.',
        whatToExpect: 'Use What\'s normal today for symptom interpretation. The roadmap job is protocol logic: target load reduction plus debris clearance without losing control.',
        whatMattersMost: 'Maintain Week 1 foundation while applying parasite-targeted pressure.',
        commonMistakes: 'Dropping basics because the phase feels intense, chasing internet protocol edits, or abandoning binder windows.',
        nextPhaseBridge: 'A controlled Week 2 reduces residual burden and prepares Week 3 for bind-and-clear consolidation.',
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
        shortPromise: 'Consolidate with bind-and-clear support so you finish stable, not depleted.',
        overview: 'Week 3 is a controlled cleanup phase focused on residual burden. The strategy shifts from “push harder” to “clear smarter” with recovery capacity protected.',
        why: 'Heavy-metal burden is linked in toxicology and microbiome research to oxidative stress and gut disruption. This phase is last because clearance is best tolerated after food rhythm, microbial load, and elimination consistency are already stabilized.',
        whatIsHappening: 'Bind-and-clear support is prioritized while nervous-system load is managed through sleep, hydration, and bowel regularity. The goal is to lower lingering burden without triggering avoidable instability.',
        whatChanges: 'Pacing and recovery become technical tools, not optional habits. Clean repetition beats intensity in this final stretch.',
        whatToExpect: 'Use What\'s normal today for symptom calls. The roadmap focus is completion strategy and phase logic.',
        whatMattersMost: 'Protect sleep, hydration, elimination, and consistency while finishing the final stack cleanly.',
        commonMistakes: 'Trying to force a dramatic finish, adding new experiments late, or under-supporting recovery.',
        nextPhaseBridge: 'Day 21 is a handoff to maintenance: keep the habits that produced signal and stability, then expand carefully.',
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
