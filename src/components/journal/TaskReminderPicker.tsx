import { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, Clock3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TaskReminder } from '@/hooks/useJournalStore';
import { formatReminderTime, getReminderPresets, toLocalDateTimeInputValue } from '@/lib/taskReminders';
import { cn } from '@/lib/utils';

interface TaskReminderPickerProps {
    itemKey: string;
    label: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
    reminder?: TaskReminder;
    onSetReminder: (input: { checklistKey: string; label: string; scheduledLocalTime: string }) => Promise<void> | void;
    onClearReminder: (checklistKey: string) => void;
    variant?: 'button' | 'icon';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function TaskReminderPicker({
    itemKey,
    label,
    timeOfDay,
    reminder,
    onSetReminder,
    onClearReminder,
    variant = 'button',
    open,
    onOpenChange,
}: TaskReminderPickerProps) {
    const presets = useMemo(() => getReminderPresets(timeOfDay), [timeOfDay]);
    const [internalOpen, setInternalOpen] = useState(false);
    const [customValue, setCustomValue] = useState(() => reminder?.scheduledLocalTime ?? presets[0]?.scheduledLocalTime ?? toLocalDateTimeInputValue(new Date()));
    const resolvedOpen = open ?? internalOpen;

    useEffect(() => {
        setCustomValue(reminder?.scheduledLocalTime ?? presets[0]?.scheduledLocalTime ?? toLocalDateTimeInputValue(new Date()));
    }, [presets, reminder?.scheduledLocalTime]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (open === undefined) {
            setInternalOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };

    const handleSet = async (scheduledLocalTime: string) => {
        await onSetReminder({
            checklistKey: itemKey,
            label,
            scheduledLocalTime,
        });
        handleOpenChange(false);
    };

    return (
        <Popover open={resolvedOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                {variant === 'icon' ? (
                    <button
                        type="button"
                        className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                            reminder
                                ? 'border-primary/25 bg-primary/8 text-primary hover:bg-primary/12'
                                : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                        )}
                        title={reminder ? `Reminder set for ${formatReminderTime(reminder.scheduledLocalTime)}` : 'Set reminder'}
                    >
                        {reminder ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                    </button>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                            'h-8 rounded-full px-3 text-xs',
                            reminder && 'border-primary/25 bg-primary/5 text-primary hover:bg-primary/10',
                        )}
                    >
                        {reminder ? <BellRing className="mr-1.5 h-3.5 w-3.5" /> : <Bell className="mr-1.5 h-3.5 w-3.5" />}
                        {reminder ? formatReminderTime(reminder.scheduledLocalTime) : 'Remind me'}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 rounded-2xl border-border/70 p-3">
                <div className="space-y-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Reminder
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
                    </div>

                    <div className="grid gap-2">
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => void handleSet(preset.scheduledLocalTime)}
                                className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/25"
                            >
                                <span>{preset.label}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatReminderTime(preset.scheduledLocalTime)}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            <Clock3 className="h-3 w-3" />
                            Pick a time
                        </label>
                        <Input
                            type="datetime-local"
                            value={customValue}
                            onChange={(event) => setCustomValue(event.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            className="h-8 flex-1 rounded-full"
                            onClick={() => void handleSet(customValue)}
                        >
                            Set reminder
                        </Button>
                        {reminder && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-full px-2.5 text-muted-foreground"
                                onClick={() => {
                                    onClearReminder(itemKey);
                                    handleOpenChange(false);
                                }}
                            >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
