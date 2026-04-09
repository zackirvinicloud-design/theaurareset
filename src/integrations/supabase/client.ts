import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import type { Database } from './types';

const FALLBACK_SUPABASE_URL = 'https://mergwwrhcqzbogtnhxus.supabase.co';
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcmd3d3JoY3F6Ym9ndG5oeHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTc0NTgsImV4cCI6MjA3ODc3MzQ1OH0.t0f8RGXnEPaAVC63bKFcHGg9xrVt9gIsW8fMxI7uJ-I';

const trimOrNull = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isLikelyJwt = (value: string) => value.split('.').length === 3;

const isValidSupabaseUrl = (value: string) => {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:')
      && /(^|\.)supabase\.co$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
};

const envSupabaseUrl = trimOrNull(import.meta.env.VITE_SUPABASE_URL);
const envPublishableKey =
  trimOrNull(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  ?? trimOrNull(import.meta.env.VITE_SUPABASE_ANON_KEY);

const SUPABASE_URL = envSupabaseUrl && isValidSupabaseUrl(envSupabaseUrl)
  ? envSupabaseUrl
  : FALLBACK_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY = envPublishableKey && isLikelyJwt(envPublishableKey)
  ? envPublishableKey
  : FALLBACK_SUPABASE_PUBLISHABLE_KEY;

const createMemoryStorage = (): SupportedStorage => {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
  };
};

const resolveAuthStorage = (): SupportedStorage => {
  if (typeof window === 'undefined') {
    return createMemoryStorage();
  }

  try {
    const testKey = '__gbj_storage_check__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return createMemoryStorage();
  }
};

const sleep = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const isRetryableFetchError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to fetch')
    || normalized.includes('networkerror')
    || normalized.includes('fetch failed')
    || normalized.includes('load failed')
  );
};

const resolveFetch = () => {
  if (typeof globalThis.fetch !== 'function') {
    return undefined;
  }

  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      return await globalThis.fetch(input, init);
    } catch (error) {
      if (!isRetryableFetchError(error)) {
        throw error;
      }

      await sleep(350);
      return globalThis.fetch(input, init);
    }
  }) satisfies typeof fetch;
};

const supabaseFetch = resolveFetch();
const authStorage = resolveAuthStorage();

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Avoid cross-tab lock contention that can stall auth requests in local dev.
    lock: async (_name, _acquireTimeout, fn) => await fn(),
  },
  global: supabaseFetch ? { fetch: supabaseFetch } : undefined,
});
