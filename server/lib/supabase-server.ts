import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
// This should only be used in server-side code, never in the browser
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
