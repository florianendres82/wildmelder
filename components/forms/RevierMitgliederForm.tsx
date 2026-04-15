'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, UserPlus, X, Check } from 'lucide-react'
import { searchJaeger, inviteJaeger, removeJaeger } from '@/app/reviere/[id]/edit/actions'

interface Mitglied {
  id: string
  display_name: string | null
}

interface JaegerResult {
  id: string
  display_name: string | null
  role: string | null
  email?: string
}

export default function RevierMitgliederForm({
  revierId,
  initialMitglieder,
  ownerId,
}: {
  revierId: string
  initialMitglieder: Mitglied[]
  ownerId: string
}) {
  const [mitglieder, setMitglieder] = useState<Mitglied[]>(initialMitglieder)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<JaegerResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<JaegerResult | null>(null)
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
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
      // Filter out current owner and existing members
      const memberIds = new Set([ownerId, ...mitglieder.map((m) => m.id)])
      setResults(data.filter((r) => !memberIds.has(r.id)))
      if (data.filter((r) => !memberIds.has(r.id)).length === 0)
        setError('Kein passender Jäger gefunden.')
    } catch {
      setError('Suche fehlgeschlagen.')
    } finally {
      setSearching(false)
    }
  }

  async function handleInvite() {
    if (!selected) return
    setInviting(true)
    setError('')
    try {
      await inviteJaeger(revierId, selected.id)
      setMitglieder((prev) => [...prev, { id: selected.id, display_name: selected.display_name }])
      setSelected(null)
      setResults([])
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Einladung fehlgeschlagen.')
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(jaegerId: string) {
    setRemoving(jaegerId)
    try {
      await removeJaeger(revierId, jaegerId)
      setMitglieder((prev) => prev.filter((m) => m.id !== jaegerId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Entfernen fehlgeschlagen.')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current members */}
      {mitglieder.length > 0 && (
        <div className="space-y-2">
          {mitglieder.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 bg-muted rounded-xl px-4 py-2.5"
            >
              <span className="text-sm font-medium text-foreground">
                {m.display_name ?? 'Unbekannt'}
              </span>
              <button
                onClick={() => handleRemove(m.id)}
                disabled={removing === m.id}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                {removing === m.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <X className="w-4 h-4" />
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {mitglieder.length === 0 && (
        <p className="text-sm text-muted-foreground">Noch keine Mitglieder eingeladen.</p>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Jäger suchen… (* als Platzhalter)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
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
              onClick={() => setSelected(jaeger)}
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
        <Button
          type="button"
          className="w-full"
          onClick={handleInvite}
          disabled={inviting}
        >
          {inviting
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <UserPlus className="w-4 h-4 mr-2" />
          }
          {selected.display_name} einladen
        </Button>
      )}
    </div>
  )
}
