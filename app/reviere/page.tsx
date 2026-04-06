import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Phone, Pencil, Map } from 'lucide-react'
import type { GeoJSON } from 'geojson'
import RevierMapClient from '@/components/map/RevierMapClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meine Reviere | Wildmelder',
}

export default async function RevierePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: reviere } = await supabase
    .from('reviere')
    .select('id, name, polygon, phone_numbers, created_at')
    .eq('jaeger_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Meine Reviere</h1>
          <p className="text-muted-foreground mt-1">
            {reviere?.length ?? 0} Revier{(reviere?.length ?? 0) !== 1 ? 'e' : ''} eingetragen
          </p>
        </div>
        <Button asChild>
          <Link href="/reviere/neu">
            <Plus className="w-4 h-4 mr-1.5" />
            Neues Revier
          </Link>
        </Button>
      </div>

      {!reviere || reviere.length === 0 ? (
        <Card className="border-0 bg-surface-container rounded-2xl">
          <CardContent className="p-12 text-center">
            <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
              Noch kein Revier eingezeichnet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Zeichnen Sie Ihr Jagdrevier auf der Karte ein. So können Wildunfallmelder
              Sie automatisch kontaktieren.
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/reviere/neu">Erstes Revier einzeichnen</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviere.map((revier) => (
            <Card key={revier.id} className="border-0 bg-card rounded-2xl overflow-hidden">
              <RevierMapClient
                reviere={[{ polygon: revier.polygon as GeoJSON.Polygon, name: revier.name, id: revier.id }]}
                className="h-48 w-full"
                zoom={12}
              />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="font-heading font-semibold text-xl text-foreground">{revier.name}</h2>
                  <Button asChild variant="ghost" size="icon" className="shrink-0">
                    <Link href={`/reviere/${revier.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                {revier.phone_numbers?.length > 0 ? (
                  <div className="space-y-1">
                    {revier.phone_numbers.map((phone: string, idx: number) => (
                      <a
                        key={idx}
                        href={`tel:${phone}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {phone}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Telefonnummer hinterlegt</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
