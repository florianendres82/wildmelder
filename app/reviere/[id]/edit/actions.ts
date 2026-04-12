'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function searchJaeger(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  if (!query.trim()) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id, display_name, role')
    .ilike('display_name', `%${query.trim()}%`)
    .in('role', ['jaeger', 'admin'])
    .neq('id', user.id)
    .limit(5)

  return data ?? []
}

export async function transferRevier(revierId: string, targetJaegerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const admin = createAdminClient()

  // Non-admins can only transfer their own reviere
  if (!isAdmin) {
    const { data: revier } = await admin
      .from('reviere')
      .select('jaeger_id')
      .eq('id', revierId)
      .single()

    if (revier?.jaeger_id !== user.id) throw new Error('Keine Berechtigung')
  }

  const { error } = await admin
    .from('reviere')
    .update({ jaeger_id: targetJaegerId })
    .eq('id', revierId)

  if (error) throw error

  if (isAdmin) {
    redirect('/admin/reviere')
  } else {
    redirect('/reviere')
  }
}
