import { createClient } from '@supabase/supabase-js'

// Service role client — ONLY use in Server Components, Route Handlers, and Server Actions.
// Never import this in client-side code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
