import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient(authHeader = "") {

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );
}