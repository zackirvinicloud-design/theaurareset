import { useEffect, useRef, useState } from 'react';
import { ChecklistItem, getChecklistForDay } from '@/hooks/useProtocolData';
import { ChecklistState, CustomChecklistItem, TaskReminder } from '@/hooks/useJournalStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, HelpCircle, Plus, X, Sparkles } from 'lucide-react';
import { TaskReminderPicker } from '@/components/journal/TaskReminderPicker';
import type { ReminderDeliveryChannel } from '@/lib/sms';

interface DailyChecklistProps {
    currentDay: number;
    currentPhase: number;
    checklist: ChecklistState;
    customItems: CustomChecklistItem[];
    onToggle: (itemKey: string) => void;
    onAddCustomItem: (label: string, source?: 'ai' | 'manual') => void;
    onRemoveCustomItem: (key: string) => void;
    onAskAbout?: (label: string) => void;
    taskReminders?: TaskReminder[];
    focusedItemKey?: string | null;
    reminderComposerTargetKey?: string | null;
    onReminderComposerOpenChange?: (itemKey: string, open: boolean) => void;
    onSetReminder?: (input: {
        checklistKey: string;
        dayNumber: number;
        label: string;
        scheduledLocalTime: string;
        deliveryChannel?: ReminderDeliveryChannel;
        deepLinkTarget?: string;
    }) => Promise<void> | void;
    onClearReminder?: (checklistKey: string, dayNumber: number) => void;
    smsReady?: boolean;
}

type ChecklistTimeOfDay = ChecklistItem['timeOfDay'];

export interface ChecklistDisplayItem {
    key: string;
    label: string;
    emoji: string;
    timeOfDay: ChecklistTimeOfDay;
    source: 'protocol' | 'ai' | 'manual';
}

export interface ChecklistViewModel {
    grouped: Record<ChecklistTimeOfDay, ChecklistDisplayItem[]>;
    followUps: ChecklistDisplayItem[];
    allItems: ChecklistDisplayItem[];
    completedCount: number;
    totalCount: number;
    completionPercent: number;
    nextItem: ChecklistDisplayItem | null;
}

interface ChecklistSectionsProps {
    currentDay: number;
    checklist: ChecklistState;
    customItems: CustomChecklistItem[];
    onToggle: (itemKey: string) => void;
    onAskAbout?: (label: string) => void;
    onRemoveCustomItem?: (key: string) => void;
    variant?: 'panel' | 'inline';
    taskReminders?: TaskReminder[];
    focusedItemKey?: string | null;
    reminderComposerTargetKey?: string | null;
    onReminderComposerOpenChange?: (itemKey: string, open: boolean) => void;
    onSetReminder?: (input: {
        checklistKey: string;
        dayNumber: number;
        label: string;
        scheduledLocalTime: string;
        deliveryChannel?: ReminderDeliveryChannel;
        deepLinkTarget?: string;
    }) => Promise<void> | void;
    onClearReminder?: (checklistKey: string, dayNumber: number) => void;
    smsReady?: boolean;
}

const createEmptyGroups = (): Record<ChecklistTimeOfDay, ChecklistDisplayItem[]> => ({
    morning: [],
    afternoon: [],
    evening: [],
    anytime: [],
});

const TIME_LABELS: Record<ChecklistTimeOfDay, { label: string; emoji: string }> = {
    morning: { label: 'Morning', emoji: '🌅' },
    afternoon: { label: 'Afternoon', emoji: '☀️' },
    evening: { label: 'Evening', emoji: '🌙' },
    anytime: { label: 'Anytime', emoji: '📋' },
};

export function buildChecklistViewModel(
    currentDay: number,
    checklist: ChecklistState,
    customItems: CustomChecklistItem[],
): ChecklistViewModel {
    const protocolItems: ChecklistDisplayItem[] = getChecklistForDay(currentDay).map((item) => ({
        key: item.key,
        label: item.label,
        emoji: item.emoji,
        timeOfDay: item.timeOfDay,
        source: 'protocol',
    }));
    const followUps: ChecklistDisplayItem[] = customItems.map((item) => ({
        key: item.key,
        label: item.label,
        emoji: item.source === 'ai' ? '🤖' : '📌',
        timeOfDay: 'anytime',
        source: item.source,
    }));

    const grouped = createEmptyGroups();
    protocolItems.forEach((item) => {
        grouped[item.timeOfDay].push(item);
    });

    const allItems = [...protocolItems, ...followUps];
    const completedCount = allItems.filter((item) => checklist[item.key]).length;
    const totalCount = allItems.length;
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const nextItem = allItems.find((item) => !checklist[item.key]) ?? null;

    return {
        grouped,
        followUps,
        allItems,
        completedCount,
        totalCount,
        completionPercent,
        nextItem,
    };
}

