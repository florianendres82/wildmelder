import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Phone, User, FileText, Calendar } from 'lucide-react'
import MeldungActions from '@/components/forms/MeldungActions'
import MeldungPDFButton from '@/components/forms/MeldungPDFButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meldung | Wildmelder',
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  gemeldet: { label: 'Gemeldet', class: 'bg-secondary/20 text-secondary' },
  in_bearbeitung: { label: 'In Bearbeitung', class: 'bg-accent/20 text-accent' },
  abgeschlossen: { label: 'Abgeschlossen', class: 'bg-primary/20 text-primary' },
}

const TIER_LABELS: Record<string, string> = {
  Reh: 'Reh',
  Wildschwein: 'Wildschwein',
  Fuchs: 'Fuchs',
  Hase: 'Hase',
  Dachs: 'Dachs',
  Hirsch: 'Hirsch',
  Vogel: 'Vogel',
  Sonstiges: 'Sonstiges',
}

export default async function MeldungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the meldung — RLS ensures only reports in the Jäger's reviere are visible
  const { data: meldung } = await supabase
    .from('wildmeldungen')
    .select('*, reviere(name, jaeger_id)')
    .eq('id', id)
    .single()

  if (!meldung) notFound()

  // Confirm the Jäger owns this revier (belt-and-suspenders)
  const revier = meldung.reviere as { name: string; jaeger_id: string } | null
  if (revier?.jaeger_id !== user.id) notFound()

  const statusInfo = STATUS_LABELS[meldung.status] ?? STATUS_LABELS.gemeldet
  const mapsUrl = `https://www.google.com/maps?q=${meldung.latitude},${meldung.longitude}`

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Zurück zum Dashboard
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {TIER_LABELS[meldung.tier_art] ?? meldung.tier_art}
              {' '}
              <span className="font-normal text-muted-foreground text-lg">
                — {meldung.tier_tot ? 'tot' : 'verletzt'}
              </span>
            </h1>
            {revier && (
              <p className="text-sm text-muted-foreground mt-0.5">Revier: {revier.name}</p>
            )}
          </div>
          <span className={`text-xs font-medium rounded-full px-3 py-1 shrink-0 ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Location */}
        <Card className="border-0 bg-surface-container rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Fundort</h2>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-foreground text-sm">
                  {meldung.address || `${meldung.latitude?.toFixed(5)}, ${meldung.longitude?.toFixed(5)}`}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-0.5 inline-block"
                >
                  In Google Maps öffnen →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporter */}
        {(meldung.reporter_name || meldung.reporter_phone) && (
          <Card className="border-0 bg-surface-container rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Melder</h2>
              {meldung.reporter_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-foreground">{meldung.reporter_name}</p>
                </div>
              )}
              {meldung.reporter_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${meldung.reporter_phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {meldung.reporter_phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {meldung.notes && (
          <Card className="border-0 bg-surface-container rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Notizen</h2>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-foreground whitespace-pre-wrap">{meldung.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {meldung.photo_urls && meldung.photo_urls.length > 0 && (
          <Card className="border-0 bg-surface-container rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Fotos ({meldung.photo_urls.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {meldung.photo_urls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <Calendar className="w-3.5 h-3.5" />
          Gemeldet am {new Date(meldung.created_at).toLocaleString('de-DE')}
        </div>

        {/* Actions */}
        <Card className="border-0 bg-card rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <MeldungActions
              meldungId={meldung.id}
              currentStatus={meldung.status as 'gemeldet' | 'in_bearbeitung' | 'abgeschlossen'}
            />
            <div className="pt-2 border-t border-border">
              <MeldungPDFButton data={{
                id: meldung.id,
                createdAt: meldung.created_at,
                address: meldung.address,
                latitude: meldung.latitude,
                longitude: meldung.longitude,
                tierArt: meldung.tier_art,
                tierTot: meldung.tier_tot,
                notes: meldung.notes,
                reporterName: meldung.reporter_name,
                reporterPhone: meldung.reporter_phone,
                reviername: revier?.name ?? null,
                jaegerName: revier?.profiles?.display_name ?? null,
                jaegerPhone: revier?.phone_numbers?.[0] ?? null,
              }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
