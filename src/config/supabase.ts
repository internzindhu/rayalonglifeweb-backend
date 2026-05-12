// Server-side Supabase client — uses the service role key for admin access to Storage and Auth.
// Never expose this client or the service role key to the browser.

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { env } from './env';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: ws as any,
  },
});
