import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import {
  EMPTY_GUT_BRAIN_PROFILE,
  type GutBrainConversationEntry,
  type GutBrainProfile,
  type GutBrainProgressState,
  type GutBrainSignal,
  type GutBrainSnapshot,
} from '@/lib/gutbrain';

const PROFILE_STORAGE_KEY = 'gbj-gutbrain-profile';
const SNAPSHOT_STORAGE_KEY = 'gbj-gutbrain-snapshot';

const loadLocal = <T,>(key: string, fallback: T) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocal = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
};

const normalizeList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

const normalizeSignals = (value: Json | null | undefined): GutBrainSignal[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return [];
    }

    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const observation = typeof item.observation === 'string' ? item.observation.trim() : '';
    const actionStep = typeof item.actionStep === 'string' ? item.actionStep.trim() : '';
    const evidence = normalizeList(item.evidence);

    if (!title || !observation || !actionStep) {
      return [];
    }

    return [{ title, observation, evidence, actionStep }];
  });
};

const normalizeProfile = (value: Partial<GutBrainProfile> | null | undefined): GutBrainProfile => {
  if (!value) {
    return EMPTY_GUT_BRAIN_PROFILE;
  }

  return {
    assistantName: typeof value.assistantName === 'string' && value.assistantName.trim()
      ? value.assistantName.trim()
      : EMPTY_GUT_BRAIN_PROFILE.assistantName,
    preferredName: typeof value.preferredName === 'string' && value.preferredName.trim()
      ? value.preferredName.trim()
      : null,
    protocolGoal: typeof value.protocolGoal === 'string' && value.protocolGoal.trim()
      ? value.protocolGoal.trim()
      : null,
    whyNow: typeof value.whyNow === 'string' && value.whyNow.trim()
      ? value.whyNow.trim()
      : null,
    motivationStyle: typeof value.motivationStyle === 'string' && value.motivationStyle.trim()
      ? value.motivationStyle.trim()
      : null,
    barriers: normalizeList(value.barriers),
    supportPreferences: normalizeList(value.supportPreferences),
    dietPattern: typeof value.dietPattern === 'string' && value.dietPattern.trim()
      ? value.dietPattern.trim()
      : null,
    foodPreferences: normalizeList(value.foodPreferences),
    routineType: typeof value.routineType === 'string' && value.routineType.trim()
      ? value.routineType.trim()
      : null,
    primaryBlocker: typeof value.primaryBlocker === 'string' && value.primaryBlocker.trim()
      ? value.primaryBlocker.trim()
      : null,
    healthFocus: normalizeList(value.healthFocus),
    wins: normalizeList(value.wins),
    conversationSummary: typeof value.conversationSummary === 'string' && value.conversationSummary.trim()
      ? value.conversationSummary.trim()
      : null,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
  };
};

const normalizeSnapshot = (value: Partial<GutBrainSnapshot> | null | undefined): GutBrainSnapshot | null => {
  if (!value || typeof value.summary !== 'string' || !value.summary.trim()) {
    return null;
  }

  const phaseNumber = value.phaseNumber ?? 1;
  const normalizedPhase = phaseNumber >= 1 && phaseNumber <= 4 ? phaseNumber as 1 | 2 | 3 | 4 : 1;

  return {
    dayNumber: typeof value.dayNumber === 'number' ? value.dayNumber : 0,
    phaseNumber: normalizedPhase,
    summary: value.summary.trim(),
    nextStep: typeof value.nextStep === 'string' ? value.nextStep.trim() : '',
    signals: normalizeSignals((value as { signals?: Json | null }).signals),
    updatedAt: typeof value.updatedAt === 'string' && value.updatedAt
      ? value.updatedAt
      : new Date().toISOString(),
  };
};

const buildFingerprint = (entries: GutBrainConversationEntry[], progress: GutBrainProgressState) => {
  const lastEntry = entries[entries.length - 1];
  return [
    progress.currentDay,
    progress.currentPhase,
    entries.length,
    lastEntry?.createdAt ?? '',
    lastEntry?.content.slice(-120) ?? '',
  ].join('|');
};

export interface GutBrainState {
  profile: GutBrainProfile;
  snapshot: GutBrainSnapshot | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshBrain: (
    entries: GutBrainConversationEntry[],
    progress: GutBrainProgressState,
    options?: { force?: boolean; silent?: boolean; memoryProfile?: GutBrainProfile | null },
  ) => Promise<void>;
  updateProfile: (updates: Partial<GutBrainProfile>) => Promise<void>;
}

