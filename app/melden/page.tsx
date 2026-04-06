import type { Metadata } from 'next'
import MeldungStepper from '@/components/forms/MeldungStepper'

export const metadata: Metadata = {
  title: 'Wildunfall melden | Wildmelder',
  description: 'Wildunfall melden — Standort bestimmen, Tier auswählen, Jäger finden.',
}

export default function MeldenPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">
            Wildunfall melden
          </h1>
          <p className="text-primary-foreground/80 mt-2">
            In wenigen Schritten den zuständigen Jäger erreichen
          </p>
        </div>
      </div>
      <MeldungStepper />
    </div>
  )
}
