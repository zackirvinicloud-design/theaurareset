import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_POST_AUTH_DESTINATION = '/payment-required' as const;
const POST_AUTH_CACHE_PREFIX = 'gbj-post-auth-destination:';
const POST_AUTH_LOOKUP_TIMEOUT_MS = 3500;
const AUTH_REQUEST_TIMEOUT_MS = 10000;

type PostAuthDestination = '/protocol' | '/payment-required';

export const isEmailVerified = (user: User | null | undefined) => {
  return Boolean(user?.email_confirmed_at);
};

const isPostAuthDestination = (value: string | null): value is PostAuthDestination => {
  return value === '/protocol' || value === '/payment-required';
};

const getDestinationCacheKey = (userId: string) => `${POST_AUTH_CACHE_PREFIX}${userId}`;

const readCachedPostAuthDestination = (userId: string): PostAuthDestination | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = window.localStorage.getItem(getDestinationCacheKey(userId));
    return isPostAuthDestination(cached) ? cached : null;
  } catch {
    return null;
  }
};

export const rememberPostAuthDestination = (userId: string, destination: PostAuthDestination) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(getDestinationCacheKey(userId), destination);
  } catch {
    // Ignore storage failures and keep the routing fallback non-blocking.
  }
};

export const getDefaultPostAuthDestination = async (userId: string): Promise<PostAuthDestination> => {
  const fallbackDestination = readCachedPostAuthDestination(userId) ?? DEFAULT_POST_AUTH_DESTINATION;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), POST_AUTH_LOOKUP_TIMEOUT_MS);

  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('is_active')
      .eq('user_id', userId)
      .maybeSingle()
      .abortSignal(controller.signal);

    if (error) {
      console.error('Failed to resolve post-auth destination:', error);
      return fallbackDestination;
    }

    const destination: PostAuthDestination = subscription?.is_active ? '/protocol' : DEFAULT_POST_AUTH_DESTINATION;
    rememberPostAuthDestination(userId, destination);
    return destination;
  } catch (error) {
    console.error('Post-auth destination lookup timed out or failed:', error);
    return fallbackDestination;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const withAuthTimeout = async <T>(
  operation: Promise<T>,
  timeoutMessage: string,
  timeoutMs = AUTH_REQUEST_TIMEOUT_MS,
): Promise<T> => {
  let timeoutId: number | undefined;

  try {
    return await new Promise<T>((resolve, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);

      operation.then(resolve).catch(reject);
    });
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};
