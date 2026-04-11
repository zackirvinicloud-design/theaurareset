import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { buildShopKey, calculatePhase, findDefaultShoppingItem } from './useProtocolData';
import { buildProtocolDeepLink, buildReminderSchedulePayload, type ReminderDeliveryChannel } from '@/lib/sms';

// ── Types ──────────────────────────────────────────────

export interface UserProgress {
    currentDay: number;
    currentPhase: 1 | 2 | 3 | 4;
    streakCount: number;
    lastActiveDate: string | null;
    startDate: string;
}

export interface JournalEntry {
    id: string;
    threadId: string;
    dayNumber: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface ChatThread {
    id: string;
    title: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

type DailySymptomsRow = Tables<'daily_symptoms'>;
type DailyCheckinRow = Tables<'daily_checkins'>;
type ShoppingListItemRow = Tables<'shopping_list_items'>;
type ChatThreadRow = Tables<'chat_threads'>;

export type ShoppingListItemSource = 'protocol' | 'manual' | 'ai';

export interface ShoppingListOverride {
    id: string;
    key: string;
    phase: string;
    category: string;
    name: string;
    quantity?: string;
    notes?: string;
    optional?: string;
    source: ShoppingListItemSource;
    isHidden: boolean;
    createdAt: string;
}

export interface ShoppingListItemInput {
    phase: string;
    category: string;
    name: string;
    quantity?: string;
    notes?: string;
    optional?: string;
    source?: Extract<ShoppingListItemSource, 'manual' | 'ai'>;
}

export interface DailyCheckIn {
    id: string;
    dayNumber: number;
    energy?: number;
    adherence?: 'nailed' | 'mostly' | 'rough';
    mood?: 'great' | 'okay' | 'tough';
    note?: string;
    createdAt: string;
}

export interface ChecklistState {
    [itemKey: string]: boolean;
}

export interface CustomChecklistItem {
    key: string;
    label: string;
    source: 'ai' | 'manual';
    createdAt: string;
}

export interface TaskReminder {
    id: string;
    userId: string | null;
    dayNumber: number;
    checklistKey: string;
    label: string;
    scheduledLocalTime: string;
    scheduledAtUtc: string;
    timezone: string;
    deliveryChannel: ReminderDeliveryChannel;
    smsEnabled: boolean;
    deepLinkTarget: string;
    active: boolean;
    createdAt: string;
    deliveredAt?: string | null;
    lastSentAt?: string | null;
}

export interface RecoveryState {
    lastActiveDate: string | null;
    daysOff: number;
    recommendedResumeDay: number;
    recoveryMessage: string;
    shouldShow: boolean;
}

export interface MaintenanceHandoff {
    completionDate: string;
    coreHabitsToKeep: string[];
    watchFors: string[];
    nextPhasePrompt: string;
}

// ── Default Progress ───────────────────────────────────

const DEFAULT_PROGRESS: UserProgress = {
    currentDay: 0,
    currentPhase: 1,
    streakCount: 0,
    lastActiveDate: null,
    startDate: new Date().toISOString(),
};

// ── Local Storage Fallback Keys ────────────────────────

const LS_PROGRESS_KEY = 'gbj-progress';
const LS_ENTRIES_KEY = 'gbj-journal-entries';
const LS_THREADS_KEY = 'gbj-chat-threads';
const LS_ACTIVE_THREAD_KEY = 'gbj-active-chat-thread';
const LS_CHECKLIST_KEY = 'gbj-checklist';
const LS_CUSTOM_ITEMS_KEY = 'gbj-custom-items';
const LS_SYMPTOMS_KEY = 'gbj-symptoms';
const LS_CHECKIN_KEY = 'gbj-checkin';
const LS_SHOPPING_OVERRIDES_KEY = 'gbj-shopping-overrides';
const LS_TASK_REMINDERS_KEY = 'gbj-task-reminders';

function mapJournalEntryRow(row: Tables<'journal_entries'>): JournalEntry {
    return {
        id: row.id,
        threadId: row.thread_id,
        dayNumber: row.day_number,
        role: row.role as 'user' | 'assistant',
        content: row.content,
        createdAt: row.created_at,
    };
}

function mapChatThreadRow(row: ChatThreadRow): ChatThread {
    return {
        id: row.id,
        title: row.title,
        isArchived: row.is_archived,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapDailyCheckInRow(row: DailyCheckinRow): DailyCheckIn {
    return {
        id: row.id,
        dayNumber: row.day_number,
        energy: row.energy ?? undefined,
        adherence: row.adherence as DailyCheckIn['adherence'],
        mood: row.mood as DailyCheckIn['mood'],
        note: row.note ?? undefined,
        createdAt: row.created_at || new Date().toISOString(),
    };
}

function mapShoppingOverrideRow(row: ShoppingListItemRow): ShoppingListOverride {
    return {
        id: row.id,
        key: row.item_key,
        phase: row.phase_name,
        category: row.category_name,
        name: row.item_name,
        quantity: row.quantity ?? undefined,
        notes: row.notes ?? undefined,
        optional: row.optional ?? undefined,
        source: row.source as ShoppingListItemSource,
        isHidden: row.is_hidden,
        createdAt: row.created_at,
    };
}

function mapTaskReminderRow(row: Record<string, unknown>): TaskReminder {
    return {
        id: String(row.id),
        userId: typeof row.user_id === 'string' ? row.user_id : null,
        dayNumber: typeof row.day_number === 'number' ? row.day_number : 0,
        checklistKey: String(row.checklist_key),
        label: String(row.label),
        scheduledLocalTime: String(row.scheduled_local_time),
        scheduledAtUtc: String(row.scheduled_at_utc),
        timezone: String(row.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone),
        deliveryChannel: row.delivery_channel === 'sms' ? 'sms' : 'local',
        smsEnabled: Boolean(row.sms_enabled),
        deepLinkTarget: String(row.deep_link_target ?? buildProtocolDeepLink()),
        active: Boolean(row.active),
        createdAt: String(row.created_at ?? new Date().toISOString()),
        deliveredAt: typeof row.delivered_at === 'string' ? row.delivered_at : null,
        lastSentAt: typeof row.last_sent_at === 'string' ? row.last_sent_at : null,
    };
}

function normalizeShoppingMatch(value: string) {
    return value.trim().toLowerCase();
}

function lsGet<T>(key: string, fallback: T): T {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch {
        return fallback;
    }
}

function lsSet(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
}

function getTaskReminderStorageKey(userId: string | null) {
    return `${LS_TASK_REMINDERS_KEY}:${userId ?? 'guest'}`;
}

function getLocalTaskReminders(userId: string | null) {
    return lsGet<TaskReminder[]>(getTaskReminderStorageKey(userId), []);
}

function setLocalTaskReminders(userId: string | null, reminders: TaskReminder[]) {
    lsSet(getTaskReminderStorageKey(userId), reminders);
}

function parseProgressDate(value: string | null) {
    if (!value) {
        return null;
    }

    const hasExplicitTime = value.includes('T');
    const parsed = new Date(hasExplicitTime ? value : `${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateOnly(date: Date) {
    return date.toISOString().split('T')[0];
}

function createLocalThread(title = 'New chat'): ChatThread {
    const now = new Date().toISOString();
    return {
        id: `local-thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
    };
}

function normalizeLocalEntries(entries: JournalEntry[], fallbackThreadId: string): JournalEntry[] {
    return entries.map((entry) => ({
        ...entry,
        threadId: entry.threadId || fallbackThreadId,
    }));
}

function getLocalEntries(): JournalEntry[] {
    return lsGet<JournalEntry[]>(LS_ENTRIES_KEY, []);
}

function setLocalEntries(entries: JournalEntry[]) {
    lsSet(LS_ENTRIES_KEY, entries);
}

function mergeThreadEntriesIntoLocalCache(threadId: string, threadEntries: JournalEntry[]) {
    const existing = getLocalEntries();
    const normalizedExisting = normalizeLocalEntries(existing, threadId);
    const preserved = normalizedExisting.filter((entry) => entry.threadId !== threadId);
    setLocalEntries([...preserved, ...threadEntries]);
}

// ── Hook ───────────────────────────────────────────────

export function useJournalStore() {
    const [userId, setUserId] = useState<string | null>(null);
    const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [checklist, setChecklist] = useState<ChecklistState>({});
    const [customItems, setCustomItems] = useState<CustomChecklistItem[]>([]);
    const [shoppingOverrides, setShoppingOverrides] = useState<ShoppingListOverride[]>([]);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [checkIn, setCheckIn] = useState<DailyCheckIn | null>(null);
    const [taskReminders, setTaskReminders] = useState<TaskReminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const threadLoadRequestRef = useRef(0);
    const activeThreadIdRef = useRef<string | null>(null);

    // ── Auth listener ──────────────────────────────────

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUserId(session?.user?.id ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadEntriesForThread = useCallback(async (threadId: string | null) => {
        const requestId = ++threadLoadRequestRef.current;
        const isStaleRequest = () => threadLoadRequestRef.current !== requestId;

        if (!threadId) {
            if (!isStaleRequest()) {
                setEntries([]);
            }
            return;
        }

        const localEntriesRaw = getLocalEntries();
        const normalizedLocalEntries = normalizeLocalEntries(localEntriesRaw, threadId);
        const localThreadEntries = normalizedLocalEntries.filter((entry) => entry.threadId === threadId);
        const hadMissingThreadId = localEntriesRaw.some((entry) => !entry.threadId);

        if (!isStaleRequest()) {
            setEntries(localThreadEntries);
        }

        if (hadMissingThreadId) {
            setLocalEntries(normalizedLocalEntries);
        }

        if (userId) {
            const { data: ents, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', userId)
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true });

            if (isStaleRequest()) {
                return;
            }

            if (!error) {
                const mappedEntries = (ents || []).map(mapJournalEntryRow);
                if (mappedEntries.length > 0 || localThreadEntries.length === 0) {
                    setEntries(mappedEntries);
                }

                if (mappedEntries.length > 0) {
                    mergeThreadEntriesIntoLocalCache(threadId, mappedEntries);
                }
                return;
            }

            if (!localThreadEntries.length) {
                setEntries([]);
            }
            return;
        }

        if (!isStaleRequest()) {
            setEntries(localThreadEntries);
        }
    }, [userId]);

    // ── Load from Supabase (or localStorage fallback) ──

    useEffect(() => {
        if (userId === null) {
            // Load offline data
            setProgress(lsGet(LS_PROGRESS_KEY, DEFAULT_PROGRESS));
            const localEntries = getLocalEntries();
            const localThreadIds = new Set(
                localEntries
                    .filter((entry) => entry.role === 'user' && entry.content.trim().length > 0)
                    .map((entry) => entry.threadId)
                    .filter((threadId): threadId is string => Boolean(threadId))
            );
            const savedThreads = lsGet<ChatThread[]>(LS_THREADS_KEY, []);
            const threadsToUse = savedThreads.filter((thread) => localThreadIds.has(thread.id));
            const savedActiveThreadId = lsGet<string | null>(LS_ACTIVE_THREAD_KEY, null);
            const activeId = savedActiveThreadId && threadsToUse.some((thread) => thread.id === savedActiveThreadId)
                ? savedActiveThreadId
                : threadsToUse[0]?.id ?? null;

            setThreads(threadsToUse);
            setActiveThreadId(activeId);
            activeThreadIdRef.current = activeId;
            lsSet(LS_THREADS_KEY, threadsToUse);
            lsSet(LS_ACTIVE_THREAD_KEY, activeId);

            if (activeId) {
                const normalizedEntries = normalizeLocalEntries(localEntries, activeId);
                setEntries(normalizedEntries.filter((entry) => entry.threadId === activeId));
                setLocalEntries(normalizedEntries);
            } else {
                setEntries([]);
            }
            setChecklist(lsGet(LS_CHECKLIST_KEY, {}));
            setCustomItems(lsGet(LS_CUSTOM_ITEMS_KEY, []));
            setShoppingOverrides(lsGet(LS_SHOPPING_OVERRIDES_KEY, []));
            setSymptoms(lsGet(LS_SYMPTOMS_KEY, []));
            setCheckIn(lsGet(LS_CHECKIN_KEY, null));
            setTaskReminders(getLocalTaskReminders(null));
            setIsLoading(false);
            return;
        }

        const load = async () => {
            setIsLoading(true);

            // Load progress
            const { data: prog } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (prog) {
                const p: UserProgress = {
                    currentDay: prog.current_day,
                    currentPhase: prog.current_phase as 1 | 2 | 3 | 4,
                    streakCount: prog.streak_count,
                    lastActiveDate: prog.last_active_date,
                    startDate: prog.start_date,
                };
                setProgress(p);
                lsSet(LS_PROGRESS_KEY, p);
            } else {
                // First time — create row
                await supabase.from('user_progress').insert({ user_id: userId });
                setProgress(DEFAULT_PROGRESS);
                lsSet(LS_PROGRESS_KEY, DEFAULT_PROGRESS);
            }

            const currentDay = prog?.current_day ?? DEFAULT_PROGRESS.currentDay;
            const { data: threadRows, error: threadLoadError } = await supabase
                .from('chat_threads')
                .select('*')
                .eq('user_id', userId)
                .eq('is_archived', false)
                .order('updated_at', { ascending: false });

            let loadedThreads = threadLoadError
                ? lsGet<ChatThread[]>(LS_THREADS_KEY, [])
                : (threadRows || []).map(mapChatThreadRow);

            const { data: entryThreadRows, error: entryThreadError } = await supabase
                .from('journal_entries')
                .select('thread_id, role, content')
                .eq('user_id', userId);

            if (!entryThreadError) {
                const nonEmptyThreadIds = new Set(
                    (entryThreadRows || [])
                        .filter((row) => row.role === 'user' && (row.content || '').trim().length > 0)
                        .map((row) => row.thread_id)
                        .filter((threadId): threadId is string => Boolean(threadId))
                );
                loadedThreads = loadedThreads.filter((thread) => nonEmptyThreadIds.has(thread.id));
            } else {
                const localThreadIds = new Set(
                    getLocalEntries()
                        .filter((entry) => entry.role === 'user' && entry.content.trim().length > 0)
                        .map((entry) => entry.threadId)
                        .filter((threadId): threadId is string => Boolean(threadId))
                );
                loadedThreads = loadedThreads.filter((thread) => localThreadIds.has(thread.id));
            }

            const savedActiveThreadId = lsGet<string | null>(LS_ACTIVE_THREAD_KEY, null);
            const initialThreadId = savedActiveThreadId && loadedThreads.some((thread) => thread.id === savedActiveThreadId)
                ? savedActiveThreadId
                : loadedThreads[0]?.id ?? null;

            setThreads(loadedThreads);
            setActiveThreadId(initialThreadId);
            activeThreadIdRef.current = initialThreadId;
            lsSet(LS_THREADS_KEY, loadedThreads);
            lsSet(LS_ACTIVE_THREAD_KEY, initialThreadId);

            await loadEntriesForThread(initialThreadId);

            // Load checklist for current day
            const { data: checks } = await supabase
                .from('daily_checklists')
                .select('*')
                .eq('user_id', userId)
                .eq('day_number', currentDay);

            const checkState: ChecklistState = {};
            (checks || []).forEach(c => { checkState[c.item_key] = c.completed; });
            setChecklist(checkState);
            lsSet(LS_CHECKLIST_KEY, checkState);

            const { data: shoppingRows } = await supabase
                .from('shopping_list_items')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            const loadedShoppingOverrides = (shoppingRows || []).map(mapShoppingOverrideRow);
            setShoppingOverrides(loadedShoppingOverrides);
            lsSet(LS_SHOPPING_OVERRIDES_KEY, loadedShoppingOverrides);

            // Load symptoms for current day
            const { data: sym } = await supabase
                .from('daily_symptoms')
                .select('symptom_keys')
                .eq('user_id', userId)
                .eq('day_number', currentDay)
                .single();
            const loadedSymptoms = sym?.symptom_keys || [];
            setSymptoms(loadedSymptoms);
            lsSet(LS_SYMPTOMS_KEY, loadedSymptoms);

            // Load check-in for current day
            const { data: checkInOut } = await supabase
                .from('daily_checkins')
                .select('*')
                .eq('user_id', userId)
                .eq('day_number', currentDay)
                .single();
            if (checkInOut) {
                const loadedCheckIn = mapDailyCheckInRow(checkInOut);
                setCheckIn(loadedCheckIn);
                lsSet(LS_CHECKIN_KEY, loadedCheckIn);
            } else {
                setCheckIn(null);
                lsSet(LS_CHECKIN_KEY, null);
            }

            const { data: reminderRows, error: reminderError } = await supabase
                .from('task_reminders')
                .select('*')
                .eq('user_id', userId)
                .order('scheduled_at_utc', { ascending: true });

            const loadedTaskReminders = !reminderError && reminderRows
                ? reminderRows.map((row) => mapTaskReminderRow(row as Record<string, unknown>))
                : getLocalTaskReminders(userId);

            setTaskReminders(loadedTaskReminders);
            setLocalTaskReminders(userId, loadedTaskReminders);

            setIsLoading(false);
        };

        load();
    }, [loadEntriesForThread, userId]);

    const loadDayState = useCallback(async (targetDay: number, shoppingItems?: ChecklistState) => {
        const persistentShopping = shoppingItems ?? Object.fromEntries(
            Object.entries(checklist).filter(([key, value]) => key.startsWith('shop_') && value)
        );

        if (userId) {
            const { data: checks } = await supabase
                .from('daily_checklists')
                .select('*')
                .eq('user_id', userId)
                .eq('day_number', targetDay);

            const dayChecklist: ChecklistState = {};
            (checks || []).forEach(c => { dayChecklist[c.item_key] = c.completed; });
            const mergedChecklist = { ...dayChecklist, ...persistentShopping };
            setChecklist(mergedChecklist);
            lsSet(LS_CHECKLIST_KEY, mergedChecklist);

            // Load symptoms
            const { data: sym } = await supabase
                .from('daily_symptoms')
                .select('symptom_keys')
                .eq('user_id', userId)
                .eq('day_number', targetDay)
                .single();
            const loadedSymptoms = sym?.symptom_keys || [];
            setSymptoms(loadedSymptoms);
            lsSet(LS_SYMPTOMS_KEY, loadedSymptoms);

            // Load check-in
            const { data: checkInOut } = await supabase
                .from('daily_checkins')
                .select('*')
                .eq('user_id', userId)
                .eq('day_number', targetDay)
                .single();
            if (checkInOut) {
                const loadedCheckIn = mapDailyCheckInRow(checkInOut);
                setCheckIn(loadedCheckIn);
                lsSet(LS_CHECKIN_KEY, loadedCheckIn);
            } else {
                setCheckIn(null);
                lsSet(LS_CHECKIN_KEY, null);
            }

            return;
        }

        const savedChecklist = lsGet<ChecklistState>(LS_CHECKLIST_KEY, {});
        const mergedChecklist = { ...savedChecklist, ...persistentShopping };
        setChecklist(mergedChecklist);
        lsSet(LS_CHECKLIST_KEY, mergedChecklist);

        const savedSymptoms = lsGet<string[]>(LS_SYMPTOMS_KEY, []);
        setSymptoms(savedSymptoms);

        const savedCheckIn = lsGet<DailyCheckIn | null>(LS_CHECKIN_KEY, null);
        setCheckIn(savedCheckIn);
    }, [checklist, userId]);

    const touchLastActiveDate = useCallback(async (value?: string) => {
        const nextDate = value ?? formatDateOnly(new Date());

        setProgress((prev) => {
            const next = { ...prev, lastActiveDate: nextDate };
            lsSet(LS_PROGRESS_KEY, next);
            return next;
        });

        if (userId) {
            await supabase
                .from('user_progress')
                .update({ last_active_date: nextDate })
                .eq('user_id', userId);
        }
    }, [userId]);

    // ── Progress Updates ───────────────────────────────

    const updateProgress = useCallback(async (updates: Partial<UserProgress>) => {
        const touchedDate = updates.lastActiveDate ?? formatDateOnly(new Date());
        const newProgress = {
            ...progress,
            ...updates,
            lastActiveDate: touchedDate,
        };

        // Auto-calculate phase from day
        if (updates.currentDay !== undefined) {
            newProgress.currentPhase = calculatePhase(updates.currentDay);
        }

        setProgress(newProgress);
        lsSet(LS_PROGRESS_KEY, newProgress);

        if (userId) {
            await supabase.from('user_progress').update({
                current_day: newProgress.currentDay,
                current_phase: newProgress.currentPhase,
                streak_count: newProgress.streakCount,
                last_active_date: newProgress.lastActiveDate,
            }).eq('user_id', userId);
        }
    }, [progress, userId]);

    // ── Chat Threads ───────────────────────────────────

    const createThread = useCallback(async () => {
        if (userId) {
            const { data } = await supabase
                .from('chat_threads')
                .insert({
                    user_id: userId,
                    title: 'New chat',
                })
                .select('*')
                .single();

            if (data) {
                const thread = mapChatThreadRow(data);
                setThreads((prev) => {
                    const next = [thread, ...prev];
                    lsSet(LS_THREADS_KEY, next);
                    return next;
                });
                setActiveThreadId(thread.id);
                activeThreadIdRef.current = thread.id;
                lsSet(LS_ACTIVE_THREAD_KEY, thread.id);
                setEntries([]);
                return thread;
            }
        }

        const localThread = createLocalThread('New chat');
        setThreads((prev) => {
            const next = [localThread, ...prev];
            lsSet(LS_THREADS_KEY, next);
            return next;
        });
        setActiveThreadId(localThread.id);
        activeThreadIdRef.current = localThread.id;
        lsSet(LS_ACTIVE_THREAD_KEY, localThread.id);
        setEntries([]);
        return localThread;
    }, [userId]);

    const startNewChat = useCallback(() => {
        setActiveThreadId(null);
        activeThreadIdRef.current = null;
        lsSet(LS_ACTIVE_THREAD_KEY, null);
        setEntries([]);
    }, []);

    const selectChatThread = useCallback(async (threadId: string) => {
        setActiveThreadId(threadId);
        activeThreadIdRef.current = threadId;
        lsSet(LS_ACTIVE_THREAD_KEY, threadId);
        await loadEntriesForThread(threadId);
    }, [loadEntriesForThread]);

    const renameChatThread = useCallback(async (threadId: string, title: string) => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            return;
        }

        setThreads((prev) => {
            const next = prev.map((thread) =>
                thread.id === threadId
                    ? { ...thread, title: trimmedTitle, updatedAt: new Date().toISOString() }
                    : thread,
            );
            lsSet(LS_THREADS_KEY, next);
            return next;
        });

        if (userId) {
            await supabase
                .from('chat_threads')
                .update({ title: trimmedTitle })
                .eq('id', threadId)
                .eq('user_id', userId);
        }
    }, [userId]);

    // ── Progress Updates ───────────────────────────────

    const setCurrentDay = useCallback(async (targetDay: number) => {
        const newDay = Math.min(Math.max(targetDay, 0), 21);
        if (newDay === progress.currentDay) return;

        const shoppingItems = Object.fromEntries(
            Object.entries(checklist).filter(([key, value]) => key.startsWith('shop_') && value)
        );

        await updateProgress({ currentDay: newDay });
        await loadDayState(newDay, shoppingItems);
        startNewChat();
    }, [checklist, loadDayState, progress.currentDay, startNewChat, updateProgress]);

    const advanceDay = useCallback(async () => {
        const newDay = Math.min(progress.currentDay + 1, 21);
        const today = new Date().toISOString().split('T')[0];
        const lastActive = progress.lastActiveDate;

        // Streak logic
        let newStreak = progress.streakCount;
        if (lastActive) {
            const lastDate = new Date(lastActive);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                newStreak++;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        await updateProgress({
            currentDay: newDay,
            streakCount: newStreak,
            lastActiveDate: today,
        });

        const shoppingItems = Object.fromEntries(
            Object.entries(checklist).filter(([key, value]) => key.startsWith('shop_') && value)
        );
        await loadDayState(newDay, shoppingItems);
        startNewChat();
    }, [checklist, loadDayState, progress, startNewChat, updateProgress]);

    // ── Journal Entries ────────────────────────────────

    const addJournalEntry = useCallback(async (role: 'user' | 'assistant', content: string): Promise<JournalEntry> => {
        let threadId = activeThreadIdRef.current;

        if (!threadId) {
            const thread = await createThread();
            threadId = thread.id;
        }

        const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const entry: JournalEntry = {
            id: tempId,
            threadId,
            dayNumber: progress.currentDay,
            role,
            content,
            createdAt: new Date().toISOString(),
        };

        setEntries(prev => {
            const next = [...prev, entry];
            mergeThreadEntriesIntoLocalCache(threadId, next);
            return next;
        });

        let returnEntry: JournalEntry = entry;
        if (userId) {
            const { data } = await supabase.from('journal_entries').insert({
                user_id: userId,
                thread_id: threadId,
                day_number: progress.currentDay,
                role,
                content,
            }).select('id, created_at').single();

            if (data) {
                const persistedEntry: JournalEntry = {
                    ...entry,
                    id: data.id,
                    createdAt: data.created_at ?? entry.createdAt,
                };

                setEntries(prev => {
                    const next = prev.map((currentEntry) =>
                        currentEntry.id === tempId ? persistedEntry : currentEntry,
                    );
                    mergeThreadEntriesIntoLocalCache(threadId, next);
                    return next;
                });
                returnEntry = persistedEntry;
            }
        }

        const touchTime = new Date().toISOString();
        setThreads((prev) => {
            const updated = prev.map((thread) =>
                thread.id === threadId ? { ...thread, updatedAt: touchTime } : thread,
            );
            const reordered = [...updated].sort((a, b) => (
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ));
            lsSet(LS_THREADS_KEY, reordered);
            return reordered;
        });

        if (userId) {
            await supabase
                .from('chat_threads')
                .update({ updated_at: touchTime })
                .eq('id', threadId)
                .eq('user_id', userId);
        }

        if (role === 'user') {
            const autoTitle = content.trim().slice(0, 60) || 'New chat';
            let shouldPersistRename = false;
            setThreads((prev) => {
                const next = prev.map((thread) => {
                    if (thread.id === threadId && thread.title === 'New chat') {
                        shouldPersistRename = true;
                        return { ...thread, title: autoTitle };
                    }
                    return thread;
                });

                if (shouldPersistRename) {
                    lsSet(LS_THREADS_KEY, next);
                    return next;
                }

                return prev;
            });

            if (userId && shouldPersistRename) {
                await supabase
                    .from('chat_threads')
                    .update({ title: autoTitle })
                    .eq('id', threadId)
                    .eq('user_id', userId);
            }

            await touchLastActiveDate();
        }

        return returnEntry;
    }, [createThread, progress.currentDay, touchLastActiveDate, userId]);

    const updateJournalEntry = useCallback((entryId: string, content: string) => {
        setEntries(prev => {
            const updated = prev.map((entry) =>
                entry.id === entryId ? { ...entry, content } : entry,
            );
            const updatedEntry = updated.find((entry) => entry.id === entryId);
            const threadIdForUpdate = updatedEntry?.threadId ?? activeThreadIdRef.current ?? updated[0]?.threadId ?? null;

            if (threadIdForUpdate) {
                mergeThreadEntriesIntoLocalCache(threadIdForUpdate, updated);
            }
            return updated;
        });
    }, []);

    const finalizeJournalEntry = useCallback(async (entryId: string, content: string) => {
        let persistedId: string | null = null;

        setEntries(prev => {
            const updated = prev.map((entry) => {
                if (entry.id !== entryId) {
                    return entry;
                }

                if (!entry.id.startsWith('temp_')) {
                    persistedId = entry.id;
                }

                return { ...entry, content };
            });

            const updatedEntry = updated.find((entry) => entry.id === entryId);
            const threadIdForUpdate = updatedEntry?.threadId ?? activeThreadIdRef.current ?? updated[0]?.threadId ?? null;

            if (threadIdForUpdate) {
                mergeThreadEntriesIntoLocalCache(threadIdForUpdate, updated);
            }
            return updated;
        });

        if (userId && persistedId) {
            await supabase
                .from('journal_entries')
                .update({ content })
                .eq('id', persistedId);
        }
    }, [userId]);

    const clearEntries = useCallback(async () => {
        if (!activeThreadId) {
            setEntries([]);
            return;
        }

        setEntries([]);
        const remaining = normalizeLocalEntries(getLocalEntries(), activeThreadId)
            .filter((entry) => entry.threadId !== activeThreadId);
        setLocalEntries(remaining);
        if (userId) {
            await supabase.from('journal_entries').delete()
                .eq('user_id', userId)
                .eq('thread_id', activeThreadId);
        }
    }, [activeThreadId, userId]);

    // ── Checklist ──────────────────────────────────────

    const toggleChecklistItem = useCallback(async (itemKey: string) => {
        const newValue = !checklist[itemKey];
        const newChecklist = { ...checklist, [itemKey]: newValue };
        setChecklist(newChecklist);
        lsSet(LS_CHECKLIST_KEY, newChecklist);

        if (newValue) {
            setTaskReminders((prev) => {
                const next = prev.filter((reminder) => reminder.checklistKey !== itemKey);
                setLocalTaskReminders(userId, next);
                return next;
            });
        }

        if (userId) {
            await supabase.from('daily_checklists').upsert({
                user_id: userId,
                day_number: progress.currentDay,
                item_key: itemKey,
                completed: newValue,
                completed_at: newValue ? new Date().toISOString() : null,
            }, { onConflict: 'user_id,day_number,item_key' });
        }
        await touchLastActiveDate();
    }, [checklist, progress.currentDay, touchLastActiveDate, userId]);

    const getChecklistCompletion = useCallback((totalItems: number): number => {
        const completed = Object.values(checklist).filter(Boolean).length;
        return totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
    }, [checklist]);

    // ── Custom Checklist Items ─────────────────────────

    const addCustomItem = useCallback((label: string, source: 'ai' | 'manual' = 'manual') => {
        // Deduplicate by checking if label already exists
        const exists = customItems.some(
            ci => ci.label.toLowerCase().trim() === label.toLowerCase().trim()
        );
        if (exists) return;

        const item: CustomChecklistItem = {
            key: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            label: label.trim(),
            source,
            createdAt: new Date().toISOString(),
        };
        const updated = [...customItems, item];
        setCustomItems(updated);
        lsSet(LS_CUSTOM_ITEMS_KEY, updated);
    }, [customItems]);

    const removeCustomItem = useCallback((key: string) => {
        const updated = customItems.filter(ci => ci.key !== key);
        setCustomItems(updated);
        lsSet(LS_CUSTOM_ITEMS_KEY, updated);
        // Also remove from checklist state
        const newChecklist = { ...checklist };
        delete newChecklist[key];
        setChecklist(newChecklist);
        lsSet(LS_CHECKLIST_KEY, newChecklist);
    }, [customItems, checklist]);

    const upsertShoppingOverrideLocally = useCallback((nextItem: ShoppingListOverride) => {
        setShoppingOverrides((prev) => {
            const existingIndex = prev.findIndex((item) => item.key === nextItem.key);
            const next = existingIndex === -1
                ? [...prev, nextItem]
                : prev.map((item) => (item.key === nextItem.key ? nextItem : item));
            lsSet(LS_SHOPPING_OVERRIDES_KEY, next);
            return next;
        });
    }, []);

    const addShoppingItem = useCallback(async ({
        phase,
        category,
        name,
        quantity,
        notes,
        optional,
        source = 'manual',
    }: ShoppingListItemInput) => {
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return null;
        }

        const normalizedPhase = normalizeShoppingMatch(phase);
        const normalizedCategory = normalizeShoppingMatch(category);
        const normalizedName = normalizeShoppingMatch(trimmedName);

        const existing = shoppingOverrides.find((item) =>
            normalizeShoppingMatch(item.phase) === normalizedPhase
            && normalizeShoppingMatch(item.category) === normalizedCategory
            && normalizeShoppingMatch(item.name) === normalizedName,
        );
        const defaultMatch = findDefaultShoppingItem({ phase, category, name: trimmedName });

        if (defaultMatch && !existing?.isHidden) {
            return {
                key: defaultMatch.key,
                phase: defaultMatch.phase,
                category: defaultMatch.category,
                name: defaultMatch.item.name,
            };
        }

        const key = existing?.key ?? defaultMatch?.key ?? `shop_custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const nextItem: ShoppingListOverride = {
            id: existing?.id ?? key,
            key,
            phase: defaultMatch?.phase ?? phase.trim(),
            category: defaultMatch?.category ?? category.trim(),
            name: defaultMatch?.item.name ?? trimmedName,
            quantity: quantity?.trim() || defaultMatch?.item.quantity || undefined,
            notes: notes?.trim() || defaultMatch?.item.notes || undefined,
            optional: optional?.trim() || defaultMatch?.item.optional || undefined,
            source: defaultMatch ? 'protocol' : source,
            isHidden: false,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
        };

        upsertShoppingOverrideLocally(nextItem);

        if (userId) {
            const payload: ShoppingListItemRow['Insert'] = {
                user_id: userId,
                item_key: nextItem.key,
                phase_name: nextItem.phase,
                category_name: nextItem.category,
                item_name: nextItem.name,
                quantity: nextItem.quantity ?? null,
                notes: nextItem.notes ?? null,
                optional: nextItem.optional ?? null,
                source: nextItem.source,
                is_hidden: false,
            };

            const { data } = await supabase
                .from('shopping_list_items')
                .upsert(payload, { onConflict: 'user_id,item_key' })
                .select('*')
                .single();

            if (data) {
                upsertShoppingOverrideLocally(mapShoppingOverrideRow(data));
            }
        }

        return nextItem;
    }, [shoppingOverrides, upsertShoppingOverrideLocally, userId]);

    const removeShoppingItem = useCallback(async (item: {
        key?: string;
        phase?: string;
        category: string;
        name: string;
        quantity?: string;
        notes?: string;
        optional?: string;
        source?: ShoppingListItemSource;
    }) => {
        const existing = item.key
            ? shoppingOverrides.find((entry) => entry.key === item.key)
            : shoppingOverrides.find((entry) =>
                normalizeShoppingMatch(entry.category) === normalizeShoppingMatch(item.category)
                && normalizeShoppingMatch(entry.name) === normalizeShoppingMatch(item.name)
                && (!item.phase || normalizeShoppingMatch(entry.phase) === normalizeShoppingMatch(item.phase)),
            );

        const defaultMatch = findDefaultShoppingItem({
            phase: item.phase,
            category: item.category,
            name: item.name,
        });

        const nextItem: ShoppingListOverride | null = existing
            ? { ...existing, isHidden: true }
            : defaultMatch
                ? {
                    id: defaultMatch.key,
                    key: defaultMatch.key,
                    phase: defaultMatch.phase,
                    category: defaultMatch.category,
                    name: defaultMatch.item.name,
                    quantity: defaultMatch.item.quantity,
                    notes: defaultMatch.item.notes,
                    optional: defaultMatch.item.optional,
                    source: 'protocol',
                    isHidden: true,
                    createdAt: new Date().toISOString(),
                }
                : item.phase
                    ? {
                        id: item.key ?? `shop_hidden_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        key: item.key ?? buildShopKey(item.phase, item.category, 0),
                        phase: item.phase,
                        category: item.category,
                        name: item.name,
                        quantity: item.quantity,
                        notes: item.notes,
                        optional: item.optional,
                        source: item.source ?? 'manual',
                        isHidden: true,
                        createdAt: new Date().toISOString(),
                    }
                    : null;

        if (!nextItem) {
            return null;
        }

        upsertShoppingOverrideLocally(nextItem);

        if (userId) {
            const payload: ShoppingListItemRow['Insert'] = {
                user_id: userId,
                item_key: nextItem.key,
                phase_name: nextItem.phase,
                category_name: nextItem.category,
                item_name: nextItem.name,
                quantity: nextItem.quantity ?? null,
                notes: nextItem.notes ?? null,
                optional: nextItem.optional ?? null,
                source: nextItem.source,
                is_hidden: true,
            };

            const { data } = await supabase
                .from('shopping_list_items')
                .upsert(payload, { onConflict: 'user_id,item_key' })
                .select('*')
                .single();

            if (data) {
                upsertShoppingOverrideLocally(mapShoppingOverrideRow(data));
            }
        }

        return nextItem;
    }, [shoppingOverrides, upsertShoppingOverrideLocally, userId]);

    // ── Task Reminders ─────────────────────────────────

    const setTaskReminder = useCallback(async (input: {
        checklistKey: string;
        label: string;
        scheduledLocalTime: string;
        dayNumber?: number;
        deliveryChannel?: ReminderDeliveryChannel;
        deepLinkTarget?: string;
    }) => {
        const schedule = buildReminderSchedulePayload(input.scheduledLocalTime);
        if (!schedule) {
            throw new Error('Invalid reminder time.');
        }

        const reminderDayNumber = input.dayNumber ?? progress.currentDay;
        const nextReminder: TaskReminder = {
            id: `reminder_${input.checklistKey}_${Date.now()}`,
            userId,
            dayNumber: reminderDayNumber,
            checklistKey: input.checklistKey,
            label: input.label.trim(),
            scheduledLocalTime: schedule.scheduledLocalTime,
            scheduledAtUtc: schedule.scheduledAtUtc,
            timezone: schedule.timezone,
            deliveryChannel: input.deliveryChannel ?? 'local',
            smsEnabled: (input.deliveryChannel ?? 'local') === 'sms',
            deepLinkTarget: input.deepLinkTarget ?? buildProtocolDeepLink({
                view: 'today',
                dayNumber: reminderDayNumber,
                checklistKey: input.checklistKey,
            }),
            active: true,
            createdAt: new Date().toISOString(),
            deliveredAt: null,
            lastSentAt: null,
        };

        setTaskReminders((prev) => {
            const next = [
                ...prev.filter((reminder) => !(reminder.checklistKey === input.checklistKey && reminder.dayNumber === reminderDayNumber)),
                nextReminder,
            ];
            setLocalTaskReminders(userId, next);
            return next;
        });

        if (userId) {
            const payload = {
                user_id: userId,
                day_number: reminderDayNumber,
                checklist_key: input.checklistKey,
                label: nextReminder.label,
                scheduled_local_time: nextReminder.scheduledLocalTime,
                scheduled_at_utc: nextReminder.scheduledAtUtc,
                timezone: nextReminder.timezone,
                deep_link_target: nextReminder.deepLinkTarget,
                delivery_channel: nextReminder.deliveryChannel,
                sms_enabled: nextReminder.smsEnabled,
                active: true,
                delivered_at: null,
            };

            const { data } = await supabase
                .from('task_reminders')
                .upsert(payload, { onConflict: 'user_id,day_number,checklist_key' })
                .select('*')
                .single();

            if (data) {
                const persistedReminder = mapTaskReminderRow(data as Record<string, unknown>);
                setTaskReminders((prev) => {
                    const next = [
                        ...prev.filter((reminder) => !(reminder.checklistKey === persistedReminder.checklistKey && reminder.dayNumber === persistedReminder.dayNumber)),
                        persistedReminder,
                    ];
                    setLocalTaskReminders(userId, next);
                    return next;
                });
            }
        }

        await touchLastActiveDate();
        return nextReminder;
    }, [progress.currentDay, touchLastActiveDate, userId]);

    const clearTaskReminder = useCallback(async (checklistKey: string, dayNumber?: number) => {
        setTaskReminders((prev) => {
            const next = prev.filter((reminder) => (
                reminder.checklistKey !== checklistKey
                || (typeof dayNumber === 'number' && reminder.dayNumber !== dayNumber)
            ));
            setLocalTaskReminders(userId, next);
            return next;
        });

        if (userId) {
            let query = supabase
                .from('task_reminders')
                .delete()
                .eq('user_id', userId)
                .eq('checklist_key', checklistKey);

            if (typeof dayNumber === 'number') {
                query = query.eq('day_number', dayNumber);
            }

            await query;
        }
    }, [userId]);

    const markTaskReminderDelivered = useCallback(async (reminderId: string) => {
        const deliveredAt = new Date().toISOString();

        setTaskReminders((prev) => {
            const next = prev.map((reminder) => (
                reminder.id === reminderId
                    ? { ...reminder, active: false, deliveredAt, lastSentAt: deliveredAt }
                    : reminder
            ));
            setLocalTaskReminders(userId, next);
            return next;
        });

        if (userId) {
            await supabase
                .from('task_reminders')
                .update({
                    active: false,
                    delivered_at: deliveredAt,
                    last_sent_at: deliveredAt,
                })
                .eq('id', reminderId)
                .eq('user_id', userId);
        }
    }, [userId]);

    const recoveryState = useMemo<RecoveryState | null>(() => {
        const lastActive = parseProgressDate(progress.lastActiveDate);
        if (!lastActive || progress.currentDay < 0) {
            return null;
        }

        const today = parseProgressDate(formatDateOnly(new Date()));
        if (!today) {
            return null;
        }

        const daysOff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOff <= 0) {
            return null;
        }

        const recoveryMessage = progress.currentDay === 0
            ? 'Prep does not need perfection. Re-open the shopping and setup basics first, then start Day 1 when that foundation feels handled.'
            : daysOff === 1
                ? 'Do not make up yesterday. Repeat this day, restart with the next unchecked step, and keep the rest of the day simple.'
                : 'Do not double up supplements or try to sprint. Repeat this day, hydrate, hit the basics first, and ask Coach only if you need to adjust.';

        return {
            lastActiveDate: progress.lastActiveDate,
            daysOff,
            recommendedResumeDay: progress.currentDay,
            recoveryMessage,
            shouldShow: true,
        };
    }, [progress.currentDay, progress.lastActiveDate]);

