import { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    PROTOCOL_ROADMAP_PHASES,
    getProtocolRoadmapPhaseForDay,
    type ProtocolRoadmapPhase,
    type ProtocolRoadmapPhaseId,
} from '@/lib/protocol-roadmap';
import { cn } from '@/lib/utils';

interface ProtocolRoadmapExplorerProps {
    currentDay: number;
    currentPhase: number;
    onBack: () => void;
    onOpenShoppingView: (phaseName: string) => void;
    onAskCoach: (prompt: string) => void;
}

function getWhyNowDescription(phase: ProtocolRoadmapPhase) {
    return phase.why;
}

function getTargetPoints(phase: ProtocolRoadmapPhase): string[] {
    if (phase.id === 'prep') {
        return [
            'Reduce setup friction before Day 1 arrives.',
            'Get hydration, meals, and supplement layout into a usable rhythm.',
            'Convert the protocol from theory into a repeatable daily system.',
        ];
    }

    if (phase.id === 'week-1') {
        return [
            'Make the daily routine predictable enough to repeat.',
            'Reduce food and timing decisions that create midweek chaos.',
            'Prepare the system for the next stack change.',
        ];
    }

    if (phase.id === 'week-2') {
        return [
            'Add the next layer without losing the Week 1 foundation.',
            'Keep the day organized as the stack becomes busier.',
            'Use the app to prevent research spirals and random changes.',
        ];
    }

    return [
        'Finish the protocol without letting the final week get messy.',
        'Protect hydration, sleep, and timing while the stack changes again.',
        'Stabilize the handoff into maintenance instead of forcing intensity.',
    ];
}

function getScienceOutlinePoints(phase: ProtocolRoadmapPhase): string[] {
    if (phase.id === 'prep') {
        return [
            'Prep reduces friction before the daily stack starts.',
            'Meal timing and hydration make later days easier to execute.',
            'A stable baseline makes later choices easier to keep consistent.',
        ];
    }

    if (phase.id === 'week-1') {
        return [
            'Week 1 is mostly about rhythm, not heroics.',
            'Simple meals and clean timing remove a lot of avoidable noise.',
            'The less you improvise now, the easier later weeks become.',
        ];
    }

    if (phase.id === 'week-2') {
        return [
            'Week 2 works best as an adjustment to the routine, not a total reset.',
            'The same structure tools still matter: meals, timing, reminders, and shopping clarity.',
            'Daily check-ins are for recordkeeping, not for interpreting every sensation in real time.',
        ];
    }

    return [
        'Final-week success depends more on consistency than intensity.',
        'Hydration, sleep, and timing keep the finish cleaner.',
        'The finish is designed for control and follow-through, not escalation.',
    ];
}

function getCommonTrap(phase: ProtocolRoadmapPhase): string {
    if (phase.id === 'prep') {
        return 'Trying to buy everything or memorize the whole protocol in one night.';
    }

    if (phase.id === 'week-1') {
        return 'Adding random hacks or quitting timing when the week gets annoying.';
    }

    if (phase.id === 'week-2') {
        return 'Research spirals and changing the whole plan midweek.';
    }

    return 'Trying to force a dramatic finish instead of finishing calm.';
}

function getNavigationPoints(phase: ProtocolRoadmapPhase): string[] {
    if (phase.id === 'prep') {
        return [
            'Win condition: tomorrow feels obvious, not overwhelming.',
            'Do first: shopping essentials, kitchen cleanup, and supplement layout.',
            'Avoid: overbuying and overreading.',
        ];
    }

    if (phase.id === 'week-1') {
        return [
            'Win condition: clean food and consistent timing every day.',
            'Do first: lower sugar, keep hydration high, protect binder windows.',
            'Avoid: changing the plan every time discomfort appears.',
        ];
    }

    if (phase.id === 'week-2') {
        return [
            'Win condition: maintain Week 1 foundation while phase focus shifts.',
            'Do first: keep meals stable and clearance support predictable.',
            'Avoid: panic pivots and research spirals.',
        ];
    }

    return [
        'Win condition: finish steady with recovery capacity intact.',
        'Do first: sleep quality, elimination regularity, and consistency.',
        'Avoid: adding new “stronger” interventions late.',
    ];
}

