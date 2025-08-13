import { test as base } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './utils/env';

export const test = base.extend<{ supabaseAdmin: SupabaseClient }>({
  supabaseAdmin: async ({}, use) => {
    const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    await use(client);
  },
});

export { expect } from '@playwright/test';
