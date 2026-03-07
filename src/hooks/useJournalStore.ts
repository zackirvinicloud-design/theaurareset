import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculatePhase } from './useProtocolData';

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
    dayNumber: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface SymptomLog {
    id: string;
    dayNumber: number;
    symptomType: string;
    severity: number;
    notes: string | null;
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
const LS_SYMPTOMS_KEY = 'gbj-symptom-logs';
const LS_CHECKLIST_KEY = 'gbj-checklist';
const LS_CUSTOM_ITEMS_KEY = 'gbj-custom-items';

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

// ── Hook ───────────────────────────────────────────────

export function useJournalStore() {
    const [userId, setUserId] = useState<string | null>(null);
    const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
    const [checklist, setChecklist] = useState<ChecklistState>({});
    const [customItems, setCustomItems] = useState<CustomChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // ── Load from Supabase (or localStorage fallback) ──

    useEffect(() => {
        if (userId === null) {
            // Load offline data
            setProgress(lsGet(LS_PROGRESS_KEY, DEFAULT_PROGRESS));
            setEntries(lsGet(LS_ENTRIES_KEY, []));
            setSymptoms(lsGet(LS_SYMPTOMS_KEY, []));
            setChecklist(lsGet(LS_CHECKLIST_KEY, {}));
            setCustomItems(lsGet(LS_CUSTOM_ITEMS_KEY, []));
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
            }

            // Load today's journal entries
            const currentDay = prog?.current_day ?? 0;
            const { data: ents } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', userId)
                .eq('day_number', currentDay)
                .order('created_at', { ascending: true });

            const mappedEntries: JournalEntry[] = (ents || []).map(e => ({
                id: e.id,
                dayNumber: e.day_number,
                role: e.role as 'user' | 'assistant',
                content: e.content,
                createdAt: e.created_at,
            }));
            setEntries(mappedEntries);
            lsSet(LS_ENTRIES_KEY, mappedEntries);

            // Load symptoms
            const { data: syms } = await supabase
                .from('symptom_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            const mappedSymptoms: SymptomLog[] = (syms || []).map(s => ({
                id: s.id,
                dayNumber: s.day_number,
                symptomType: s.symptom_type,
                severity: s.severity,
                notes: s.notes,
                createdAt: s.created_at,
            }));
            setSymptoms(mappedSymptoms);
            lsSet(LS_SYMPTOMS_KEY, mappedSymptoms);

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

            setIsLoading(false);
        };

        load();
    }, [userId]);

    // ── Progress Updates ───────────────────────────────

    const updateProgress = useCallback(async (updates: Partial<UserProgress>) => {
        const newProgress = { ...progress, ...updates };

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
                last_active_date: new Date().toISOString().split('T')[0],
            }).eq('user_id', userId);
        }
    }, [progress, userId]);

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

        // Clear checklist for new day — but KEEP shopping items (shop_* keys persist across days)
        const shoppingItems = Object.fromEntries(
            Object.entries(checklist).filter(([key]) => key.startsWith('shop_'))
        );
        setChecklist(shoppingItems);
        lsSet(LS_CHECKLIST_KEY, shoppingItems);

        // Load new day's entries
        if (userId) {
            const { data: ents } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', userId)
                .eq('day_number', newDay)
                .order('created_at', { ascending: true });

            const mapped: JournalEntry[] = (ents || []).map(e => ({
                id: e.id,
                dayNumber: e.day_number,
                role: e.role as 'user' | 'assistant',
                content: e.content,
                createdAt: e.created_at,
            }));
            setEntries(mapped);
        } else {
            setEntries([]);
        }
    }, [progress, userId, updateProgress]);

    // ── Journal Entries ────────────────────────────────

    const addJournalEntry = useCallback(async (role: 'user' | 'assistant', content: string): Promise<JournalEntry> => {
        const entry: JournalEntry = {
            id: `${Date.now()}-${Math.random()}`,
            dayNumber: progress.currentDay,
            role,
            content,
            createdAt: new Date().toISOString(),
        };

        setEntries(prev => [...prev, entry]);

        if (userId) {
            const { data } = await supabase.from('journal_entries').insert({
                user_id: userId,
                day_number: progress.currentDay,
                role,
                content,
            }).select('id').single();

            if (data) {
                entry.id = data.id;
            }
        }

        lsSet(LS_ENTRIES_KEY, [...entries, entry]);
        return entry;
    }, [progress.currentDay, userId, entries]);

    const updateLastEntry = useCallback((content: string) => {
        setEntries(prev => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content };
            lsSet(LS_ENTRIES_KEY, updated);
            return updated;
        });
    }, []);

    const finalizeLastEntry = useCallback(async (content: string) => {
        // Called when streaming finishes — save the final content to Supabase
        setEntries(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
                updated[updated.length - 1] = { ...updated[updated.length - 1], content };
            }
            lsSet(LS_ENTRIES_KEY, updated);
            return updated;
        });

        if (userId && entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            if (lastEntry && lastEntry.id && !lastEntry.id.includes('-')) {
                await supabase.from('journal_entries').update({ content }).eq('id', lastEntry.id);
            }
        }
    }, [userId, entries]);

    const clearEntries = useCallback(async () => {
        setEntries([]);
        lsSet(LS_ENTRIES_KEY, []);
        if (userId) {
            await supabase.from('journal_entries').delete()
                .eq('user_id', userId)
                .eq('day_number', progress.currentDay);
        }
    }, [userId, progress.currentDay]);

    // ── Symptom Logging ────────────────────────────────

    const logSymptom = useCallback(async (
        symptomType: string,
        severity: number,
        notes?: string
    ) => {
        const log: SymptomLog = {
            id: `${Date.now()}-${Math.random()}`,
            dayNumber: progress.currentDay,
            symptomType,
            severity,
            notes: notes || null,
            createdAt: new Date().toISOString(),
        };

        setSymptoms(prev => [...prev, log]);

        if (userId) {
            const { data } = await supabase.from('symptom_logs').insert({
                user_id: userId,
                day_number: progress.currentDay,
                symptom_type: symptomType,
                severity,
                notes: notes || null,
            }).select('id').single();

            if (data) log.id = data.id;
        }

        lsSet(LS_SYMPTOMS_KEY, [...symptoms, log]);
    }, [progress.currentDay, userId, symptoms]);

    // ── Checklist ──────────────────────────────────────

    const toggleChecklistItem = useCallback(async (itemKey: string) => {
        const newValue = !checklist[itemKey];
        const newChecklist = { ...checklist, [itemKey]: newValue };
        setChecklist(newChecklist);
        lsSet(LS_CHECKLIST_KEY, newChecklist);

        if (userId) {
            await supabase.from('daily_checklists').upsert({
                user_id: userId,
                day_number: progress.currentDay,
                item_key: itemKey,
                completed: newValue,
                completed_at: newValue ? new Date().toISOString() : null,
            }, { onConflict: 'user_id,day_number,item_key' });
        }
    }, [checklist, progress.currentDay, userId]);

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

    const extractActionsFromAI = useCallback((aiResponse: string) => {
        // Heuristic extraction: look for actionable patterns in AI text
        const lines = aiResponse.split('\n');
        const actionPatterns = [
            /(?:^|\s)[-•*]\s*(.+(?:pick up|buy|get|grab|purchase|order|stock up|find|make sure|remember to|don't forget|try|start|stop|avoid|add|take|drink|eat|prepare|schedule|book|set up|call)\s.+)/i,
            /(?:you should|i recommend|try to|make sure to|don't forget to|remember to|be sure to|go ahead and)\s+(.{10,80})/i,
            /(?:^|\s)[-•*]\s*(?:buy|pick up|get|grab|order)\s+(.{5,60})/i,
        ];

        const extracted: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.length < 8) continue;

            // Check if line is a bullet/list item with actionable content
            const bulletMatch = trimmed.match(/^[-•*\d.]+\s*(.+)/);
            const candidate = bulletMatch ? bulletMatch[1] : trimmed;

            for (const pattern of actionPatterns) {
                const match = candidate.match(pattern);
                if (match) {
                    let action = (match[1] || match[0]).trim();
                    // Clean up: remove trailing periods, limit length
                    action = action.replace(/[.!]+$/, '').trim();
                    if (action.length >= 8 && action.length <= 80) {
                        // Capitalize first letter
                        action = action.charAt(0).toUpperCase() + action.slice(1);
                        extracted.push(action);
                    }
                    break;
                }
            }
        }

        // Add unique items (max 3 per response to avoid flooding)
        const toAdd = extracted.slice(0, 3);
        for (const label of toAdd) {
            addCustomItem(label, 'ai');
        }

        return toAdd;
    }, [addCustomItem]);

    // ── Export Chat ────────────────────────────────────

    const exportChat = useCallback(() => {
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
        a.download = `gut-brain-journal-day${progress.currentDay}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, [entries, progress.currentDay]);

    return {
        // State
        isLoading,
        userId,
        progress,
        entries,
        symptoms,
        checklist,
        customItems,

        // Progress
        updateProgress,
        advanceDay,

        // Journal
        addJournalEntry,
        updateLastEntry,
        finalizeLastEntry,
        clearEntries,
        exportChat,

        // Symptoms
        logSymptom,

        // Checklist
        toggleChecklistItem,
        getChecklistCompletion,
        addCustomItem,
        removeCustomItem,
        extractActionsFromAI,
    };
}