function RoadmapMiniCard({ title, points }: { title: string; points: string[] }) {
    return (
        <div className="rounded-[18px] border border-border/60 bg-card/70 px-3 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]">
            <p className="text-[11px] font-semibold text-muted-foreground">{title}</p>
            <ul className="mt-2 space-y-2">
                {points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[13px] leading-6 text-muted-foreground">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/50" />
                        <span className="text-foreground/86">{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function ProtocolRoadmapExplorer({
    currentDay,
    currentPhase: _currentPhase,
    onBack,
    onOpenShoppingView: _onOpenShoppingView,
    onAskCoach: _onAskCoach,
}: ProtocolRoadmapExplorerProps) {
    const currentRoadmapPhase = getProtocolRoadmapPhaseForDay(currentDay);
    const [expandedPhaseId, setExpandedPhaseId] = useState<ProtocolRoadmapPhaseId | null>(null);

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex-shrink-0 border-b border-border/50 px-3 py-3 sm:px-4 lg:px-6">
                <div className="flex items-start gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-9 w-9 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground sm:text-[24px]">
                                Protocol roadmap
                            </h2>
                        </div>
                        <p className="mt-1 text-[13px] leading-6 text-muted-foreground sm:text-[15px]">
                            Tap a phase for planning logic: what changes, why the order matters, and how to stay organized through the handoff.
                        </p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
                    <section className="space-y-3">
                        {PROTOCOL_ROADMAP_PHASES.map((phase) => {
                            const isOpen = expandedPhaseId === phase.id;
                            const isCurrent = phase.id === currentRoadmapPhase.id;

                            return (
                                <div
                                    key={phase.id}
                                    className={cn(
                                        'overflow-hidden rounded-[22px] border bg-card/70 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)] transition-colors',
                                        isOpen ? 'border-primary/20 bg-card/85' : isCurrent ? 'border-primary/15' : 'border-border/60',
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setExpandedPhaseId((prev) => (prev === phase.id ? null : phase.id))}
                                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/20 sm:px-5 sm:py-5"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[12px] text-muted-foreground">
                                                {phase.railLabel} · {phase.dayRange}{isCurrent ? ' · Today' : ''}
                                            </p>
                                            <p className="mt-1 text-[20px] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-[24px]">
                                                {phase.title}
                                            </p>
                                            <p className="mt-2 max-w-[40ch] text-[14px] leading-7 text-muted-foreground sm:text-[15px]">
                                                {phase.shortPromise}
                                            </p>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                'h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform',
                                                isOpen && 'rotate-180',
                                            )}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.18 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-t border-border/50 bg-background/25 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                                                    <div className="space-y-3">
                                                        <div className="rounded-[18px] border border-border/60 bg-background/40 px-3 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]">
                                                            <p className="text-[11px] font-semibold text-muted-foreground">
                                                                Phase deep dive
                                                            </p>
                                                            <p className="mt-1 text-[14px] leading-7 text-foreground/85">
                                                                {phase.overview}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-[18px] border border-border/60 bg-background/40 px-3 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]">
                                                            <p className="text-[11px] font-semibold text-muted-foreground">
                                                                Why this phase comes now
                                                            </p>
                                                            <p className="mt-1 text-[14px] leading-7 text-foreground/85">
                                                                {getWhyNowDescription(phase)}
                                                            </p>
                                                        </div>

                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <RoadmapMiniCard title="What this phase focuses on" points={getTargetPoints(phase)} />
                                                            <RoadmapMiniCard title="How to navigate this phase" points={getNavigationPoints(phase)} />
                                                        </div>

                                                        <RoadmapMiniCard title="Planning notes" points={getScienceOutlinePoints(phase)} />

                                                        <p className="text-[12px] leading-6 text-muted-foreground">
                                                            <span className="font-medium text-foreground">Common trap:</span> {getCommonTrap(phase)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}
