import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Phone, MapPin, ArrowRight } from 'lucide-react'
import RevierMapClient from '@/components/map/RevierMapClient'
import type { GeoJSON } from 'geojson'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Revier | Wildmelder',
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  gemeldet: { label: 'Gemeldet', class: 'bg-secondary/20 text-secondary' },
  in_bearbeitung: { label: 'In Bearbeitung', class: 'bg-accent/20 text-accent' },
  abgeschlossen: { label: 'Abgeschlossen', class: 'bg-primary/20 text-primary' },
}

export default async function RevierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: revier } = await supabase
    .from('reviere')
    .select('id, name, polygon, phone_numbers, jaeger_id')
    .eq('id', id)
    .eq('jaeger_id', user.id)
    .single()

  if (!revier) notFound()

  const { data: meldungen } = await supabase
    .from('wildmeldungen')
    .select('id, tier_art, tier_tot, address, latitude, longitude, status, created_at')
    .eq('revier_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Zurück zum Dashboard
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="font-heading text-3xl font-bold text-foreground">{revier.name}</h1>
          <Button asChild size="sm" variant="outline">
            <Link href={`/reviere/${id}/edit`}>
              <Pencil className="w-4 h-4 mr-1.5" />
              Bearbeiten
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-border">
          <RevierMapClient
            reviere={[{ polygon: revier.polygon as GeoJSON.Polygon, name: revier.name, id: revier.id }]}
            className="h-64 w-full"
            zoom={12}
          />
        </div>

        {/* Phone numbers */}
        {revier.phone_numbers && revier.phone_numbers.length > 0 && (
          <Card className="border-0 bg-surface-container rounded-2xl">
            <CardContent className="p-5 space-y-2">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Telefonnummern</h2>
              {revier.phone_numbers.map((phone: string) => (
                <a
                  key={phone}
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {phone}
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Meldungen */}
        <div>
          <h2 className="font-heading font-semibold text-lg text-foreground mb-3">
            Meldungen{meldungen && meldungen.length > 0 ? ` (${meldungen.length})` : ''}
          </h2>
          {!meldungen || meldungen.length === 0 ? (
            <Card className="border-0 bg-surface-container rounded-2xl">
              <CardContent className="p-8 text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Noch keine Meldungen in diesem Revier.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {meldungen.map((m) => {
                const statusInfo = STATUS_LABELS[m.status] ?? STATUS_LABELS.gemeldet
                return (
                  <Link key={m.id} href={`/meldungen/${m.id}`} className="block group">
                    <Card className="border-0 bg-card rounded-2xl group-hover:bg-surface-container transition-colors">
                      <CardContent className="p-4 flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                              {m.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="font-semibold text-foreground text-sm">{m.tier_art ?? '—'}</span>
                            {m.tier_tot !== null && (
                              <span className="text-xs text-muted-foreground">
                                — {m.tier_tot ? 'tot' : 'verletzt'}
                              </span>
                            )}
                            <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${statusInfo.class}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {m.address || `${m.latitude?.toFixed(4)}, ${m.longitude?.toFixed(4)}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
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
      </div>
    </div>
  )
}
