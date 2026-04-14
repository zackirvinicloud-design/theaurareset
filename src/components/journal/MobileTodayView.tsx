import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Plus, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ChecklistSections, buildChecklistViewModel } from '@/components/journal/DailyChecklist';
import type {
    ChecklistState,
    CustomChecklistItem,
    MaintenanceHandoff,
    RecoveryState,
    TaskReminder,
} from '@/hooks/useJournalStore';
import { getChecklistSupport, getDayLabel, getJourneyStageLabel, getPhaseInfo } from '@/hooks/useProtocolData';
import { getTodayFocus } from '@/components/journal/ProtocolReference';
import { cn } from '@/lib/utils';
import { TaskReminderPicker } from '@/components/journal/TaskReminderPicker';
import type { ReminderDeliveryChannel } from '@/lib/sms';

interface MobileTodayViewProps {
    currentDay: number;
    currentPhase: number;
    checklist: ChecklistState;
    customItems: CustomChecklistItem[];
    taskReminders: TaskReminder[];
    recoveryState: RecoveryState | null;
    maintenanceHandoff: MaintenanceHandoff | null;
    pushReady?: boolean;
    focusedItemKey?: string | null;
    reminderComposerTargetKey?: string | null;
    onToggle: (itemKey: string) => void;
    onAddCustomItem: (label: string, source?: 'ai' | 'manual') => void;
    onRemoveCustomItem: (key: string) => void;
    onAskAbout: (label: string) => void;
    onOpenShoppingView: () => void;
    onResumeToday: () => void;
    onAskCoachAboutRecovery: () => void;
    onAskCoachAboutMaintenance: () => void;
    onReminderComposerOpenChange?: (itemKey: string, open: boolean) => void;
    onSetReminder: (input: {
        checklistKey: string;
        dayNumber: number;
        label: string;
        scheduledLocalTime: string;
        deliveryChannel?: ReminderDeliveryChannel;
        deepLinkTarget?: string;
    }) => Promise<void> | void;
    onClearReminder: (checklistKey: string, dayNumber: number) => void;
}