    const maintenanceHandoff = useMemo<MaintenanceHandoff | null>(() => {
        if (progress.currentDay < 21) {
            return null;
        }

        return {
            completionDate: progress.lastActiveDate ?? formatDateOnly(new Date()),
            coreHabitsToKeep: [
                'Keep breakfast and hydration boring and consistent.',
                'Keep sugar and ultra-processed food from creeping back in daily.',
                'Keep one simple check-in habit so you catch drift early.',
            ],
            watchFors: [
                'Old bloating, cravings, brain fog, or constipation patterns returning for several days in a row.',
                'Trying to replace structure with random new supplements.',
                'Treating the protocol finish like a green light to swing wildly off-plan.',
            ],
            nextPhasePrompt: 'Ask Coach to turn what worked into a simple 7-day maintenance rhythm.',
        };
    }, [progress.currentDay, progress.lastActiveDate]);

    // ── Symptoms & Check-Ins ───────────────────────────

    const toggleSymptom = useCallback(async (key: string) => {
        const newSymptoms = symptoms.includes(key)
            ? symptoms.filter(s => s !== key)
            : [...symptoms, key];

        setSymptoms(newSymptoms);
        lsSet(LS_SYMPTOMS_KEY, newSymptoms);

        if (userId) {
            const payload: DailySymptomsRow['Insert'] = {
                user_id: userId,
                day_number: progress.currentDay,
                symptom_keys: newSymptoms,
            };

            await supabase
                .from('daily_symptoms')
                .upsert(payload, { onConflict: 'user_id,day_number' });
        }
        await touchLastActiveDate();
    }, [symptoms, progress.currentDay, touchLastActiveDate, userId]);