export const useGutBrainProfile = (userId: string | null): GutBrainState => {
  const [profile, setProfile] = useState<GutBrainProfile>(EMPTY_GUT_BRAIN_PROFILE);
  const [snapshot, setSnapshot] = useState<GutBrainSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      if (!userId) {
        const localProfile = normalizeProfile(loadLocal<Partial<GutBrainProfile>>(PROFILE_STORAGE_KEY, EMPTY_GUT_BRAIN_PROFILE));
        const localSnapshot = normalizeSnapshot(loadLocal<Partial<GutBrainSnapshot> | null>(SNAPSHOT_STORAGE_KEY, null));

        if (!cancelled) {
          setProfile(localProfile);
          setSnapshot(localSnapshot);
          setIsLoading(false);
        }
        return;
      }

      const [{ data: profileRow }, { data: snapshotRows }] = await Promise.all([
        supabase
          .from('user_brain_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('journey_insight_snapshots')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      if (cancelled) {
        return;
      }

      const mappedProfile = normalizeProfile(profileRow ? {
        assistantName: profileRow.assistant_name,
        preferredName: profileRow.preferred_name,
        protocolGoal: profileRow.protocol_goal,
        whyNow: profileRow.why_now,
        motivationStyle: profileRow.motivation_style,
        barriers: profileRow.barriers,
        supportPreferences: profileRow.support_preferences,
        wins: profileRow.wins,
        conversationSummary: profileRow.conversation_summary,
        updatedAt: profileRow.updated_at,
      } : loadLocal<Partial<GutBrainProfile>>(PROFILE_STORAGE_KEY, EMPTY_GUT_BRAIN_PROFILE));

      const latestSnapshotRow = snapshotRows?.[0];
      const mappedSnapshot = normalizeSnapshot(latestSnapshotRow ? {
        dayNumber: latestSnapshotRow.day_number,
        phaseNumber: latestSnapshotRow.phase_number as 1 | 2 | 3 | 4,
        summary: latestSnapshotRow.summary,
        nextStep: latestSnapshotRow.next_step ?? '',
        signals: latestSnapshotRow.signals,
        updatedAt: latestSnapshotRow.created_at,
      } : loadLocal<Partial<GutBrainSnapshot> | null>(SNAPSHOT_STORAGE_KEY, null));

      saveLocal(PROFILE_STORAGE_KEY, mappedProfile);
      if (mappedSnapshot) {
        saveLocal(SNAPSHOT_STORAGE_KEY, mappedSnapshot);
      }

      setProfile(mappedProfile);
      setSnapshot(mappedSnapshot);
      setIsLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const refreshBrain = useCallback(async (
    entries: GutBrainConversationEntry[],
    progress: GutBrainProgressState,
    options?: { force?: boolean; silent?: boolean; memoryProfile?: GutBrainProfile | null },
  ) => {
    const cleanedEntries = entries.filter((entry) => entry.content.trim());
    if (cleanedEntries.length < 2) {
      if (!options?.silent) {
        toast({
          title: 'Not enough conversation yet',
          description: 'Coach needs a little more context before it can build a useful read.',
        });
      }
      return;
    }

    const fingerprint = buildFingerprint(cleanedEntries, progress);
    if (!options?.force && lastFingerprintRef.current === fingerprint) {
      return;
    }

    const memoryProfile = options?.memoryProfile ?? profile;

    setIsRefreshing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-insights', {
        body: {
          conversation: cleanedEntries
            .slice(-10)
            .map((entry) => `${entry.role}: ${entry.content}`)
            .join('\n\n'),
          currentDay: progress.currentDay,
          currentPhase: progress.currentPhase,
          existingProfile: memoryProfile,
          latestSnapshot: snapshot,
        },
      });

      if (error) {
        throw error;
      }

      const nextProfile = normalizeProfile(data?.profile);
      const nextSnapshot = normalizeSnapshot({
        ...(data?.snapshot ?? {}),
        dayNumber: progress.currentDay,
        phaseNumber: progress.currentPhase,
        updatedAt: new Date().toISOString(),
      });

      setProfile(nextProfile);
      setSnapshot(nextSnapshot);
      saveLocal(PROFILE_STORAGE_KEY, nextProfile);
      if (nextSnapshot) {
        saveLocal(SNAPSHOT_STORAGE_KEY, nextSnapshot);
      }

      if (userId) {
        await supabase.from('user_brain_profiles').upsert({
          user_id: userId,
          assistant_name: nextProfile.assistantName,
          preferred_name: nextProfile.preferredName,
          protocol_goal: nextProfile.protocolGoal,
          why_now: nextProfile.whyNow,
          motivation_style: nextProfile.motivationStyle,
          barriers: nextProfile.barriers,
          support_preferences: nextProfile.supportPreferences,
          wins: nextProfile.wins,
          conversation_summary: nextProfile.conversationSummary,
        }, { onConflict: 'user_id' });

        if (nextSnapshot) {
          await supabase.from('journey_insight_snapshots').insert({
            user_id: userId,
            day_number: nextSnapshot.dayNumber,
            phase_number: nextSnapshot.phaseNumber,
            summary: nextSnapshot.summary,
            next_step: nextSnapshot.nextStep,
            signals: nextSnapshot.signals as unknown as Json,
          });
        }
      }

      lastFingerprintRef.current = fingerprint;

      if (!options?.silent) {
        toast({
          title: 'GutBrain updated',
          description: 'The latest memory and insight read are ready.',
        });
      }
    } catch (error) {
      console.error('Failed to refresh GutBrain profile:', error);

      if (!options?.silent) {
        toast({
          title: 'Refresh failed',
          description: 'Coach could not update its read right now.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [profile, snapshot, userId]);

  const updateProfile = useCallback(async (updates: Partial<GutBrainProfile>) => {
    const nextProfile = normalizeProfile({ ...profile, ...updates, updatedAt: new Date().toISOString() });
    setProfile(nextProfile);
    saveLocal(PROFILE_STORAGE_KEY, nextProfile);

    if (userId) {
      await supabase.from('user_brain_profiles').upsert({
        user_id: userId,
        assistant_name: nextProfile.assistantName,
        preferred_name: nextProfile.preferredName,
        protocol_goal: nextProfile.protocolGoal,
        why_now: nextProfile.whyNow,
        motivation_style: nextProfile.motivationStyle,
        barriers: nextProfile.barriers,
        support_preferences: nextProfile.supportPreferences,
        wins: nextProfile.wins,
        conversation_summary: nextProfile.conversationSummary,
      }, { onConflict: 'user_id' });
    }
  }, [profile, userId]);

  return {
    profile,
    snapshot,
    isLoading,
    isRefreshing,
    refreshBrain,
    updateProfile,
  };
};
