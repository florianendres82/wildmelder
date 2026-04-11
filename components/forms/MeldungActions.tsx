'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, CheckCircle, Clock, AlertTriangle, Car, Leaf } from 'lucide-react'

const STATUSES = [
  { value: 'gemeldet', label: 'Gemeldet', icon: AlertTriangle, class: 'bg-secondary/20 text-secondary border-secondary/30' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung', icon: Clock, class: 'bg-accent/20 text-accent border-accent/30' },
  { value: 'abgeschlossen', label: 'Abgeschlossen', icon: CheckCircle, class: 'bg-primary/20 text-primary border-primary/30' },
] as const

const MELDUNGSARTEN = [
  { value: 'unfallwild', label: 'Unfallwild', icon: Car, class: 'bg-secondary/20 text-secondary border-secondary/30' },
  { value: 'fallwild', label: 'Fallwild', icon: Leaf, class: 'bg-primary/20 text-primary border-primary/30' },
] as const

type Status = (typeof STATUSES)[number]['value']
type Meldungsart = (typeof MELDUNGSARTEN)[number]['value']

export default function MeldungActions({
  meldungId,
  currentStatus,
  currentMeldungsart = 'unfallwild',
}: {
  meldungId: string
  currentStatus: Status
  currentMeldungsart?: Meldungsart
}) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(currentStatus)
  const [meldungsart, setMeldungsart] = useState<Meldungsart>(currentMeldungsart)
  const [loadingStatus, setLoadingStatus] = useState<Status | null>(null)
  const [loadingMeldungsart, setLoadingMeldungsart] = useState<Meldungsart | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  async function updateStatus(next: Status) {
    if (next === status) return
    setLoadingStatus(next)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('wildmeldungen')
      .update({ status: next })
      .eq('id', meldungId)
    if (err) {
      setError(err.message)
    } else {
      setStatus(next)
      router.refresh()
    }
    setLoadingStatus(null)
  }

  async function updateMeldungsart(next: Meldungsart) {
    if (next === meldungsart) return
    setLoadingMeldungsart(next)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('wildmeldungen')
      .update({ meldungsart: next })
      .eq('id', meldungId)
    if (err) {
      setError(err.message)
    } else {
      setMeldungsart(next)
      router.refresh()
    }
    setLoadingMeldungsart(null)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('wildmeldungen')
      .delete()
      .eq('id', meldungId)
    if (err) {
      setError(err.message)
      setDeleting(false)
      setConfirmDelete(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {/* Meldungsart */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Meldungsart</p>
        <div className="flex flex-wrap gap-2">
          {MELDUNGSARTEN.map(({ value, label, icon: Icon, class: cls }) => {
            const isActive = meldungsart === value
            const isLoading = loadingMeldungsart === value
            return (
              <button
                key={value}
                onClick={() => updateMeldungsart(value)}
                disabled={loadingMeldungsart !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  isActive
                    ? `${cls} ring-2 ring-offset-1 ring-current`
                    : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Status buttons */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(({ value, label, icon: Icon, class: cls }) => {
            const isActive = status === value
            const isLoading = loadingStatus === value
            return (
              <button
                key={value}
                onClick={() => updateStatus(value)}
                disabled={loadingStatus !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  isActive
                    ? `${cls} ring-2 ring-offset-1 ring-current`
                    : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Delete */}
      <div className="pt-2 border-t border-border">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <p className="text-sm text-destructive flex-1">Wirklich löschen?</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Löschen
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Meldung löschen
          </Button>
        )}
      </div>
    </div>
  )
}
