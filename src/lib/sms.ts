import { parseLocalDateTime } from '@/lib/taskReminders';

export type ReminderDeliveryChannel = 'local' | 'push' | 'sms';

interface ProtocolDeepLinkOptions {
  view?: 'today' | 'shopping' | 'normal' | 'guide' | 'roadmap' | 'help';
  dayNumber?: number;
  checklistKey?: string | null;
  phase?: string | null;
  category?: string | null;
}

export interface ReminderSchedulePayload {
  scheduledLocalTime: string;
  scheduledAtUtc: string;
  timezone: string;
}

export const normalizePhoneE164 = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    const normalized = `+${digits.slice(1).replace(/\D/g, '')}`;
    return /^\+\d{10,15}$/.test(normalized) ? normalized : null;
  }

  const numeric = digits.replace(/\D/g, '');
  if (numeric.length === 10) {
    return `+1${numeric}`;
  }

  if (numeric.length === 11 && numeric.startsWith('1')) {
    return `+${numeric}`;
  }

  return null;
};

export const buildProtocolDeepLink = ({
  view = 'today',
  dayNumber,
  checklistKey,
  phase,
  category,
}: ProtocolDeepLinkOptions = {}) => {
  const params = new URLSearchParams();
  params.set('view', view);

  if (typeof dayNumber === 'number') {
    params.set('day', String(dayNumber));
  }

  if (checklistKey) {
    params.set('checklistKey', checklistKey);
  }

  if (phase) {
    params.set('phase', phase);
  }

  if (category) {
    params.set('category', category);
  }

  return `/protocol?${params.toString()}`;
};

export const buildReminderSchedulePayload = (scheduledLocalTime: string): ReminderSchedulePayload | null => {
  const parsed = parseLocalDateTime(scheduledLocalTime);
  if (!parsed) {
    return null;
  }

  return {
    scheduledLocalTime,
    scheduledAtUtc: parsed.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export const formatReminderDeliveryLabel = (channel: ReminderDeliveryChannel) => {
  if (channel === 'push') {
    return 'Push reminder';
  }

  return channel === 'sms' ? 'Text reminder' : 'In-app reminder';
};
