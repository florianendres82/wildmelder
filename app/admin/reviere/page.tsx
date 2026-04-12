import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Map, Phone } from 'lucide-react'
import DeleteRevierButton from './DeleteRevierButton'
import TransferRevierButton from './TransferRevierButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Revierverwaltung | Admin | Wildmelder',
}

export default async function AdminRevierePage() {
  const supabase = await createClient()

  const { data: reviere } = await supabase
    .from('reviere')
    .select(`
      id, name, phone_numbers, created_at,
      profiles ( display_name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Revierverwaltung</h1>
      <p className="text-muted-foreground mb-8">
        {reviere?.length ?? 0} Revier{(reviere?.length ?? 0) !== 1 ? 'e' : ''} eingetragen
      </p>

      {!reviere || reviere.length === 0 ? (
        <Card className="border-0 bg-surface-container rounded-2xl">
          <CardContent className="p-12 text-center">
            <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Reviere eingetragen.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviere.map((revier) => {
            const profile = revier.profiles as unknown as { display_name: string } | null
            return (
              <Card key={revier.id} className="border-0 bg-card rounded-2xl">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground mb-0.5">{revier.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Jäger: {profile?.display_name ?? 'Unbekannt'}
                    </p>
                    {revier.phone_numbers?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {revier.phone_numbers.map((phone: string, idx: number) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1"
                          >
                            <Phone className="w-3 h-3" />
                            {phone}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(revier.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TransferRevierButton revierId={revier.id} revierName={revier.name} />
                      <DeleteRevierButton revierId={revier.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
