import { useEffect, useState, type ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ShoppingCart, Utensils, X } from 'lucide-react';
import { ProtocolRoadmap } from '@/components/journal/ProtocolRoadmap';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getCoachDailyNote } from '@/lib/coach-daily-note';

interface ProtocolReferenceProps {
    currentPhase: number;
    currentDay: number;
    onOpenShoppingView: () => void;
    onOpenRecipesView?: () => void;
    onOpenRoadmapView: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

const getGuideQuoteSeed = (currentDay: number, date = new Date()) => {
    if (typeof window === 'undefined') {
        return 0;
    }

    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const storageKey = `guide-quote-seed:${dateKey}:day-${currentDay}`;
    const rawSeed = window.localStorage.getItem(storageKey);
    const parsedSeed = rawSeed ? Number.parseInt(rawSeed, 10) : 0;
    const safeSeed = Number.isFinite(parsedSeed) && parsedSeed >= 0 ? parsedSeed : 0;

    window.localStorage.setItem(storageKey, String(safeSeed + 1));
    return safeSeed;
};

export const ProtocolReference = ({
    currentPhase,
    currentDay,
    onOpenShoppingView,
    onOpenRecipesView,
    onOpenRoadmapView,
    isOpen,
    onToggle,
}: ProtocolReferenceProps) => {
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
                                data-guide-close="true"
                                className="h-7 w-7"
                                onClick={onToggle}
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                <GuideContent
                                    currentDay={currentDay}
                                    currentPhase={currentPhase}
                                    onOpenShoppingView={onOpenShoppingView}
                                    onOpenRecipesView={onOpenRecipesView}
                                    onOpenRoadmapView={onOpenRoadmapView}
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
    onOpenRecipesView,
    onOpenRoadmapView,
}: {
    currentPhase: number;
    currentDay: number;
    onOpenShoppingView: () => void;
    onOpenRecipesView?: () => void;
    onOpenRoadmapView: () => void;
}) {
    return (
        <GuideContent
            currentPhase={currentPhase}
            currentDay={currentDay}
            onOpenShoppingView={onOpenShoppingView}
            onOpenRecipesView={onOpenRecipesView}
            onOpenRoadmapView={onOpenRoadmapView}
        />
    );
}

function GuideContent({
    currentPhase,
    currentDay,
    onOpenShoppingView,
    onOpenRecipesView,
    onOpenRoadmapView,
}: {
    currentPhase: number;
    currentDay: number;
    onOpenShoppingView: () => void;
    onOpenRecipesView?: () => void;
    onOpenRoadmapView: () => void;
}) {
    const [quoteSeed, setQuoteSeed] = useState(() => getGuideQuoteSeed(currentDay));
    const [quoteSeedDay, setQuoteSeedDay] = useState(currentDay);
    const dailyNote = getCoachDailyNote(currentDay, new Date(), quoteSeed);

    useEffect(() => {
        if (quoteSeedDay === currentDay) {
            return;
        }

        setQuoteSeedDay(currentDay);
        setQuoteSeed(getGuideQuoteSeed(currentDay));
    }, [currentDay, quoteSeedDay]);

    return (
        <div className="space-y-2.5">
            <GuideQuoteCard
                dateLabel={dailyNote.dateLabel}
                quote={dailyNote.quote}
                author={dailyNote.author}
                support={dailyNote.support}
            />

            <PrimaryGuideCard
                actionKey="open-shopping"
                eyebrow="Quick access"
                tone="neutral"
                title="Shopping list"
                description="Open by week, buy what you need now, and keep the rest collapsed until you need it."
                actionLabel="Open shopping list"
                icon={<ShoppingCart className="h-3.5 w-3.5" />}
                onClick={onOpenShoppingView}
            />

            {onOpenRecipesView && (
                <PrimaryGuideCard
                    actionKey="open-recipes"
                    eyebrow="Protocol library"
                    tone="neutral"
                    title="Recipes"
                    description="Use the protocol defaults, save your own recipes, and let GutBrain build one with you."
                    actionLabel="Open recipes"
                    icon={<Utensils className="h-3.5 w-3.5" />}
                    onClick={onOpenRecipesView}
                />
            )}

            <ProtocolRoadmap
                currentDay={currentDay}
                currentPhase={currentPhase}
                onOpenRoadmapView={onOpenRoadmapView}
            />
        </div>
    );
}

function PrimaryGuideCard({
    actionKey,
    eyebrow,
    tone = 'neutral',
    title,
    description,
    actionLabel,
    icon,
    onClick,
}: {
    actionKey?: string;
    eyebrow?: string;
    tone?: 'neutral' | 'emerald';
    title: string;
    description: string;
    actionLabel: string;
    icon: ReactNode;
    onClick: () => void;
}) {
    return (
        <section
            className={cn(
                'rounded-2xl border px-3 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]',
                tone === 'emerald'
                    ? 'border-primary/28 bg-card/80'
                    : 'border-border/60 bg-card/72',
            )}
        >
            <div>
                {eyebrow && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                        {eyebrow}
                    </p>
                )}
                <p className="mt-1 text-[15px] font-semibold leading-5 text-foreground">{title}</p>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{description}</p>
            </div>
            <Button
                variant="outline"
                size="sm"
                data-guide-action={actionKey}
                className={cn(
                    'mt-2.5 h-9 w-full justify-between rounded-xl px-3 text-[12px] font-medium',
                    tone === 'emerald'
                        ? 'border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.10]'
                        : 'border-border/60 bg-background/40 hover:bg-muted/25',
                )}
                onClick={onClick}
            >
                {actionLabel}
                {icon}
            </Button>
        </section>
    );
}

function GuideQuoteCard({
    dateLabel,
    quote,
    author,
    support,
}: {
    dateLabel: string;
    quote: string;
    author: string;
    support: string;
}) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-primary/28 bg-card/80 px-4 py-3.5 shadow-[inset_0_1px_0_hsl(var(--background)/0.35)]">
            <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full pointer-events-none" />
            <div className="relative z-10 border-l-2 border-primary/50 pl-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/90">
                        Daily quote
                    </p>
                    <p className="text-[10px] text-muted-foreground">{dateLabel}</p>
                </div>

                <p className="mt-2 text-[14px] leading-6 text-foreground font-medium italic">
                    "{quote}"
                </p>

                <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                    {author}
                </p>
                <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                    {support}
                </p>
            </div>
        </section>
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
