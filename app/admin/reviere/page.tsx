import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Map as MapIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import AdminReviereClient, { type RevierListEntry } from './AdminReviereClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Revierverwaltung | Admin | Wildunfall-Helfer',
}

function getCentroid(coordinates: number[][][]): [number, number] {
  const ring = coordinates[0]
  const lat = ring.reduce((s, [, lat]) => s + lat, 0) / ring.length
  const lng = ring.reduce((s, [lng]) => s + lng, 0) / ring.length
  return [lat, lng]
}

export default async function AdminRevierePage() {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const admin = createAdminClient()

  // Two separate queries — avoids join/RLS complications
  const [{ data: reviere }, { data: profiles }] = await Promise.all([
    admin.from('reviere').select('id, name, polygon, phone_numbers, created_at, jaeger_id').order('created_at', { ascending: false }),
    admin.from('profiles').select('id, display_name'),
  ])

  const profileMap = new Map<string, string | null>((profiles ?? []).map((p) => [p.id, p.display_name as string | null]))

  type RevierRow = { id: string; name: string; polygon: { coordinates: number[][][] }; phone_numbers: string[]; created_at: string; jaeger_id: string }
  const rows = (reviere ?? []) as unknown as RevierRow[]

  const entries: RevierListEntry[] = rows.flatMap((r) => {
    try {
      const coordinates = r.polygon.coordinates
      return [{
        id: r.id,
        name: r.name,
        jaeger_name: profileMap.get(r.jaeger_id) ?? null,
        coordinates,
        phone_numbers: r.phone_numbers ?? [],
        created_at: r.created_at,
        centroid: getCentroid(coordinates),
      }]
    } catch {
      return []
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Revierverwaltung</h1>
      <p className="text-muted-foreground mb-8">
        {entries.length} Revier{entries.length !== 1 ? 'e' : ''} eingetragen
      </p>

      {entries.length === 0 ? (
        <Card className="border-0 bg-surface-container rounded-2xl">
          <CardContent className="p-12 text-center">
            <MapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Reviere eingetragen.</p>
          </CardContent>
        </Card>
      ) : (
        <AdminReviereClient reviere={entries} />
      )}
    </div>
  )
}
