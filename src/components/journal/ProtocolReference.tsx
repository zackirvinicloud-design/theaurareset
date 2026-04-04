import { useState, type ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getDayLabel, getPhaseInfo } from '@/hooks/useProtocolData';
import { BookOpen, ChevronLeft, Info, Lightbulb, Pill, ShoppingCart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProtocolReferenceProps {
    currentPhase: number;
    currentDay: number;
    onOpenShoppingView: () => void;
    onOpenFullProtocolView: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

type GuideTab = 'start' | 'today' | 'phases' | 'tips';

const PHASE_ROADMAP = [
    {
        phase: 1 as const,
        days: 'Prep Day',
        objective: 'Get the kitchen, supplements, and headspace ready before Day 1 starts.',
        highlights: [
            'Finish shopping and remove obvious off-plan foods.',
            'Organize supplements and prep your first few meals.',
            'Set a simple reason for why you are doing this.',
        ],
        nextMove: 'Buy Foundation and Fungal supplies before Day 1.',
    },
    {
        phase: 2 as const,
        days: 'Days 1-7',
        objective: 'Run the base daily rhythm and layer in fungal support without adding chaos.',
        highlights: [
            'Keep meals compliant and sugar out.',
            'Take antifungal supports with the right meal timing.',
            'Notice die-off changes and mention them in chat instead of guessing.',
        ],
        nextMove: 'By around Day 5, start buying Phase 3 supplies.',
    },
    {
        phase: 3 as const,
        days: 'Days 8-14',
        objective: 'Keep the same base routine while parasite-focused supports come in.',
        highlights: [
            'Do not drop the foundation habits just because the phase changed.',
            'Expect stronger detox signals and keep binders consistent.',
            'Treat this as steady execution, not a reason to improvise.',
        ],
        nextMove: 'By around Day 12, start buying Phase 4 supplies.',
    },
    {
        phase: 4 as const,
        days: 'Days 15-21',
        objective: 'Finish the reset with heavy metal support and a calmer, steadier pace.',
        highlights: [
            'Go slower if symptoms feel too intense.',
            'Keep hydration, sleep, and elimination support high.',
            'Finish the protocol cleanly instead of adding extra experiments.',
        ],
        nextMove: 'Your job here is to finish strong and notice what changed by Day 21.',
    },
] as const;

const FOUNDATION_ANCHORS = [
    'Start the day with the morning routine before improvising.',
    'Keep meals compliant and hydration consistent.',
    'Take binders away from food and other supplements.',
    'Protect sleep so the protocol stays doable tomorrow too.',
];

export const ProtocolReference = ({
    currentPhase,
    currentDay,
    onOpenShoppingView,
    onOpenFullProtocolView,
    isOpen,
    onToggle,
}: ProtocolReferenceProps) => {
    const [activeTab, setActiveTab] = useState<GuideTab>('start');

    const tabs = [
        { key: 'start', label: 'Start', icon: Info },
        { key: 'today', label: 'Today', icon: Pill },
        { key: 'phases', label: 'Plan', icon: BookOpen },
        { key: 'tips', label: 'Tips', icon: Lightbulb },
    ] as const;

    return (
        <>
            {!isOpen && (
                <button
                    onClick={onToggle}
                    data-tour="guide-toggle"
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden lg:flex items-center gap-1 px-1.5 py-3 bg-background border border-r-0 border-border rounded-l-lg shadow-sm hover:bg-muted transition-colors"
                    title="Open guide"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <BookOpen className="w-3.5 h-3.5" />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        data-tour="guide-panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="hidden lg:flex flex-col fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 bg-background border-l border-border z-30"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <h3 className="font-semibold text-sm">Guide</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={onToggle}
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        <div className="flex border-b border-border/50">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2',
                                        activeTab === key
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                <GuideSections
                                    currentDay={currentDay}
                                    currentPhase={currentPhase}
                                    onOpenShoppingView={onOpenShoppingView}
                                    onOpenFullProtocolView={onOpenFullProtocolView}
                                    activeTab={activeTab}
                                />
                            </div>
                        </ScrollArea>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export function MobileProtocolReferenceContent({
    currentPhase,
    currentDay,
    onOpenShoppingView,
    onOpenFullProtocolView,
}: {
    currentPhase: number;
    currentDay: number;
    onOpenShoppingView: () => void;
    onOpenFullProtocolView: () => void;
}) {
    return (
        <div className="space-y-6 px-1">
            <StartTab
                currentDay={currentDay}
                onOpenShoppingView={onOpenShoppingView}
                onOpenFullProtocolView={onOpenFullProtocolView}
                showActionCards={false}
            />
            <TodayTab currentDay={currentDay} currentPhase={currentPhase} />
            <PlanTab currentPhase={currentPhase} />
            <TipsTab currentPhase={currentPhase} />
        </div>
    );
}

function GuideSections({
    currentDay,
    currentPhase,
    onOpenShoppingView,
    onOpenFullProtocolView,
    activeTab,
}: {
    currentDay: number;
    currentPhase: number;
    onOpenShoppingView: () => void;
    onOpenFullProtocolView: () => void;
    activeTab: GuideTab;
}) {
    return (
        <>
            {activeTab === 'start' && (
                <StartTab
                    currentDay={currentDay}
                    onOpenShoppingView={onOpenShoppingView}
                    onOpenFullProtocolView={onOpenFullProtocolView}
                    showActionCards={true}
                />
            )}
            {activeTab === 'today' && <TodayTab currentDay={currentDay} currentPhase={currentPhase} />}
            {activeTab === 'phases' && <PlanTab currentPhase={currentPhase} />}
            {activeTab === 'tips' && <TipsTab currentPhase={currentPhase} />}
        </>
    );
}

function StartTab({
    currentDay,
    onOpenShoppingView,
    onOpenFullProtocolView,
    showActionCards,
}: {
    currentDay: number;
    onOpenShoppingView: () => void;
    onOpenFullProtocolView: () => void;
    showActionCards: boolean;
}) {
    return (
        <div className="space-y-5">
            {showActionCards && (
                <InfoCard title="Need the shopping list?">
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Use this when you want the full protocol shopping list in the main workspace, with checkoffs and later-phase items kept visible.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={onOpenShoppingView}
                        data-tour="shopping-trigger"
                    >
                        Open shopping list
                        <ShoppingCart className="w-4 h-4" />
                    </Button>
                </InfoCard>
            )}

            {showActionCards && (
                <InfoCard title="Need the original written protocol?">
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Use the app for execution. Open the full protocol here when you want to read the original written source in the main workspace.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={onOpenFullProtocolView}
                        data-tour="protocol-trigger"
                    >
                        Open full protocol
                        <BookOpen className="w-4 h-4" />
                    </Button>
                </InfoCard>
            )}

            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-xs font-semibold text-primary mb-1">Right now</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentDay === 0
                        ? 'You are on Prep Day. Focus on setup, shopping, and making Day 1 feel easy.'
                        : `You are on ${getDayLabel(currentDay)}. Finish today's rhythm before you spend energy reading ahead.`}
                </p>
            </div>
        </div>
    );
}

function TodayTab({ currentDay, currentPhase }: { currentDay: number; currentPhase: number }) {
    const phase = getPhaseInfo(currentPhase);
    const todayBrief = getTodayBrief(currentDay, currentPhase);

    return (
        <div className="space-y-5">
            <div className={cn('p-3 rounded-lg border', phase.bgColor, phase.borderColor)}>
                <p className={cn('text-sm font-semibold mb-1', phase.color)}>
                    {getDayLabel(currentDay)} · Phase {currentPhase}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {getTodayFocus(currentDay, currentPhase)}
                </p>
            </div>

            <InfoCard title="What today is really about">
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The checklist is your exact plan. This section is here to tell you how to approach the day so it feels less random.
                    </p>
                    <div className="space-y-2">
                        {todayBrief.focus.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </InfoCard>

            <InfoCard title="Watch for">
                <div className="space-y-2">
                    {todayBrief.watchFor.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </InfoCard>

            <InfoCard title="Keep it simple">
                <div className="space-y-2">
                    {todayBrief.keepSimple.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </InfoCard>
        </div>
    );
}

function PlanTab({ currentPhase }: { currentPhase: number }) {
    const nextPhase = PHASE_ROADMAP.find((item) => item.phase === currentPhase + 1);

    return (
        <div className="space-y-5">
            <InfoCard title="Where you are in the reset">
                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p>
                        <span className="font-semibold text-foreground">Current:</span>{' '}
                        {PHASE_ROADMAP.find((item) => item.phase === currentPhase)?.days} · {getPhaseInfo(currentPhase).name}
                    </p>
                    <p>
                        <span className="font-semibold text-foreground">Next:</span>{' '}
                        {nextPhase ? `${nextPhase.days} · ${getPhaseInfo(nextPhase.phase).name}` : 'Finish and review what changed by Day 21.'}
                    </p>
                </div>
            </InfoCard>

            <InfoCard title="What stays steady">
                <div className="space-y-2">
                    {FOUNDATION_ANCHORS.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </InfoCard>

            <div className="space-y-3">
                {PHASE_ROADMAP.map((item) => {
                    const isCurrent = item.phase === currentPhase;
                    const isComplete = item.phase < currentPhase;
                    const isNext = item.phase === currentPhase + 1;
                    const phase = getPhaseInfo(item.phase);

                    return (
                        <div
                            key={item.phase}
                            className={cn(
                                'p-3 rounded-lg border transition-all',
                                isCurrent
                                    ? cn(phase.bgColor, phase.borderColor, 'shadow-sm')
                                    : 'border-border/50 bg-background'
                            )}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <p className={cn('text-sm font-semibold', isCurrent ? phase.color : 'text-foreground')}>
                                    Phase {item.phase}: {phase.shortName}
                                </p>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    {isCurrent ? 'Current' : isNext ? 'Next' : isComplete ? 'Done' : item.days}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-2">{item.days}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                {item.objective}
                            </p>
                            <div className="space-y-1.5 mb-3">
                                {item.highlights.map((highlight) => (
                                    <div key={highlight} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>{highlight}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 rounded-md bg-muted/50 border border-border/40">
                                <p className="text-[11px] font-medium text-foreground mb-0.5">Planning cue</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.nextMove}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TipsTab({ currentPhase }: { currentPhase: number }) {
    const phase = getPhaseInfo(currentPhase);

    return (
        <div className="space-y-5">
            <InfoCard title={`Phase ${currentPhase} tips`}>
                <div className="space-y-2">
                    {phase.tips.map((tip) => (
                        <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                        </div>
                    ))}
                </div>
            </InfoCard>

            <InfoCard title="General guidelines">
                <div className="space-y-2">
                    {[
                        'Drink at least 64oz of water daily. More if detox symptoms climb.',
                        'Avoid sugar, gluten, dairy, and processed foods for the full reset.',
                        'Go to bed on time. A late night can make the next day feel much harder.',
                        'If symptoms spike, simplify. Stay on plan before adding more variables.',
                    ].map((tip) => (
                        <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>{tip}</span>
                        </div>
                    ))}
                </div>
            </InfoCard>
        </div>
    );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="p-3 rounded-lg border border-border/60 bg-muted/30">
            <h4 className="text-sm font-semibold mb-2">{title}</h4>
            {children}
        </div>
    );
}

export function getTodayFocus(day: number, phase: number) {
    if (day === 0) {
        return 'Prep today so the real protocol feels straightforward tomorrow. Shopping, setup, and mental clarity matter more than trying to do everything at once.';
    }

    if (phase === 2) {
        return 'This week is about locking in the base routine and keeping antifungal support consistent without overcomplicating meals or timing.';
    }

    if (phase === 3) {
        return 'The foundation stays the same here. Your job is to stay steady while parasite-focused support and symptom tracking become more important.';
    }

    return 'This final stretch is about finishing calmly. Keep the base routine strong, support elimination, and avoid adding extra experiments.';
}

export function getTodayBrief(day: number, phase: number) {
    if (day === 0) {
        return {
            focus: [
                'Use today to reduce friction for tomorrow, not to prove discipline.',
                'Think in terms of setup: food, supplements, kitchen, schedule.',
                'Your win condition is being ready for Day 1, not finishing everything perfectly.',
            ],
            watchFor: [
                'Buying too much at once instead of what you need first.',
                'Turning prep into more research instead of making clear decisions.',
                'Forgetting to make tomorrow morning easy before you stop for the day.',
            ],
            keepSimple: [
                'Finish shopping, remove obvious off-plan food, and organize supplies.',
                'Pick a realistic breakfast and lunch for tomorrow now.',
                'If you feel overwhelmed, stop reading ahead and just prep the next 24 hours.',
            ],
        };
    }

    if (phase === 2) {
        return {
            focus: [
                'Keep the daily rhythm stable while fungal support does its job.',
                'Treat meals, hydration, and timing as the foundation of the whole phase.',
                'Consistency matters more than doing extra.',
            ],
            watchFor: [
                'Sugar creep, random snacks, or “just this once” decisions.',
                'Die-off symptoms making you think the plan is failing.',
                'Supplement timing getting sloppy because the day gets busy.',
            ],
            keepSimple: [
                'Stay on-plan with food before adding complexity.',
                'Protect binder timing and water intake.',
                'If symptoms spike, mention it in chat and simplify instead of improvising.',
            ],
        };
    }

    if (phase === 3) {
        return {
            focus: [
                'This phase works best when you keep the same base routine steady.',
                'Expect a little more intensity, but do not mistake intensity for needing a new plan.',
                'Your job is to stay observant and consistent.',
            ],
            watchFor: [
                'Dropping the foundation habits because you are focused on parasite support.',
                'Getting spooked by stronger detox signals or odd symptoms.',
                'Reading too far ahead instead of finishing the day in front of you.',
            ],
            keepSimple: [
                'Keep meals clean, hydration high, and binder timing steady.',
                'Use the chat to sanity-check symptoms instead of guessing.',
                'Plan ahead for Phase 4 shopping before the phase change sneaks up on you.',
            ],
        };
    }

    return {
        focus: [
            'The final stretch is about finishing cleanly, not turning the intensity up.',
            'Go slower and steadier if your system feels more reactive now.',
            'Recovery support matters just as much as the detox tools here.',
        ],
        watchFor: [
            'Adding new supplements or experiments because you want a stronger finish.',
            'Underestimating sleep, hydration, or elimination support.',
            'Confusing “keep going” with “push harder.”',
        ],
        keepSimple: [
            'Stay steady with the protocol you already have.',
            'If symptoms climb, reduce chaos before adding anything.',
            'Notice what is improving so you finish with useful signal, not just fatigue.',
        ],
    };
}
