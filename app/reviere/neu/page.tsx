import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RevierForm from '@/components/forms/RevierForm'

export const metadata: Metadata = {
  title: 'Neues Revier | Wildmelder',
}

export default async function NeuRevierPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Neues Revier einzeichnen</h1>
        <p className="text-muted-foreground mt-1">
          Zeichnen Sie Ihr Jagdrevier auf der Karte ein und hinterlegen Sie Ihre Kontaktdaten.
        </p>
      </div>
      <RevierForm />
    </div>
  )
}
