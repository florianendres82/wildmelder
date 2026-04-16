'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function updateMeldungDoku(
  meldungId: string,
  data: {
    tier_art: string | null
    tier_tot: boolean | null
    notes: string | null
    photo_urls: string[]
    reporter_name: string | null
    reporter_phone: string | null
  }
) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('wildmeldungen')
    .update(data)
    .eq('id', meldungId)
  if (error) throw error
}
