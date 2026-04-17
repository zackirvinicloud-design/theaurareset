export const GUEST_QUIZ_REDIRECT_PATH = '/payment-required';
export const GUEST_QUIZ_START_PATH = `/setup/profile?redirect=${encodeURIComponent(GUEST_QUIZ_REDIRECT_PATH)}`;
export const PENDING_ONBOARDING_PROFILE_KEY = 'pending_onboarding_profile';

export interface PendingOnboardingProfile {
  firstName: string;
  protocolGoal: string;
  whyNow: string;
  primaryBlocker: string;
  dietPattern: string;
  foodPreferences: string[];
  routineType: string;
  supportStyle: string;
  healthFlags: string[];
  entrySource: string;
  email: string;
  gutHealthScore: number;
}

export const readPendingOnboardingProfile = (): PendingOnboardingProfile | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PENDING_ONBOARDING_PROFILE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as PendingOnboardingProfile;
  } catch {
    return null;
  }
};

export const writePendingOnboardingProfile = (profile: PendingOnboardingProfile) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PENDING_ONBOARDING_PROFILE_KEY, JSON.stringify(profile));
};

export const clearPendingOnboardingProfile = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PENDING_ONBOARDING_PROFILE_KEY);
};
