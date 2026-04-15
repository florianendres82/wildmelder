import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import RevierForm from '@/components/forms/RevierForm'
import RevierDeleteButton from '@/components/forms/RevierDeleteButton'
import RevierTransferForm from '@/components/forms/RevierTransferForm'
import RevierMitgliederForm from '@/components/forms/RevierMitgliederForm'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRightLeft, Users } from 'lucide-react'
import type { GeoJSON } from 'geojson'

export const metadata: Metadata = {
  title: 'Revier bearbeiten | Wildunfall-Helfer',
}

export default async function EditRevierPage({
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Admin can edit any revier; Jäger only their own
  const db = isAdmin ? createAdminClient() : supabase
  const query = db
    .from('reviere')
    .select('id, name, polygon, phone_numbers, jaeger_id')
    .eq('id', id)

  if (!isAdmin) query.eq('jaeger_id', user.id)

  const { data: revier } = await query.single()

  const adminDb = createAdminClient()
  const { data: mitglieder } = await adminDb
    .from('revier_mitglieder')
    .select('jaeger_id, profiles(display_name)')
    .eq('revier_id', id)

  if (!revier) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Revier bearbeiten
          </h1>
          <p className="text-muted-foreground mt-1">{revier.name}</p>
        </div>
        <RevierDeleteButton revierId={revier.id} />
      </div>
      <RevierForm
        editId={revier.id}
        initialName={revier.name}
        initialPolygon={revier.polygon as GeoJSON.Polygon}
        initialPhones={revier.phone_numbers ?? []}
      />

      {!isAdmin && (
        <Card className="border-0 bg-surface-container rounded-2xl mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Mitglieder</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Laden Sie andere Jäger ein, dieses Revier einzusehen und Meldungen zu empfangen.
            </p>
            <RevierMitgliederForm
              revierId={revier.id}
              ownerId={revier.jaeger_id}
              initialMitglieder={(mitglieder ?? []).map((m) => ({
                id: m.jaeger_id,
                display_name: (m.profiles as unknown as { display_name: string | null } | null)?.display_name ?? null,
              }))}
            />
          </CardContent>
        </Card>
      )}

      <Card className="border-0 bg-surface-container rounded-2xl mt-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Revier übertragen</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Übertragen Sie dieses Revier an einen anderen Jäger. Sie verlieren danach den Zugriff.
          </p>
          <RevierTransferForm revierId={revier.id} />
        </CardContent>
      </Card>
    </div>
  )
}