    const saveCheckIn = useCallback(async (data: Partial<DailyCheckIn>) => {
        const newCheckIn: DailyCheckIn = {
            id: checkIn?.id ?? `checkin_${progress.currentDay}`,
            dayNumber: progress.currentDay,
            energy: data.energy ?? checkIn?.energy,
            adherence: data.adherence ?? checkIn?.adherence,
            mood: data.mood ?? checkIn?.mood,
            note: data.note ?? checkIn?.note,
            createdAt: checkIn?.createdAt ?? new Date().toISOString(),
        };
        setCheckIn(newCheckIn);
        lsSet(LS_CHECKIN_KEY, newCheckIn);

        if (userId) {
            const payload: DailyCheckinRow['Insert'] = {
                user_id: userId,
                day_number: progress.currentDay,
                energy: newCheckIn.energy,
                adherence: newCheckIn.adherence,
                mood: newCheckIn.mood,
                note: newCheckIn.note,
                created_at: newCheckIn.createdAt,
            };

            await supabase
                .from('daily_checkins')
                .upsert(payload, { onConflict: 'user_id,day_number' });
        }
        await touchLastActiveDate();
    }, [checkIn, progress.currentDay, touchLastActiveDate, userId]);

    // ── Export Chat ────────────────────────────────────

    const exportChat = useCallback(() => {
        const activeThreadTitle = threads.find((thread) => thread.id === activeThreadId)?.title ?? 'chat';
        const safeTitle = activeThreadTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40) || 'chat';

        const text = entries
            .map(e => {
                const date = new Date(e.createdAt).toLocaleString();
                return `[${date}] ${e.role.toUpperCase()}: ${e.content}`;
            })
            .join('\n\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gut-brain-journal-${safeTitle}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, [activeThreadId, entries, threads]);

    return {
        // State
        isLoading,
        userId,
        progress,
        threads,
        activeThreadId,
        entries,
        checklist,
        customItems,
        shoppingOverrides,
        symptoms,
        checkIn,
        taskReminders,
        recoveryState,
        maintenanceHandoff,

        // Progress
        updateProgress,
        setCurrentDay,
        advanceDay,

        // Journal
        startNewChat,
        selectChatThread,
        renameChatThread,
        addJournalEntry,
        updateJournalEntry,
        finalizeJournalEntry,
        clearEntries,
        exportChat,

        // Checklist
        toggleChecklistItem,
        getChecklistCompletion,
        addCustomItem,
        removeCustomItem,
        addShoppingItem,
        removeShoppingItem,
        setTaskReminder,
        clearTaskReminder,
        markTaskReminderDelivered,

        // Daily Checks
        toggleSymptom,
        saveCheckIn,
    };
}
