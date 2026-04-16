import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import MeldungPDFButton from '@/components/forms/MeldungPDFButton'
import {
  CheckCircle,
  Phone,
  MapPin,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meldung erfolgreich | Wildunfall-Helfer',
}

async function getNearbyPolice(lat: number, lng: number): Promise<{ name: string; phone?: string } | null> {
  try {
    const query = `[out:json];node["amenity"="police"](around:10000,${lat},${lng});out 1;`
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { next: { revalidate: 86400 } }
    )
    const data = await res.json()
    const node = data.elements?.[0]
    if (!node) return null
    return {
      name: node.tags?.name ?? 'Polizeidienststelle',
      phone: node.tags?.phone,
    }
  } catch {
    return null
  }
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) notFound()

  const supabase = createAdminClient()

  const { data: meldung, error: meldungError } = await supabase
    .from('wildmeldungen')
    .select('id, latitude, longitude, address, tier_art, tier_tot, status, created_at, revier_id')
    .eq('id', id)
    .single()

  if (meldungError || !meldung) notFound()

  const { data: revierData } = meldung.revier_id
    ? await supabase
        .from('reviere')
        .select('id, name, phone_numbers, profiles(display_name)')
        .eq('id', meldung.revier_id)
        .single()
    : { data: null }

  const revier = revierData as {
    id: string
    name: string
    phone_numbers: string[]
    profiles: { display_name: string } | null
  } | null

  const polizei = meldung.latitude
    ? await getNearbyPolice(meldung.latitude, meldung.longitude)
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Meldung erfolgreich!
        </h1>
        <p className="text-muted-foreground">
          Ihre Wildunfall-Meldung wurde gespeichert.
        </p>
      </div>

      {/* Report summary */}
      <Card className="border-0 bg-surface-container rounded-2xl mb-4">
        <CardContent className="p-6 space-y-3">
          <h2 className="font-semibold text-foreground mb-3">Zusammenfassung</h2>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Standort</p>
              <p className="text-sm text-foreground">{meldung.address || `${meldung.latitude?.toFixed(5)}, ${meldung.longitude?.toFixed(5)}`}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Tier</p>
              <p className="text-sm text-foreground">
                {meldung.tier_art} — {meldung.tier_tot ? 'tot' : 'verletzt'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Gemeldet um</p>
              <p className="text-sm text-foreground">
                {new Date(meldung.created_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hunter contact */}
      {revier ? (
        <Card className="border-0 bg-primary rounded-2xl mb-4">
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-lg text-primary-foreground mb-4">
              Zuständiger Jäger gefunden
            </h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary-foreground/70 shrink-0" />
                <div>
                  <p className="text-xs text-primary-foreground/70">Jäger</p>
                  <p className="font-semibold text-primary-foreground">
                    {revier.profiles?.display_name ?? 'Unbekannt'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary-foreground/70 shrink-0" />
                <div>
                  <p className="text-xs text-primary-foreground/70">Revier</p>
                  <p className="font-semibold text-primary-foreground">{revier.name}</p>
                </div>
              </div>
            </div>

            {revier.phone_numbers.length > 0 ? (
              <div className="space-y-2">
                {revier.phone_numbers.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone}`}
                    className="flex items-center gap-3 bg-accent text-accent-foreground font-bold text-lg rounded-xl px-5 py-4 hover:bg-accent/90 transition-colors w-full"
                  >
                    <Phone className="w-6 h-6 shrink-0" />
                    {phone}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-primary-foreground/70 text-sm">
                Keine Telefonnummer hinterlegt. Bitte rufen Sie die Polizei (110) an.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 bg-surface-container-high rounded-2xl mb-4">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-2">Kein Revier gefunden</h2>
            <p className="text-muted-foreground text-sm">
              Für diesen Standort ist kein Jäger eingetragen. Bitte informieren Sie die Polizei.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Police */}
      <Card className="border-0 bg-secondary rounded-2xl mb-6">
        <CardContent className="p-6">
          <h2 className="font-semibold text-secondary-foreground mb-3">
            Polizei informieren
          </h2>
          <p className="text-secondary-foreground/80 text-sm mb-4">
            Bei einem Wildunfall ist die Polizei zu verständigen — gesetzliche Pflicht (§ 34 StVO).
          </p>
          {polizei && (
            <p className="text-secondary-foreground text-sm mb-3 font-medium">
              Nächste Dienststelle: {polizei.name}
              {polizei.phone && ` — ${polizei.phone}`}
            </p>
          )}
          <a
            href="tel:110"
            className="flex items-center gap-3 bg-accent text-accent-foreground font-bold text-xl rounded-xl px-5 py-4 hover:bg-accent/90 transition-colors"
          >
            <Phone className="w-6 h-6" />
            110 — Polizei anrufen
          </a>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <MeldungPDFButton data={{
          id: meldung.id,
          createdAt: meldung.created_at,
          address: meldung.address,
          latitude: meldung.latitude,
          longitude: meldung.longitude,
          tierArt: meldung.tier_art,
          tierTot: meldung.tier_tot,
          reviername: revier?.name ?? null,
          jaegerName: revier?.profiles?.display_name ?? null,
          jaegerPhone: revier?.phone_numbers?.[0] ?? null,
        }} />
        <Button asChild variant="outline" className="h-12 px-8">
          <Link href="/">Zurück zur Startseite</Link>
        </Button>
      </div>
    </div>
  )
}
