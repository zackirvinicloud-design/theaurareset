import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mergwwrhcqzbogtnhxus.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcmd3d3JoY3F6Ym9ndG5oeHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTc0NTgsImV4cCI6MjA3ODc3MzQ1OH0.t0f8RGXnEPaAVC63bKFcHGg9xrVt9gIsW8fMxI7uJ-I';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Avoid cross-tab lock contention that can stall auth requests in local dev.
    lock: async (_name, _acquireTimeout, fn) => await fn(),
  }
});
