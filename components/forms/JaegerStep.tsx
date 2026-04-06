'use client'

import { Phone, MapPin, User, AlertTriangle, Loader2 } from 'lucide-react'

interface MatchedRevier {
  id: string
  name: string
  phone_numbers: string[]
  jaeger_name: string | null
}

interface JaegerStepProps {
  loading: boolean
  revier: MatchedRevier | null
}

export default function JaegerStep({ loading, revier }: JaegerStepProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Zuständigen Jäger wird ermittelt…</p>
      </div>
    )
  }

  if (!revier) {
    return (
      <div className="space-y-4">
        <div className="bg-surface-container-high rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Kein Revier gefunden</p>
            <p className="text-sm text-muted-foreground">
              Für diesen Standort ist kein Jäger eingetragen. Bitte informieren Sie die Polizei unter <strong>110</strong>.
            </p>
          </div>
        </div>
        <a
          href="tel:110"
          className="flex items-center justify-center gap-3 bg-secondary text-secondary-foreground font-bold text-lg rounded-2xl px-5 py-4 hover:bg-secondary/90 transition-colors w-full"
        >
          <Phone className="w-6 h-6" />
          110 — Polizei anrufen
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary rounded-2xl p-6">
        <p className="text-sm text-primary-foreground/70 font-medium mb-4 uppercase tracking-wide">
          Zuständiger Jäger gefunden
        </p>
        <div className="space-y-3 mb-5">
          {revier.jaeger_name && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-primary-foreground/60 shrink-0" />
              <div>
                <p className="text-xs text-primary-foreground/60">Jäger</p>
                <p className="font-semibold text-primary-foreground">{revier.jaeger_name}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary-foreground/60 shrink-0" />
            <div>
              <p className="text-xs text-primary-foreground/60">Revier</p>
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
            Keine Telefonnummer hinterlegt — bitte Polizei unter 110 verständigen.
          </p>
        )}
      </div>

      <div className="bg-secondary rounded-2xl px-5 py-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-secondary-foreground shrink-0" />
        <p className="text-sm text-secondary-foreground">
          Polizei zusätzlich informieren — gesetzliche Pflicht (§ 34 StVO)
        </p>
        <a href="tel:110" className="ml-auto shrink-0 font-bold text-secondary-foreground hover:underline">
          110
        </a>
      </div>
    </div>
  )
}
