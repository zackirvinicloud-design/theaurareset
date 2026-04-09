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
    onOpenNormalToday: () => void;
}

function getWhyNowDescription(phase: ProtocolRoadmapPhase) {
    if (phase.id === 'prep') {
        return 'Prep Day is about reducing chaos. Cleaner food, clear timing, and elimination support make the rest of the cleanse easier to follow and easier to interpret.';
    }

    if (phase.id === 'week-1') {
        return 'Week 1 lowers fungal overgrowth and sugar-driven pressure first. A calmer gut environment makes the parasite week less chaotic for most people.';
    }

    if (phase.id === 'week-2') {
        return 'Week 2 is usually louder. By now, meals and timing are steadier, so the body has more support in place when the focus shifts to parasites.';
    }

    return 'Week 3 is slower and more control-heavy. With a steady rhythm in place, it is easier to finish with calmer bind-and-clear support without crashing your energy.';
}

function getFocusPoints(phase: ProtocolRoadmapPhase): string[] {
    if (phase.id === 'prep') {
        return [
            'Shop the basics so tomorrow feels simple.',
            'Pick a realistic breakfast and lunch for Day 1.',
            'Organize supplements so you are not guessing.',
        ];
    }

    if (phase.id === 'week-1') {
        return [
            'Keep meals clean and simple (lower sugar).',
            'Stay steady with timing, hydration, and binders.',
            'Keep elimination moving before you add intensity.',
        ];
    }

    if (phase.id === 'week-2') {
        return [
            'Keep the Week 1 foundation steady.',
            'Hydration and binder timing matter more now.',
            'Do not panic and freelance when symptoms flare.',
        ];
    }

    return [
        'Go slower and prioritize sleep and recovery.',
        'Keep bowel regularity a priority.',
        'Finish clean: avoid adding extra experiments.',
    ];
}

function getExpectPoints(phase: ProtocolRoadmapPhase): string[] {
    if (phase.id === 'prep') {
        return [
            'Overwhelm from setup is normal.',
            'Cravings when you remove off-plan foods.',
            'Relief once tomorrow is planned.',
        ];
    }

    if (phase.id === 'week-1') {
        return [
            'Cravings or headaches as sugar drops.',
            'Energy dips and brain fog waves early on.',
            'Symptoms often level off once the routine stabilizes.',
        ];
    }

    if (phase.id === 'week-2') {
        return [
            'More noticeable bathroom changes.',
            'Energy and mood can come in waves.',
            'Days 10-14 are often the loudest stretch.',
        ];
    }

    return [
        'Tiredness if sleep and hydration slip.',
        'Sensitivity to timing and stress goes up.',
        'Some people feel clearer as the finish calms down.',
    ];
}

function getCommonTrap(phase: ProtocolRoadmapPhase): string {
    if (phase.id === 'prep') {
        return 'Trying to buy everything or memorize the whole protocol in one night.';
    }

    if (phase.id === 'week-1') {
        return 'Adding random hacks or quitting timing when symptoms hit.';
    }

    if (phase.id === 'week-2') {
        return 'Research spirals and overinterpreting every symptom.';
    }

    return 'Trying to force a dramatic finish instead of finishing calm.';
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
    onOpenNormalToday: _onOpenNormalToday,
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
                                Cleanse roadmap
                            </h2>
                        </div>
                        <p className="mt-1 text-[13px] leading-6 text-muted-foreground sm:text-[15px]">
                            Tap a phase to get the quick context: what it is doing, what you might notice, and what matters most.
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
                                                                Why this phase comes now
                                                            </p>
                                                            <p className="mt-1 text-[14px] leading-7 text-foreground/85">
                                                                {getWhyNowDescription(phase)}
                                                            </p>
                                                        </div>

                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <RoadmapMiniCard title="Focus" points={getFocusPoints(phase)} />
                                                            <RoadmapMiniCard title="What you might notice" points={getExpectPoints(phase)} />
                                                        </div>

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
