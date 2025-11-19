import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://evysvdydqxlnhephxviy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eXN2ZHlkcXhsbmhlcGh4dml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTY1MTAsImV4cCI6MjA3OTA5MjUxMH0.aodI66e2iwETT7__LzhwmHuhyBzVzA4sGJIcaYsZp8g';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});