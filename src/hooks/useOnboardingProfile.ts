import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DIET_PATTERN_OPTIONS = [
  'Omnivore',
  'High-protein',
  'Pescatarian',
  'Vegetarian',
  'Vegan',
  'Low-carb',
  'Gluten-free',
  'Dairy-free',
] as const;

export const ROUTINE_TYPE_OPTIONS = [
  'Early mornings',
  'Standard daytime',
  'Night shift / late schedule',
  'Unpredictable routine',
] as const;

export const SUPPORT_STYLE_OPTIONS = [
  'Direct and blunt',
  'Gentle and encouraging',
  'Data-driven',
] as const;

export interface UserOnboardingProfile {
  firstName: string | null;
  protocolGoal: string | null;
  whyNow: string | null;
  primaryBlocker: string | null;
  dietPattern: string | null;
  foodPreferences: string[];
  routineType: string | null;
  supportStyle: string | null;
  healthFlags: string[];
  entrySource: string;
  currentDaySelected: number;
  completedAt: string | null;
  updatedAt: string | null;
}

interface SaveOnboardingProfileOptions {
  markComplete?: boolean;
  entrySource?: string;
}

const DEFAULT_PROFILE: UserOnboardingProfile = {
  firstName: null,
  protocolGoal: null,
  whyNow: null,
  primaryBlocker: null,
  dietPattern: null,
  foodPreferences: [],
  routineType: null,
  supportStyle: null,
  healthFlags: [],
  entrySource: 'app',
  currentDaySelected: 0,
  completedAt: null,
  updatedAt: null,
};

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeStringList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

const mapProfileRow = (row: Record<string, unknown> | null | undefined): UserOnboardingProfile => {
  if (!row) {
    return DEFAULT_PROFILE;
  }

  return {
    firstName: normalizeText(row.first_name),
    protocolGoal: normalizeText(row.protocol_goal),
    whyNow: normalizeText(row.why_now),
    primaryBlocker: normalizeText(row.primary_blocker),
    dietPattern: normalizeText(row.diet_pattern),
    foodPreferences: normalizeStringList(row.food_preferences),
    routineType: normalizeText(row.routine_type),
    supportStyle: normalizeText(row.support_style),
    healthFlags: normalizeStringList(row.health_flags),
    entrySource: normalizeText(row.entry_source) ?? 'app',
    currentDaySelected: typeof row.current_day_selected === 'number' ? row.current_day_selected : 0,
    completedAt: normalizeText(row.completed_at),
    updatedAt: normalizeText(row.updated_at),
  };
};

export const parseProfileListInput = (value: string) => {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const formatProfileListInput = (values: string[]) => values.join(', ');

export const isOnboardingProfileComplete = (profile: UserOnboardingProfile) => {
  return Boolean(
    profile.firstName
    && profile.protocolGoal
    && profile.whyNow
    && profile.primaryBlocker
    && profile.dietPattern
    && profile.routineType
    && profile.supportStyle,
  );
};

export const useOnboardingProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<UserOnboardingProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) {
        if (!cancelled) {
          setProfile(DEFAULT_PROFILE);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('user_onboarding_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!cancelled) {
        setProfile(!error && data ? mapProfileRow(data as Record<string, unknown>) : DEFAULT_PROFILE);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveProfile = useCallback(async (
    updates: Partial<UserOnboardingProfile>,
    options?: SaveOnboardingProfileOptions,
  ) => {
    if (!userId) {
      throw new Error('You must be signed in to save your profile.');
    }

    const nextProfile: UserOnboardingProfile = {
      ...profile,
      ...updates,
      firstName: updates.firstName !== undefined ? normalizeText(updates.firstName) : profile.firstName,
      protocolGoal: updates.protocolGoal !== undefined ? normalizeText(updates.protocolGoal) : profile.protocolGoal,
      whyNow: updates.whyNow !== undefined ? normalizeText(updates.whyNow) : profile.whyNow,
      primaryBlocker: updates.primaryBlocker !== undefined ? normalizeText(updates.primaryBlocker) : profile.primaryBlocker,
      dietPattern: updates.dietPattern !== undefined ? normalizeText(updates.dietPattern) : profile.dietPattern,
      routineType: updates.routineType !== undefined ? normalizeText(updates.routineType) : profile.routineType,
      supportStyle: updates.supportStyle !== undefined ? normalizeText(updates.supportStyle) : profile.supportStyle,
      foodPreferences: updates.foodPreferences !== undefined ? updates.foodPreferences : profile.foodPreferences,
      healthFlags: updates.healthFlags !== undefined ? updates.healthFlags : profile.healthFlags,
      updatedAt: new Date().toISOString(),
      completedAt: options?.markComplete
        ? new Date().toISOString()
        : updates.completedAt !== undefined
          ? updates.completedAt
          : profile.completedAt,
      entrySource: options?.entrySource ?? updates.entrySource ?? profile.entrySource,
    };

    setIsSaving(true);

    try {
      const payload = {
        user_id: userId,
        first_name: nextProfile.firstName,
        protocol_goal: nextProfile.protocolGoal,
        why_now: nextProfile.whyNow,
        primary_blocker: nextProfile.primaryBlocker,
        diet_pattern: nextProfile.dietPattern,
        food_preferences: nextProfile.foodPreferences,
        routine_type: nextProfile.routineType,
        support_style: nextProfile.supportStyle,
        health_flags: nextProfile.healthFlags,
        entry_source: nextProfile.entrySource,
        current_day_selected: nextProfile.currentDaySelected,
        completed_at: nextProfile.completedAt,
      };

      const { data, error } = await supabase
        .from('user_onboarding_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select('*')
        .single();

      if (error || !data) {
        throw error ?? new Error('Could not save onboarding profile.');
      }

      const persistedProfile = mapProfileRow(data as Record<string, unknown>);
      setProfile(persistedProfile);
      return persistedProfile;
    } finally {
      setIsSaving(false);
    }
  }, [profile, userId]);

  const hasCompletedOnboarding = useMemo(
    () => Boolean(profile.completedAt) && isOnboardingProfileComplete(profile),
    [profile],
  );

  return {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    hasCompletedOnboarding,
  };
};