export function ChecklistSections({
    currentDay,
    checklist,
    customItems,
    onToggle,
    onAskAbout,
    onRemoveCustomItem,
    variant = 'panel',
    taskReminders = [],
    focusedItemKey,
    reminderComposerTargetKey,
    onReminderComposerOpenChange,
    onSetReminder,
    onClearReminder,
    smsReady = false,
}: ChecklistSectionsProps) {
    const { grouped, followUps } = buildChecklistViewModel(currentDay, checklist, customItems);
    const remindersByKey = Object.fromEntries(
        taskReminders
            .filter((reminder) => reminder.active && reminder.dayNumber === currentDay)
            .map((reminder) => [`${reminder.dayNumber}:${reminder.checklistKey}`, reminder]),
    );

    return (
        <div className={cn('space-y-4', variant === 'inline' && 'space-y-6')}>
            {Object.entries(grouped).map(([timeKey, groupItems]) => {
                if (groupItems.length === 0) return null;
                const { label, emoji } = TIME_LABELS[timeKey as ChecklistTimeOfDay];

                return (
                    <div key={timeKey}>
                        <div
                            className={cn(
                                'mb-2 px-1',
                                variant === 'inline'
                                    ? 'border-b border-border/50 pb-2'
                                    : 'flex items-center gap-1.5',
                            )}
                        >
                            {variant === 'panel' && <span className="text-xs">{emoji}</span>}
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {label}
                            </span>
                        </div>
                        <div className={cn(variant === 'inline' ? 'space-y-0' : 'space-y-1')}>
                            {groupItems.map((item) => (
                                <ChecklistRow
                                    key={item.key}
                                    item={item}
                                    currentDay={currentDay}
                                    isChecked={!!checklist[item.key]}
                                    isFocused={focusedItemKey === item.key}
                                    reminder={remindersByKey[`${currentDay}:${item.key}`]}
                                    onToggle={onToggle}
                                    onAskAbout={onAskAbout}
                                    reminderComposerOpen={reminderComposerTargetKey === item.key}
                                    onReminderComposerOpenChange={onReminderComposerOpenChange}
                                    onSetReminder={onSetReminder}
                                    onClearReminder={onClearReminder}
                                    smsReady={smsReady}
                                    variant={variant}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {followUps.length > 0 && (
                <div>
                    <div
                        className={cn(
                            'mb-2 px-1',
                            variant === 'inline'
                                ? 'border-b border-border/50 pb-2'
                                : 'flex items-center gap-1.5',
                        )}
                    >
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Follow-ups
                        </span>
                    </div>
                    <div className={cn(variant === 'inline' ? 'space-y-0' : 'space-y-1')}>
                        <AnimatePresence>
                            {followUps.map((item) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <ChecklistRow
                                        item={item}
                                        currentDay={currentDay}
                                        isChecked={!!checklist[item.key]}
                                        isFocused={focusedItemKey === item.key}
                                        reminder={remindersByKey[`${currentDay}:${item.key}`]}
                                        onToggle={onToggle}
                                        onAskAbout={onAskAbout}
                                        onRemove={onRemoveCustomItem}
                                        reminderComposerOpen={reminderComposerTargetKey === item.key}
                                        onReminderComposerOpenChange={onReminderComposerOpenChange}
                                        onSetReminder={onSetReminder}
                                        onClearReminder={onClearReminder}
                                        smsReady={smsReady}
                                        variant={variant}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}

export const DailyChecklist = ({
    currentDay, currentPhase, checklist, customItems,
    onToggle, onAddCustomItem, onRemoveCustomItem, onAskAbout,
    taskReminders = [],
    focusedItemKey,
    reminderComposerTargetKey,
    onReminderComposerOpenChange,
    onSetReminder,
    onClearReminder,
    smsReady = false,
}: DailyChecklistProps) => {
    const [newItemText, setNewItemText] = useState('');
    const [showAddInput, setShowAddInput] = useState(false);

    const { completedCount, totalCount, completionPercent } = buildChecklistViewModel(
        currentDay,
        checklist,
        customItems,
    );

    const handleAddItem = () => {
        const trimmed = newItemText.trim();
        if (trimmed.length >= 3) {
            onAddCustomItem(trimmed, 'manual');
            setNewItemText('');
            setShowAddInput(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="font-semibold text-sm">Today's Plan</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Tap a step for context, check it off when done.
                        </p>
                    </div>
                    <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full self-start",
                        completionPercent === 100
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {completedCount}/{totalCount}
                    </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Checklist items */}
            <ScrollArea className="flex-1">
                <div className="p-3">
                    <ChecklistSections
                        currentDay={currentDay}
                        checklist={checklist}
                        customItems={customItems}
                        onToggle={onToggle}
                        onAskAbout={onAskAbout}
                        onRemoveCustomItem={onRemoveCustomItem}
                        taskReminders={taskReminders}
                        focusedItemKey={focusedItemKey}
                        reminderComposerTargetKey={reminderComposerTargetKey}
                        onReminderComposerOpenChange={onReminderComposerOpenChange}
                        onSetReminder={onSetReminder}
                        onClearReminder={onClearReminder}
                        smsReady={smsReady}
                    />
                </div>
            </ScrollArea>

            {/* Add custom item */}
            <div className="p-3 border-t border-border/50">
                {showAddInput ? (
                    <div className="flex gap-1.5">
                        <Input
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            placeholder="Add a task..."
                            className="h-8 text-xs"
                            autoFocus
                        />
                        <Button size="sm" className="h-8 px-2" onClick={handleAddItem} disabled={newItemText.trim().length < 3}>
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setShowAddInput(false); setNewItemText(''); }}>
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                ) : completionPercent === 100 ? (
                    <div className="text-center py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-900/20 dark:to-primary/10 border border-emerald-200/50">
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            ✨ Today's plan is complete.
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
        </div>
    );
};

function ChecklistRow({
    item,
    currentDay,
    isChecked,
    isFocused,
    reminder,
    onToggle,
    onAskAbout,
    onRemove,
    reminderComposerOpen,
    onReminderComposerOpenChange,
    onSetReminder,
    onClearReminder,
    smsReady,
    variant,
}: {
    item: ChecklistDisplayItem;
    currentDay: number;
    isChecked: boolean;
    isFocused: boolean;
    reminder?: TaskReminder;
    onToggle: (key: string) => void;
    onAskAbout?: (label: string) => void;
    onRemove?: (key: string) => void;
    reminderComposerOpen?: boolean;
    onReminderComposerOpenChange?: (itemKey: string, open: boolean) => void;
    onSetReminder?: (input: {
        checklistKey: string;
        dayNumber: number;
        label: string;
        scheduledLocalTime: string;
        deliveryChannel?: ReminderDeliveryChannel;
        deepLinkTarget?: string;
    }) => Promise<void> | void;
    onClearReminder?: (checklistKey: string, dayNumber: number) => void;
    smsReady?: boolean;
    variant: 'panel' | 'inline';
}) {
    const rowRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isFocused) {
            rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isFocused]);

    return (
        <div
            ref={rowRef}
            className={cn(
                'group/row relative rounded-xl transition-colors',
                variant === 'panel'
                    ? 'flex items-center gap-2.5'
                    : 'border-b border-border/40',
                isFocused && 'bg-primary/6 ring-1 ring-primary/20',
            )}
        >
            {/* Checkbox area — toggles completion */}
            <motion.button
                onClick={(e) => { e.stopPropagation(); onToggle(item.key); }}
                whileTap={{ scale: 0.85 }}
                className={cn(
                    'flex-shrink-0',
                    variant === 'inline' ? 'absolute left-0 top-1/2 -translate-y-1/2' : 'mt-0.5',
                )}
            >
                {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground" />
                )}
            </motion.button>

            <div
                className={cn(
                    'flex items-center gap-2.5',
                    variant === 'panel'
                        ? cn(
                            'w-full rounded-lg px-3 py-2 text-left transition-all duration-200',
                            isChecked
                                ? 'border border-primary/10 bg-primary/5'
                                : 'border border-transparent hover:bg-muted/50',
                        )
                        : cn(
                            'w-full min-h-[56px] pl-8 pr-1 py-3 text-left transition-colors',
                            isChecked ? 'bg-primary/5' : 'hover:bg-muted/20',
                        ),
                )}
            >
                {/* Label area — clicking marks the step complete */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(item.key);
                    }}
                    className={cn(
                        'flex-1 min-w-0 text-left',
                        variant === 'panel' ? 'text-xs flex items-center gap-1.5' : 'flex items-start gap-2.5 text-sm',
                    )}
                    title={isChecked ? 'Mark as not complete' : 'Mark as complete'}
                >
                    <span className={cn(variant === 'inline' ? 'text-base leading-none' : '')}>{item.emoji}</span>
                    <span
                        className={cn(
                            'transition-all duration-200',
                            isChecked ? 'line-through text-muted-foreground' : 'text-foreground group-hover/row:text-primary',
                            variant === 'inline' && 'leading-5',
                        )}
                    >
                        {item.label}
                    </span>
                </button>

                {onAskAbout && !isChecked && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAskAbout(item.label);
                        }}
                        className={cn(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                            variant === 'panel'
                                ? 'border-border/60 bg-background/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                        )}
                        title="Ask Coach about this step"
                    >
                        <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                )}

                {onSetReminder && onClearReminder && !isChecked && (
                    <TaskReminderPicker
                        itemKey={item.key}
                        dayNumber={currentDay}
                        label={item.label}
                        timeOfDay={item.timeOfDay}
                        reminder={reminder}
                        smsReady={smsReady}
                        onSetReminder={onSetReminder}
                        onClearReminder={onClearReminder}
                        variant="icon"
                        open={reminderComposerOpen ? true : undefined}
                        onOpenChange={reminderComposerOpen ? (open) => onReminderComposerOpenChange?.(item.key, open) : undefined}
                    />
                )}

                {onRemove && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.key);
                        }}
                        className={cn(
                            'p-1 rounded transition-opacity hover:bg-destructive/10',
                            variant === 'panel'
                                ? 'opacity-0 group-hover/row:opacity-100'
                                : 'opacity-100',
                        )}
                        title="Remove item"
                    >
                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                )}
            </div>
        </div>
    );
}
