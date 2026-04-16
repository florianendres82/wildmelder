'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateMeldungDoku } from '@/app/melden/actions'
import { Button } from '@/components/ui/button'
import TierStep from './TierStep'
import PhotoStep from './PhotoStep'
import JaegerStep from './JaegerStep'
import { cn } from '@/lib/utils'
import { MapPin, TreePine, FileText, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[3/2] w-full rounded-xl bg-muted animate-pulse flex items-center justify-center">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
    ),
  }
)

interface MatchedRevier {
  id: string
  name: string
  phone_numbers: string[]
  jaeger_name: string | null
}

interface MeldungFormData {
  latitude: number | null
  longitude: number | null
  address: string
  tierArt: string
  tierTot: boolean
  notes: string
  photoFiles: File[]
  reporterName: string
  reporterPhone: string
}

const STEPS = [
  { label: 'Standort', icon: MapPin },
  { label: 'Jäger', icon: TreePine },
  { label: 'Dokumentation', icon: FileText },
]

export default function MeldungStepper() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [error, setError] = useState('')
  const [matchedRevier, setMatchedRevier] = useState<MatchedRevier | null | undefined>(undefined)
  const [meldungId, setMeldungId] = useState<string | null>(null)

  const [formData, setFormData] = useState<MeldungFormData>({
    latitude: null,
    longitude: null,
    address: '',
    tierArt: '',
    tierTot: true,
    notes: '',
    photoFiles: [],
    reporterName: '',
    reporterPhone: '',
  })

  async function goToJaeger() {
    if (!formData.latitude || !formData.longitude) return
    setLookupLoading(true)
    setStep(1)
    setError('')

    try {
      // 1. Match revier
      const res = await fetch('/api/match-revier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: formData.latitude, longitude: formData.longitude }),
      })
      const { revier } = await res.json()
      setMatchedRevier(revier ?? null)

      // 2. Sofort speichern (anon INSERT erlaubt via RLS)
      const supabase = createClient()
      const newId = crypto.randomUUID()
      const { error: insertError } = await supabase.from('wildmeldungen').insert({
        id: newId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address || null,
        revier_id: revier?.id ?? null,
        meldungsart: 'unfallwild',
      })

      if (!insertError) {
        setMeldungId(newId)
      }
    } catch {
      setMatchedRevier(null)
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleSubmit() {
    if (!formData.latitude || !formData.longitude) return
    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()

      // Upload photos
      const photoUrls: string[] = []
      for (const file of formData.photoFiles) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data, error: uploadError } = await supabase.storage
          .from('wildmeldung-photos')
          .upload(path, file)
        if (!uploadError && data) {
          const { data: urlData } = supabase.storage
            .from('wildmeldung-photos')
            .getPublicUrl(data.path)
          photoUrls.push(urlData.publicUrl)
        }
      }

      const dokuData = {
        tier_art: formData.tierArt || null,
        tier_tot: formData.tierTot,
        notes: formData.notes || null,
        photo_urls: photoUrls,
        reporter_name: formData.reporterName || null,
        reporter_phone: formData.reporterPhone || null,
      }

      if (meldungId) {
        // Meldung wurde bereits in Schritt 1 gespeichert → nur ergänzen
        await updateMeldungDoku(meldungId, dokuData)
        router.push(`/melden/result?id=${meldungId}`)
      } else {
        // Fallback: kompletter INSERT (z. B. wenn Schritt-1-Insert fehlschlug)
        const newId = crypto.randomUUID()
        const { error: insertError } = await supabase.from('wildmeldungen').insert({
          id: newId,
          latitude: formData.latitude,
          longitude: formData.longitude,
          address: formData.address || null,
          revier_id: matchedRevier?.id ?? null,
          meldungsart: 'unfallwild',
          ...dokuData,
        })
        if (insertError) throw insertError
        router.push(`/melden/result?id=${newId}`)
      }
    } catch (err) {
      console.error(err)
      setError('Fehler beim Speichern der Meldung. Bitte versuchen Sie es erneut.')
      setSubmitting(false)
    }
  }

  const locationSet = formData.latitude !== null && formData.longitude !== null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, idx) => {
          const Icon = s.icon
          const done = idx < step
          const active = idx === step
          return (
            <div key={idx} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors',
                active ? 'text-primary' : done ? 'text-primary/60' : 'text-muted-foreground'
              )}>
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                  active ? 'bg-primary text-primary-foreground'
                    : done ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 rounded-full transition-colors',
                  done ? 'bg-primary/40' : 'bg-border'
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="mb-8">
        {step === 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              Wo ist der Unfall passiert?
            </h2>
            <p className="text-muted-foreground mb-6">
              GPS-Standort ermitteln oder auf der Karte markieren.
            </p>
            <LocationPicker
              onLocationChange={(lat, lng, address) =>
                setFormData((d) => ({ ...d, latitude: lat, longitude: lng, address }))
              }
              initialLat={formData.latitude ?? undefined}
              initialLng={formData.longitude ?? undefined}
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              Zuständiger Jäger
            </h2>
            <p className="text-muted-foreground mb-6">
              Basierend auf dem gemeldeten Standort.
            </p>
            <JaegerStep loading={lookupLoading} revier={matchedRevier ?? null} />
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              Unfall dokumentieren
            </h2>
            <p className="text-muted-foreground mb-6">
              Helfen Sie bei der Dokumentation für Versicherung und Polizei.
            </p>
            <div className="space-y-8">
              <TierStep
                tierArt={formData.tierArt}
                tierTot={formData.tierTot}
                onTierArtChange={(v) => setFormData((d) => ({ ...d, tierArt: v }))}
                onTierTotChange={(v) => setFormData((d) => ({ ...d, tierTot: v }))}
              />
              <PhotoStep
                photoFiles={formData.photoFiles}
                notes={formData.notes}
                reporterName={formData.reporterName}
                reporterPhone={formData.reporterPhone}
                onPhotosChange={(files) => setFormData((d) => ({ ...d, photoFiles: files }))}
                onNotesChange={(v) => setFormData((d) => ({ ...d, notes: v }))}
                onReporterNameChange={(v) => setFormData((d) => ({ ...d, reporterName: v }))}
                onReporterPhoneChange={(v) => setFormData((d) => ({ ...d, reporterPhone: v }))}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="h-14"
            disabled={submitting || lookupLoading}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Zurück
          </Button>
        )}

        {step === 0 && (
          <Button
            type="button"
            onClick={goToJaeger}
            className="flex-1 h-14 text-base font-semibold"
            disabled={!locationSet}
          >
            Jäger ermitteln
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        )}

        {step === 1 && (
          <Button
            type="button"
            onClick={() => setStep(2)}
            className="flex-1 h-14 text-base font-semibold"
            disabled={lookupLoading}
          >
            Weiter
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        )}

        {step === 2 && (
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-14 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={submitting}
          >
            {submitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {submitting ? 'Wird gespeichert…' : 'Meldung abschließen'}
          </Button>
        )}
      </div>
    </div>
  )
}