export const MobileTodayView = ({
    currentDay,
    currentPhase,
    checklist,
    customItems,
    taskReminders,
    recoveryState,
    maintenanceHandoff,
    pushReady = false,
    focusedItemKey,
    reminderComposerTargetKey,
    onToggle,
    onAddCustomItem,
    onRemoveCustomItem,
    onAskAbout,
    onOpenShoppingView,
    onResumeToday,
    onAskCoachAboutRecovery,
    onAskCoachAboutMaintenance,
    onReminderComposerOpenChange,
    onSetReminder,
    onClearReminder,
}: MobileTodayViewProps) => {
    const phase = getPhaseInfo(currentPhase);
    const dayLabel = getDayLabel(currentDay);
    const { completedCount, totalCount, completionPercent, nextItem } = buildChecklistViewModel(
        currentDay,
        checklist,
        customItems,
    );

    const showShoppingCta = currentDay === 0 || (currentDay >= 5 && currentDay <= 7) || (currentDay >= 12 && currentDay <= 14);
    const shoppingLabel = currentDay === 0
        ? 'Open shopping list'
        : currentDay >= 12
            ? 'Get Week 3 supplies ready'
            : 'Get Week 2 supplies ready';
    const shoppingHint = currentDay === 0
        ? 'Buy the starter stack now so Day 1 feels easy.'
        : currentDay >= 12
            ? 'Line up Week 3 buys before Day 15.'
            : 'Line up Week 2 buys before Day 8.';
    const stageLabel = getJourneyStageLabel(currentDay, currentPhase);
    const [showWhyThisMatters, setShowWhyThisMatters] = useState(false);
    const nextItemSupport = useMemo(
        () => (nextItem ? getChecklistSupport(nextItem.key, currentDay) : null),
        [currentDay, nextItem],
    );
    const nextReminder = nextItem
        ? taskReminders.find((reminder) => reminder.active && reminder.dayNumber === currentDay && reminder.checklistKey === nextItem.key)
        : undefined;
    const listReminderComposerTargetKey = reminderComposerTargetKey === nextItem?.key
        ? null
        : reminderComposerTargetKey;
    const [showAddInput, setShowAddInput] = useState(false);
    const [newItemText, setNewItemText] = useState('');

    useEffect(() => {
        setShowWhyThisMatters(false);
    }, [nextItem?.key]);

    const handleAddItem = () => {
        const trimmed = newItemText.trim();
        if (trimmed.length < 3) {
            return;
        }
        onAddCustomItem(trimmed, 'manual');
        setNewItemText('');
        setShowAddInput(false);
    };

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-6">
                <div className="space-y-6">
                    <section className="border-b border-border/50 pb-4">
                        <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0">
                                <p className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', phase.color)}>
                                    {stageLabel}
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

                    {recoveryState?.shouldShow && (
                        <section className="rounded-2xl border border-amber-300/40 bg-amber-500/[0.06] px-4 py-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-full bg-amber-500/12 p-2 text-amber-700">
                                    <AlertCircle className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 space-y-2">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700/80">
                                            Missed today?
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-foreground">
                                            {recoveryState.daysOff === 1 ? 'You are one day off.' : `You are ${recoveryState.daysOff} days off.`}
                                        </p>
                                    </div>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {recoveryState.recoveryMessage}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Button size="sm" className="h-8 rounded-full px-3" onClick={onResumeToday}>
                                            Reset this day cleanly
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 rounded-full px-3" onClick={onAskCoachAboutRecovery}>
                                            Ask Coach if I should adjust
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

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
                                <div className="flex flex-wrap gap-2">
                                    <TaskReminderPicker
                                        itemKey={nextItem.key}
                                        dayNumber={currentDay}
                                        label={nextItem.label}
                                        timeOfDay={nextItem.timeOfDay}
                                        reminder={nextReminder}
                                        pushReady={pushReady}
                                        onSetReminder={onSetReminder}
                                        onClearReminder={onClearReminder}
                                        open={reminderComposerTargetKey === nextItem.key ? true : undefined}
                                        onOpenChange={reminderComposerTargetKey === nextItem.key ? (open) => onReminderComposerOpenChange?.(nextItem.key, open) : undefined}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-full px-3 text-xs font-medium text-primary hover:bg-primary/8 hover:text-primary"
                                        onClick={() => setShowWhyThisMatters((value) => !value)}
                                    >
                                        Why this matters
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-full px-3 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                        onClick={() => onAskAbout(nextItem.label)}
                                    >
                                        Ask Coach
                                    </Button>
                                </div>
                                {showWhyThisMatters && nextItemSupport && (
                                    <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] px-3 py-3">
                                        <p className="text-sm leading-6 text-foreground">{nextItemSupport.why}</p>
                                        {nextItemSupport.timingHint && (
                                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                                {nextItemSupport.timingHint}
                                            </p>
                                        )}
                                    </div>
                                )}
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

                    {maintenanceHandoff && (
                        <section className="rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-4 shadow-sm">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                                        After Day 21
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-foreground">
                                        Keep the reset from fading the second you finish.
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {maintenanceHandoff.coreHabitsToKeep.map((habit) => (
                                        <p key={habit}>- {habit}</p>
                                    ))}
                                </div>
                                <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        Watch for
                                    </p>
                                    <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                                        {maintenanceHandoff.watchFors.map((item) => (
                                            <p key={item}>- {item}</p>
                                        ))}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="h-8 rounded-full px-3" onClick={onAskCoachAboutMaintenance}>
                                    Build my maintenance week
                                </Button>
                            </div>
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
                            taskReminders={taskReminders}
                            focusedItemKey={focusedItemKey}
                            reminderComposerTargetKey={listReminderComposerTargetKey}
                            onReminderComposerOpenChange={onReminderComposerOpenChange}
                            onSetReminder={onSetReminder}
                            onClearReminder={onClearReminder}
                            pushReady={pushReady}
                            variant="inline"
                        />
                        <div className="pt-1">
                            {showAddInput ? (
                                <div className="flex gap-1.5">
                                    <Input
                                        value={newItemText}
                                        onChange={(event) => setNewItemText(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                handleAddItem();
                                            }
                                        }}
                                        placeholder="Add a task..."
                                        className="h-8 text-xs"
                                        autoFocus
                                    />
                                    <Button size="sm" className="h-8 px-2" onClick={handleAddItem} disabled={newItemText.trim().length < 3}>
                                        <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-2"
                                        onClick={() => {
                                            setShowAddInput(false);
                                            setNewItemText('');
                                        }}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ) : completionPercent === 100 ? (
                                <div className="text-center py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-900/20 dark:to-primary/10 border border-emerald-200/50">
                                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        Today's plan is complete.
                                    </span>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs text-muted-foreground gap-1.5 h-8"
                                    onClick={() => setShowAddInput(true)}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add follow-up
                                </Button>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};
