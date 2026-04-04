import { useState } from 'react';
import { CheckCircle2, ChevronDown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChecklistSections, buildChecklistViewModel } from '@/components/journal/DailyChecklist';
import type { ChecklistState, CustomChecklistItem } from '@/hooks/useJournalStore';
import { getDayLabel, getPhaseInfo } from '@/hooks/useProtocolData';
import { getTodayBrief, getTodayFocus } from '@/components/journal/ProtocolReference';
import { ProtocolRoadmap } from '@/components/journal/ProtocolRoadmap';
import { cn } from '@/lib/utils';

interface MobileTodayViewProps {
    currentDay: number;
    currentPhase: number;
    checklist: ChecklistState;
    customItems: CustomChecklistItem[];
    onToggle: (itemKey: string) => void;
    onRemoveCustomItem: (key: string) => void;
    onAskAbout: (label: string) => void;
    onOpenShoppingView: () => void;
}

export const MobileTodayView = ({
    currentDay,
    currentPhase,
    checklist,
    customItems,
    onToggle,
    onRemoveCustomItem,
    onAskAbout,
    onOpenShoppingView,
}: MobileTodayViewProps) => {
    const [briefOpen, setBriefOpen] = useState(false);
    const phase = getPhaseInfo(currentPhase);
    const dayLabel = getDayLabel(currentDay);
    const todayBrief = getTodayBrief(currentDay, currentPhase);
    const { completedCount, totalCount, completionPercent, nextItem } = buildChecklistViewModel(
        currentDay,
        checklist,
        customItems,
    );

    const showShoppingCta = currentDay === 0 || (currentDay >= 5 && currentDay <= 7) || (currentDay >= 12 && currentDay <= 14);
    const shoppingLabel = currentDay === 0
        ? 'Open shopping list'
        : currentDay >= 12
            ? 'Shop Phase 4 supplies'
            : 'Shop Phase 3 supplies';
    const shoppingHint = currentDay === 0
        ? 'Buy the starter stack now so Day 1 feels easy.'
        : currentDay >= 12
            ? 'Get the heavy metal phase ready before Day 15.'
            : 'Get the parasite phase ready before Day 8.';


    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-6">
                <div className="space-y-6">
                    <section className="border-b border-border/50 pb-4">
                        <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0">
                                <p className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', phase.color)}>
                                    Phase {currentPhase}: {phase.shortName}
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                                    {dayLabel}
                                </h2>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-foreground">{completedCount}/{totalCount}</p>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                    steps done
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {getTodayFocus(currentDay, currentPhase)}
                        </p>
                        <div className="mt-4 space-y-2">
                            <Progress value={completionPercent} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Completion</span>
                                <span>{completionPercent}%</span>
                            </div>
                        </div>
                    </section>

                    <section
                        className={cn(
                            'rounded-2xl border px-4 py-4',
                            nextItem ? 'border-border/70 bg-card/80 shadow-sm' : 'border-primary/20 bg-primary/5',
                        )}
                    >
                        {nextItem ? (
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            Do next
                                        </p>
                                        <p className="mt-1 text-sm font-medium leading-6 text-foreground">
                                            {nextItem.emoji} {nextItem.label}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-full px-3"
                                        onClick={() => onToggle(nextItem.key)}
                                    >
                                        Done
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-0 text-xs font-medium text-primary hover:bg-transparent hover:text-primary"
                                    onClick={() => onAskAbout(nextItem.label)}
                                >
                                    Need context on this step?
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Today is complete.</p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Stay with the plan tonight and use Coach only if something still feels off.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {showShoppingCta && (
                        <section className="space-y-2">
                            <button
                                onClick={onOpenShoppingView}
                                className="flex w-full items-center justify-between rounded-2xl border border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/25"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground">{shoppingLabel}</p>
                                    <p className="text-xs leading-5 text-muted-foreground">{shoppingHint}</p>
                                </div>
                                <ShoppingCart className="h-4 w-4 flex-shrink-0 text-primary" />
                            </button>
                        </section>
                    )}

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Today&apos;s steps</h3>
                                <p className="text-xs text-muted-foreground">
                                    Tap a step for context. Check it off when done.
                                </p>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                                {completedCount}/{totalCount}
                            </span>
                        </div>
                        <ChecklistSections
                            currentDay={currentDay}
                            checklist={checklist}
                            customItems={customItems}
                            onToggle={onToggle}
                            onAskAbout={onAskAbout}
                            onRemoveCustomItem={onRemoveCustomItem}
                            variant="inline"
                        />
                    </section>

                    <section className="border-t border-border/50 pt-4">
                        <button
                            onClick={() => setBriefOpen((value) => !value)}
                            className="flex w-full items-center justify-between text-left"
                        >
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Today brief</h3>
                                <p className="text-xs text-muted-foreground">
                                    What to watch and how to keep the day simple.
                                </p>
                            </div>
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 text-muted-foreground transition-transform',
                                    briefOpen && 'rotate-180',
                                )}
                            />
                        </button>

                        {briefOpen && (
                            <div className="mt-4 space-y-4">
                                <BriefSection
                                    title="What matters"
                                    items={todayBrief.focus}
                                />
                                <BriefSection
                                    title="Watch for"
                                    items={todayBrief.watchFor}
                                />
                                <BriefSection
                                    title="Keep it simple"
                                    items={todayBrief.keepSimple}
                                />
                            </div>
                        )}
                    </section>

                    <ProtocolRoadmap
                        currentDay={currentDay}
                        currentPhase={currentPhase}
                    />
                </div>
            </div>
        </div>
    );
};

function BriefSection({
    title,
    items,
}: {
    title: string;
    items: string[];
}) {
    return (
        <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {title}
            </p>
            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
