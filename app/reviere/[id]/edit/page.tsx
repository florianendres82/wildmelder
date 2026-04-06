import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RevierForm from '@/components/forms/RevierForm'
import RevierDeleteButton from '@/components/forms/RevierDeleteButton'
import type { GeoJSON } from 'geojson'

export const metadata: Metadata = {
  title: 'Revier bearbeiten | Wildmelder',
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

  const { data: revier } = await supabase
    .from('reviere')
    .select('id, name, polygon, phone_numbers, jaeger_id')
    .eq('id', id)
    .eq('jaeger_id', user.id)
    .single()

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
    </div>
  )
}
