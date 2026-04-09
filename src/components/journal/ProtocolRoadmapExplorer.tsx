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
    return phase.why;
}

function getTargetPoints(phase: ProtocolRoadmapPhase): string[] {
    if (phase.id === 'prep') {
        return [
            'Reduce high-sugar, high-trigger inputs that feed microbial overgrowth.',
            'Set bowel, hydration, and binder rhythm before active elimination starts.',
            'Convert the protocol from theory into a repeatable daily system.',
        ];
    }

    if (phase.id === 'week-1') {
        return [
            'Lower fungal overgrowth and biofilm-like terrain in the gut.',
            'Reduce fuel sources that keep fungal colonies active.',
            'Prepare cleaner terrain before parasite-focused pressure starts.',
        ];
    }

    if (phase.id === 'week-2') {
        return [
            'Apply parasite-focused pressure after Week 1 terrain cleanup.',
            'Disrupt active parasite burden and reduce cycle persistence.',
            'Keep debris clearance high so the phase is tolerable and controlled.',
        ];
    }

    return [
        'Bind and clear remaining toxic burden with tighter control.',
        'Support liver-bile-gut clearance while reducing system stress.',
        'Stabilize the body before maintenance instead of forcing intensity.',
    ];
}

function getScienceOutlinePoints(phase: ProtocolRoadmapPhase): string[] {
    if (phase.id === 'prep') {
        return [
            'Detox output has to leave through bowel, bile, urine, and sweat; Prep protects those exits first.',
            'Meal timing and hydration stabilize glucose and cortisol swings that amplify symptom noise.',
            'A stable baseline makes later phase signals easier to interpret.',
        ];
    }

    if (phase.id === 'week-1') {
        return [
            'Fungal organisms can form protective biofilm communities that are harder to clear when fed by sugar.',
            'Protocol logic: weaken fungal terrain first so downstream parasite targeting is cleaner.',
            'Week 1 focuses on terrain + elimination, not brute force intensity.',
        ];
    }

    if (phase.id === 'week-2') {
        return [
            'Parasite-focused compounds are introduced after terrain pressure is reduced.',
            'Protocol premise: once fungal terrain is lower, parasite load and egg-cycle persistence are easier to disrupt.',
            'The same clearance tools stay in place to remove mobilized debris and inflammatory byproducts.',
        ];
    }

    return [
        'Heavy-metal burden is associated with microbiome disruption and oxidative stress in toxicology literature.',
        'Week 3 uses a bind-and-clear approach to lower residual burden without destabilizing the nervous system.',
        'The finish is designed for controlled clearance and recovery, not escalation.',
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
                            Tap a phase for protocol logic: what it targets, why the order matters, and how to navigate the journey clearly.
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
                                                            <RoadmapMiniCard title="What this phase targets" points={getTargetPoints(phase)} />
                                                            <RoadmapMiniCard title="How to navigate this phase" points={getNavigationPoints(phase)} />
                                                        </div>

                                                        <RoadmapMiniCard title="Science outline" points={getScienceOutlinePoints(phase)} />

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
