import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, Clock3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TaskReminder } from '@/hooks/useJournalStore';
import { formatReminderTime, toLocalDateTimeInputValue } from '@/lib/taskReminders';
import { buildProtocolDeepLink, formatReminderDeliveryLabel, type ReminderDeliveryChannel } from '@/lib/sms';
import { cn } from '@/lib/utils';

interface TaskReminderPickerProps {
    itemKey: string;
    dayNumber: number;
    label: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
    reminder?: TaskReminder;
    smsReady?: boolean;
    onSetReminder: (input: {
        checklistKey: string;
        dayNumber: number;
        label: string;
        scheduledLocalTime: string;
        deliveryChannel?: ReminderDeliveryChannel;
        deepLinkTarget?: string;
    }) => Promise<void> | void;
    onClearReminder: (checklistKey: string, dayNumber: number) => void;
    variant?: 'button' | 'icon';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const QUICK_OFFSET_MINUTES = [
    { label: '5 minutes', minutes: 5 },
    { label: '10 minutes', minutes: 10 },
    { label: '15 minutes', minutes: 15 },
    { label: '30 minutes', minutes: 30 },
    { label: '45 minutes', minutes: 45 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
    { label: '3 hours', minutes: 180 },
    { label: '4 hours', minutes: 240 },
    { label: '6 hours', minutes: 360 },
    { label: '8 hours', minutes: 480 },
    { label: '12 hours', minutes: 720 },
    { label: '24 hours', minutes: 1440 },
];

export function TaskReminderPicker({
    itemKey,
    dayNumber,
    label,
    timeOfDay,
    reminder,
    smsReady = false,
    onSetReminder,
    onClearReminder,
    variant = 'button',
    open,
    onOpenChange,
}: TaskReminderPickerProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [customValue, setCustomValue] = useState(() => reminder?.scheduledLocalTime ?? toLocalDateTimeInputValue(new Date(Date.now() + 15 * 60 * 1000)));
    const [selectedQuickValue, setSelectedQuickValue] = useState<string | undefined>(undefined);
    const [deliveryChannel, setDeliveryChannel] = useState<ReminderDeliveryChannel>(reminder?.deliveryChannel ?? (smsReady ? 'sms' : 'local'));
    const [quickPresetBaseTime, setQuickPresetBaseTime] = useState(() => Date.now());
    const resolvedOpen = open ?? internalOpen;
    const quickOffsetPresets = QUICK_OFFSET_MINUTES.map((item) => ({
        label: item.label,
        scheduledLocalTime: toLocalDateTimeInputValue(new Date(quickPresetBaseTime + item.minutes * 60 * 1000)),
    }));

    useEffect(() => {
        setCustomValue(reminder?.scheduledLocalTime ?? toLocalDateTimeInputValue(new Date(Date.now() + 15 * 60 * 1000)));
        setSelectedQuickValue(undefined);
        setDeliveryChannel(reminder?.deliveryChannel ?? (smsReady ? 'sms' : 'local'));
    }, [reminder?.scheduledLocalTime, reminder?.deliveryChannel, smsReady]);

    useEffect(() => {
        if (!resolvedOpen) {
            return;
        }

        setQuickPresetBaseTime(Date.now());
        setSelectedQuickValue(undefined);
    }, [resolvedOpen]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (open === undefined) {
            setInternalOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };

    const handleSet = async (scheduledLocalTime: string) => {
        if (deliveryChannel === 'sms' && !smsReady) {
            return;
        }

        await onSetReminder({
            checklistKey: itemKey,
            dayNumber,
            label,
            scheduledLocalTime,
            deliveryChannel,
            deepLinkTarget: buildProtocolDeepLink({
                view: 'today',
                dayNumber,
                checklistKey: itemKey,
            }),
        });
        handleOpenChange(false);
    };

    return (
        <Dialog open={resolvedOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md rounded-2xl border-border/70 p-4 sm:p-5">
                <DialogHeader className="space-y-1 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Reminder
                    </p>
                    <DialogTitle className="text-base leading-6 text-foreground">{label}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {reminder && (
                        <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                            Current reminder: {formatReminderDeliveryLabel(reminder.deliveryChannel)} on {formatReminderTime(reminder.scheduledLocalTime)}
                        </p>
                    )}

                    <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Delivery
                        </p>
                        <Select
                            value={deliveryChannel}
                            onValueChange={(value) => setDeliveryChannel(value === 'sms' ? 'sms' : 'local')}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Choose where the reminder should show up" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="local">Browser notification</SelectItem>
                                <SelectItem value="sms" disabled={!smsReady}>Text message</SelectItem>
                            </SelectContent>
                        </Select>
                        {!smsReady && (
                            <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-3 text-xs leading-5 text-muted-foreground">
                                Text reminders are not set up on this account yet.
                                <div className="mt-2">
                                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs text-primary hover:bg-primary/8 hover:text-primary">
                                        <Link to={`/setup/text-reminders?redirect=${encodeURIComponent('/protocol')}&source=reminder-picker`}>
                                            Set up text reminders
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Quick picks
                        </p>
                        <Select
                            value={selectedQuickValue}
                            onValueChange={(value) => {
                                if (!value) return;
                                setSelectedQuickValue(value);
                                setCustomValue(value);
                            }}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue
                                    placeholder={
                                        reminder
                                            ? `Choose a quick time (current: ${formatReminderTime(reminder.scheduledLocalTime)})`
                                            : 'Choose a quick time'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {quickOffsetPresets.map((preset) => (
                                    <SelectItem key={preset.label} value={preset.scheduledLocalTime}>
                                        {preset.label} · {formatReminderTime(preset.scheduledLocalTime)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            <Clock3 className="h-3 w-3" />
                            Custom date and time
                        </label>
                        <Input
                            type="datetime-local"
                            value={customValue}
                            onChange={(event) => {
                                setSelectedQuickValue(undefined);
                                setCustomValue(event.target.value);
                            }}
                            className="h-10 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            className="h-9 flex-1 rounded-full"
                            disabled={deliveryChannel === 'sms' && !smsReady}
                            onClick={() => void handleSet(customValue)}
                        >
                            {deliveryChannel === 'sms' ? 'Save text reminder' : 'Set reminder'}
                        </Button>
                        {reminder && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-9 rounded-full px-2.5 text-muted-foreground"
                                onClick={() => {
                                    onClearReminder(itemKey, dayNumber);
                                    handleOpenChange(false);
                                }}
                            >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
