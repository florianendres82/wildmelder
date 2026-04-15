'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ArrowRightLeft, Loader2, Check } from 'lucide-react'
import { searchJaeger, transferRevier } from '@/app/reviere/[id]/edit/actions'

interface JaegerResult {
  id: string
  display_name: string | null
  role: string | null
  email?: string
}

export default function RevierTransferForm({ revierId }: { revierId: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<JaegerResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<JaegerResult | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [transferring, setTransferring] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    setSelected(null)
    setError('')
    try {
      const data = await searchJaeger(query)
      setResults(data)
      if (data.length === 0) setError('Kein Jäger mit diesem Namen gefunden.')
    } catch {
      setError('Suche fehlgeschlagen.')
    } finally {
      setSearching(false)
    }
  }

  async function handleTransfer() {
    if (!selected) return
    if (!confirming) {
      setConfirming(true)
      return
    }
    setTransferring(true)
    setError('')
    try {
      await transferRevier(revierId, selected.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Übertragung fehlgeschlagen.')
      setTransferring(false)
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Name oder E-Mail suchen… (* als Platzhalter)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
            setConfirming(false)
            setResults([])
            setError('')
          }}
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={searching || !query.trim()}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((jaeger) => (
            <button
              key={jaeger.id}
              type="button"
              onClick={() => { setSelected(jaeger); setConfirming(false) }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between gap-3 ${
                selected?.id === jaeger.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              <span className="flex flex-col min-w-0">
                <span>{jaeger.display_name ?? 'Unbekannt'}</span>
                {jaeger.email && (
                  <span className="text-xs text-muted-foreground font-normal truncate">{jaeger.email}</span>
                )}
              </span>
              {selected?.id === jaeger.id && <Check className="w-4 h-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {selected && (
        <div className="pt-2">
          {confirming ? (
            <div className="bg-destructive/10 rounded-xl p-4 space-y-3">
              <p className="text-sm text-destructive font-medium">
                Revier wirklich an <strong>{selected.display_name}</strong> übertragen?
                Sie verlieren danach den Zugriff.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={transferring}
                >
                  Abbrechen
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleTransfer}
                  disabled={transferring}
                >
                  {transferring && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Ja, jetzt übertragen
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleTransfer}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              An {selected.display_name} übertragen
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
