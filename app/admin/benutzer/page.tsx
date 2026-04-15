import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import BenutzerFilter from './BenutzerFilter'
import JaegerSelectionList from './JaegerSelectionList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Benutzerverwaltung | Admin | Wildmelder',
}


export default async function BenutzerPage({
  searchParams,
}: {
  searchParams: Promise<{ ohneRevier?: string }>
}) {
  const { ohneRevier } = await searchParams
  const filterOhneRevier = ohneRevier === '1'

  const admin = createAdminClient()
  const supabase = await createClient()

  const [{ data: authUsers }, { data: profiles }, { data: reviere }] = await Promise.all([
    admin.auth.admin.listUsers(),
    supabase.from('profiles').select('id, display_name, role, is_active, created_at'),
    supabase.from('reviere').select('jaeger_id'),
  ])

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])
  const jaegerMitRevier = new Set(reviere?.map((r) => r.jaeger_id) ?? [])

  let users = authUsers?.users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    created_at: u.created_at,
    ...profileMap.get(u.id),
  })) ?? []

  if (filterOhneRevier) {
    users = users.filter((u) => {
      const role = profileMap.get(u.id)?.role
      return role === 'jaeger' && !jaegerMitRevier.has(u.id)
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Benutzerverwaltung</h1>
      <p className="text-muted-foreground mb-6">{users.length} Benutzer{filterOhneRevier ? ' ohne Revier' : ' registriert'}</p>

      <BenutzerFilter active={filterOhneRevier} />

      <div className="mt-6">
        <JaegerSelectionList users={users} />
      </div>
    </div>
  )
}
