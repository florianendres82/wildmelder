'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Loader2, Map } from 'lucide-react'
import type { GeoJSON } from 'geojson'

const PolygonEditor = dynamic(() => import('@/components/map/PolygonEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl bg-muted animate-pulse flex items-center justify-center">
      <Map className="w-8 h-8 text-muted-foreground" />
    </div>
  ),
})

interface RevierFormProps {
  editId?: string
  initialName?: string
  initialPolygon?: GeoJSON.Polygon
  initialPhones?: string[]
}

export default function RevierForm({
  editId,
  initialName = '',
  initialPolygon,
  initialPhones = [''],
}: RevierFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [polygon, setPolygon] = useState<GeoJSON.Polygon | null>(initialPolygon ?? null)
  const [phones, setPhones] = useState<string[]>(initialPhones.length > 0 ? initialPhones : [''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addPhone() {
    setPhones((p) => [...p, ''])
  }

  function updatePhone(idx: number, value: string) {
    setPhones((p) => p.map((ph, i) => (i === idx ? value : ph)))
  }

  function removePhone(idx: number) {
    setPhones((p) => p.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Bitte geben Sie einen Namen für das Revier ein.')
      return
    }
    if (!polygon) {
      setError('Bitte zeichnen Sie das Revier auf der Karte ein.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const filteredPhones = phones.filter((p) => p.trim() !== '')

    if (editId) {
      const { error: updateError } = await supabase
        .from('reviere')
        .update({
          name: name.trim(),
          polygon,
          phone_numbers: filteredPhones,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editId)
        .eq('jaeger_id', user.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('reviere').insert({
        name: name.trim(),
        polygon,
        phone_numbers: filteredPhones,
        jaeger_id: user.id,
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push('/reviere')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">
          Name des Reviers
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="z. B. Revier Mustertal Nord"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12"
        />
      </div>

      {/* Polygon Editor */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          Revier einzeichnen
        </Label>
        <p className="text-sm text-muted-foreground">
          Nutzen Sie das Polygon-Werkzeug in der linken Kartenleiste, um Ihr Revier einzuzeichnen.
        </p>
        <PolygonEditor
          onPolygonChange={setPolygon}
          initialPolygon={initialPolygon}
        />
      </div>

      {/* Phone numbers */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Telefonnummern</Label>
        <p className="text-sm text-muted-foreground">
          Diese Nummern werden bei Wildunfällen in Ihrem Revier angezeigt.
        </p>
        <div className="space-y-2">
          {phones.map((phone, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                type="tel"
                placeholder="+49 …"
                value={phone}
                onChange={(e) => updatePhone(idx, e.target.value)}
                className="flex-1"
              />
              {phones.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePhone(idx)}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPhone}
          className="mt-1"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nummer hinzufügen
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={() => router.push('/reviere')}
          disabled={loading}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 font-semibold"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? 'Wird gespeichert…' : editId ? 'Änderungen speichern' : 'Revier speichern'}
        </Button>
      </div>
    </form>
  )
}
