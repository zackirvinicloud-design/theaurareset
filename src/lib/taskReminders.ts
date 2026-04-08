type ReminderTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface ReminderPreset {
    label: string;
    scheduledLocalTime: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

export function toLocalDateTimeInputValue(date: Date) {
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDateTime(value: string) {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function withTime(date: Date, hours: number, minutes: number) {
    const next = new Date(date);
    next.setHours(hours, minutes, 0, 0);
    return next;
}

function shiftDays(date: Date, amount: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
}

export function getReminderPresets(timeOfDay: ReminderTimeOfDay, now = new Date()): ReminderPreset[] {
    const in15 = new Date(now.getTime() + 15 * 60 * 1000);
    const in60 = new Date(now.getTime() + 60 * 60 * 1000);

    const morning = withTime(now, 8, 0);
    const afternoon = withTime(now, 13, 0);
    const evening = withTime(now, 19, 0);

    const tomorrowMorning = withTime(shiftDays(now, 1), 8, 0);
    const tomorrowAfternoon = withTime(shiftDays(now, 1), 13, 0);
    const tomorrowEvening = withTime(shiftDays(now, 1), 19, 0);
    const tonight = withTime(now, 20, 0);

    const suggestions: Record<ReminderTimeOfDay, ReminderPreset[]> = {
        morning: [
            { label: 'In 15 min', scheduledLocalTime: toLocalDateTimeInputValue(in15) },
            {
                label: morning > now ? 'This morning' : 'Tomorrow morning',
                scheduledLocalTime: toLocalDateTimeInputValue(morning > now ? morning : tomorrowMorning),
            },
            { label: 'In 1 hour', scheduledLocalTime: toLocalDateTimeInputValue(in60) },
        ],
        afternoon: [
            { label: 'In 15 min', scheduledLocalTime: toLocalDateTimeInputValue(in15) },
            {
                label: afternoon > now ? 'This afternoon' : 'Tomorrow afternoon',
                scheduledLocalTime: toLocalDateTimeInputValue(afternoon > now ? afternoon : tomorrowAfternoon),
            },
            { label: 'Tonight', scheduledLocalTime: toLocalDateTimeInputValue(tonight > now ? tonight : tomorrowMorning) },
        ],
        evening: [
            { label: 'In 15 min', scheduledLocalTime: toLocalDateTimeInputValue(in15) },
            { label: 'In 1 hour', scheduledLocalTime: toLocalDateTimeInputValue(in60) },
            {
                label: tonight > now ? 'Tonight' : 'Tomorrow evening',
                scheduledLocalTime: toLocalDateTimeInputValue(tonight > now ? tonight : tomorrowEvening),
            },
        ],
        anytime: [
            { label: 'In 15 min', scheduledLocalTime: toLocalDateTimeInputValue(in15) },
            { label: 'In 1 hour', scheduledLocalTime: toLocalDateTimeInputValue(in60) },
            {
                label: tonight > now ? 'Tonight' : 'Tomorrow morning',
                scheduledLocalTime: toLocalDateTimeInputValue(tonight > now ? tonight : tomorrowMorning),
            },
        ],
    };

    return suggestions[timeOfDay];
}

export function formatReminderTime(value: string) {
    const parsed = parseLocalDateTime(value);
    if (!parsed) {
        return 'Reminder set';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(parsed);
}
