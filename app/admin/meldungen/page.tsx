import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import MeldungenFilter from './MeldungenFilter'
import MeldungHeatmapClient from '@/components/map/MeldungHeatmapClient'
import CopyIdButton from '@/components/ui/CopyIdButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meldungsübersicht | Admin | Wildmelder',
}

const MELDUNGSART_LABELS: Record<string, { label: string; class: string }> = {
  unfallwild: { label: 'Unfallwild', class: 'bg-secondary/20 text-secondary' },
  fallwild: { label: 'Fallwild', class: 'bg-primary/20 text-primary' },
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  gemeldet: { label: 'Gemeldet', class: 'bg-secondary/20 text-secondary' },
  in_bearbeitung: { label: 'In Bearbeitung', class: 'bg-accent/20 text-accent' },
  abgeschlossen: { label: 'Abgeschlossen', class: 'bg-primary/20 text-primary' },
}

export default async function AdminMeldungenPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; tage?: string; q?: string; meldungsart?: string }>
}) {
  const { tier, tage, q, meldungsart } = await searchParams

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Build query with admin client (bypasses RLS)
  const admin = createAdminClient()
  let query = admin
    .from('wildmeldungen')
    .select('id, tier_art, tier_tot, address, latitude, longitude, status, meldungsart, created_at, revier_id, reviere(name)')
    .order('created_at', { ascending: false })

  if (tier) query = query.eq('tier_art', tier)
  if (meldungsart) query = query.eq('meldungsart', meldungsart)
  if (tage) {
    const since = new Date()
    since.setDate(since.getDate() - parseInt(tage))
    query = query.gte('created_at', since.toISOString())
  }

  const { data: allMeldungen } = await query

  // Client-side search filter (ID prefix, address, tier_art, reporter_name)
  const meldungen = q
    ? allMeldungen?.filter((m) => {
        const term = q.toLowerCase()
        return (
          m.id.toLowerCase().startsWith(term) ||
          m.tier_art?.toLowerCase().includes(term) ||
          m.address?.toLowerCase().includes(term)
        )
      })
    : allMeldungen

  const total = meldungen?.length ?? 0
  const open = meldungen?.filter((m) => m.status === 'gemeldet').length ?? 0
  const inProgress = meldungen?.filter((m) => m.status === 'in_bearbeitung').length ?? 0
  const done = meldungen?.filter((m) => m.status === 'abgeschlossen').length ?? 0

  const heatPoints = (meldungen ?? [])
    .filter((m) => m.latitude && m.longitude)
    .map((m) => ({ lat: m.latitude as number, lng: m.longitude as number }))

  // Count by animal type
  const tierCounts: Record<string, number> = {}
  for (const m of meldungen ?? []) {
    const art = m.tier_art ?? 'Unbekannt'
    tierCounts[art] = (tierCounts[art] ?? 0) + 1
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Meldungsübersicht</h1>
        <p className="text-muted-foreground mt-1">Alle Wildmeldungen im System</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense>
          <MeldungenFilter />
        </Suspense>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Gesamt', value: total, icon: AlertTriangle, color: 'text-foreground' },
          { label: 'Gemeldet', value: open, icon: Clock, color: 'text-secondary' },
          { label: 'In Bearbeitung', value: inProgress, icon: Clock, color: 'text-accent' },
          { label: 'Abgeschlossen', value: done, icon: CheckCircle, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 bg-surface-container rounded-2xl">
            <CardContent className="p-5 flex items-center gap-3">
              <Icon className={`w-6 h-6 ${color} shrink-0`} />
              <div>
                <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <div className="mb-8">
        <h2 className="font-heading font-semibold text-lg text-foreground mb-3">Heatmap</h2>
        {heatPoints.length > 0 ? (
          <MeldungHeatmapClient points={heatPoints} />
        ) : (
          <div className="h-48 rounded-2xl bg-surface-container flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Keine Standortdaten für den gewählten Filter</p>
          </div>
        )}
      </div>

      {/* Wildart distribution */}
      {Object.keys(tierCounts).length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-3">Verteilung nach Wildart</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(tierCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([art, count]) => (
                <Card key={art} className="border-0 bg-surface-container rounded-2xl">
                  <CardContent className="p-4">
                    <p className="text-xl font-heading font-bold text-foreground">{count}</p>
                    <p className="text-sm text-muted-foreground">{art}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.round((count / total) * 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Meldungen list */}
      <div>
        <h2 className="font-heading font-semibold text-lg text-foreground mb-3">
          Alle Meldungen{total > 0 ? ` (${total})` : ''}
        </h2>
        {!meldungen || meldungen.length === 0 ? (
          <Card className="border-0 bg-surface-container rounded-2xl">
            <CardContent className="p-10 text-center text-muted-foreground">
              Keine Meldungen für den gewählten Filter.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {meldungen.map((m) => {
              const statusInfo = STATUS_LABELS[m.status] ?? STATUS_LABELS.gemeldet
              const meldungsartInfo = MELDUNGSART_LABELS[(m as any).meldungsart ?? 'unfallwild']
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const reviername = (m.reviere as any)?.name as string | undefined
              return (
                <Link key={m.id} href={`/meldungen/${m.id}`} className="block group">
                <Card className="border-0 bg-card rounded-2xl group-hover:bg-surface-container transition-colors">
                  <CardContent className="p-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CopyIdButton id={m.id} />
                        <span className="font-semibold text-foreground text-sm">
                          {m.tier_art ?? '—'}
                        </span>
                        {m.tier_tot !== null && (
                          <>
                            <span className="text-muted-foreground text-xs">—</span>
                            <span className="text-xs text-muted-foreground">
                              {m.tier_tot ? 'tot' : 'verletzt'}
                            </span>
                          </>
                        )}
                        <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${meldungsartInfo.class}`}>
                          {meldungsartInfo.label}
                        </span>
                        <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {reviername && (
                        <p className="text-xs text-muted-foreground">Revier: {reviername}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {m.address || (m.latitude && m.longitude ? `${(m.latitude as number).toFixed(4)}, ${(m.longitude as number).toFixed(4)}` : 'Kein Standort')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleString('de-DE')}
                      </p>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
