import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, AlertTriangle, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react'
import DashboardSearch from '@/components/forms/DashboardSearch'
import CopyIdButton from '@/components/ui/CopyIdButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard | Wildmelder',
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  gemeldet: { label: 'Gemeldet', class: 'bg-secondary/20 text-secondary' },
  in_bearbeitung: { label: 'In Bearbeitung', class: 'bg-accent/20 text-accent' },
  abgeschlossen: { label: 'Abgeschlossen', class: 'bg-primary/20 text-primary' },
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('profiles')
    .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role, is_active')
    .eq('id', user.id)
    .single()

  if (profile?.is_active === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Konto gesperrt</h1>
        <p className="text-muted-foreground">Ihr Konto wurde gesperrt. Bitte kontaktieren Sie den Administrator.</p>
      </div>
    )
  }

  const { data: reviere } = await supabase
    .from('reviere')
    .select('id, name')
    .eq('jaeger_id', user.id)

  const revierIds = reviere?.map((r) => r.id) ?? []

  const { data: allMeldungen } = await supabase
    .from('wildmeldungen')
    .select('id, tier_art, tier_tot, address, latitude, longitude, status, created_at, revier_id')
    .in('revier_id', revierIds.length > 0 ? revierIds : ['none'])
    .order('created_at', { ascending: false })
    .limit(200)

  // Apply search filter
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

  const total = allMeldungen?.length ?? 0
  const open = allMeldungen?.filter((m) => m.status === 'gemeldet').length ?? 0
  const thisMonth = allMeldungen?.filter((m) => {
    const d = new Date(m.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Hallo, {profile?.display_name ?? 'Jäger'}
          </h1>
          <p className="text-muted-foreground mt-1">Übersicht Ihrer Wildmeldungen</p>
        </div>
        <Button asChild size="sm">
          <Link href="/reviere/neu">
            <Plus className="w-4 h-4 mr-1.5" />
            Neues Revier
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Meldungen gesamt', value: total, icon: AlertTriangle, color: 'text-foreground' },
          { label: 'Offen', value: open, icon: Clock, color: 'text-secondary' },
          { label: 'Diesen Monat', value: thisMonth, icon: CheckCircle, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 bg-surface-container rounded-2xl">
            <CardContent className="p-6 flex items-center gap-4">
              <Icon className={`w-8 h-8 ${color} shrink-0`} />
              <div>
                <p className="text-3xl font-heading font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reviere quick links */}
      {reviere && reviere.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-3">Meine Reviere</h2>
          <div className="flex flex-wrap gap-2">
            {reviere.map((r) => (
              <Link
                key={r.id}
                href={`/reviere/${r.id}`}
                className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {r.name}
              </Link>
            ))}
            <Link
              href="/reviere"
              className="flex items-center gap-1.5 bg-muted text-muted-foreground rounded-full px-4 py-1.5 text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              Alle Reviere
            </Link>
          </div>
        </div>
      )}

      {/* Reports list */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          Aktuelle Meldungen{q && meldungen ? ` (${meldungen.length} Treffer)` : ''}
        </h2>
        <Suspense>
          <DashboardSearch />
        </Suspense>
      </div>

      {!meldungen || meldungen.length === 0 ? (
        <Card className="border-0 bg-surface-container rounded-2xl">
          <CardContent className="p-10 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {q
                ? `Keine Meldungen für „${q}" gefunden.`
                : revierIds.length === 0
                ? 'Sie haben noch keine Reviere eingezeichnet.'
                : 'Noch keine Meldungen in Ihren Revieren.'}
            </p>
            {revierIds.length === 0 && !q && (
              <Button asChild className="mt-4" size="sm">
                <Link href="/reviere/neu">Erstes Revier einzeichnen</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {meldungen.map((m) => {
            const statusInfo = STATUS_LABELS[m.status] ?? STATUS_LABELS.gemeldet
            const reviername = reviere?.find((r) => r.id === m.revier_id)?.name
            return (
              <Link key={m.id} href={`/meldungen/${m.id}`} className="block group">
                <Card className="border-0 bg-card rounded-2xl group-hover:bg-surface-container transition-colors">
                  <CardContent className="p-5 flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <CopyIdButton id={m.id} />
                        <span className="font-semibold text-foreground">{m.tier_art ?? '—'}</span>
                        {m.tier_tot !== null && (
                          <>
                            <span className="text-muted-foreground text-sm">—</span>
                            <span className="text-sm text-muted-foreground">
                              {m.tier_tot ? 'tot' : 'verletzt'}
                            </span>
                          </>
                        )}
                        <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {reviername && (
                        <p className="text-xs text-muted-foreground mb-1">Revier: {reviername}</p>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {m.address || `${m.latitude?.toFixed(4)}, ${m.longitude?.toFixed(4)}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(m.created_at).toLocaleString('de-DE')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
