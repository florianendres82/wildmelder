'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, X, MapPin, Phone, Loader2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AllReviereMapClient, { type AllRevierEntry } from '@/components/map/AllReviereMapClient'
import DeleteRevierButton from './DeleteRevierButton'
import TransferRevierButton from './TransferRevierButton'

const BUNDESLAENDER = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
  'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',
]

export interface RevierListEntry extends AllRevierEntry {
  phone_numbers: string[]
  created_at: string
  centroid: [number, number]
}

async function fetchBundesland(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5`,
      { headers: { 'Accept-Language': 'de', 'User-Agent': 'Wildunfall-Helfer/1.0' } }
    )
    const data = await res.json()
    return (data?.address?.state as string) ?? null
  } catch {
    return null
  }
}

export default function AdminReviereClient({ reviere }: { reviere: RevierListEntry[] }) {
  const [search, setSearch] = useState('')
  const [bundesland, setBundesland] = useState('')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [bundeslaender, setBundeslaender] = useState<Record<string, string>>({})
  const [loadingBl, setLoadingBl] = useState(reviere.length > 0)

  useEffect(() => {
    if (reviere.length === 0) return
    let cancelled = false
    ;(async () => {
      for (const r of reviere) {
        if (cancelled) break
        const bl = await fetchBundesland(r.centroid[0], r.centroid[1])
        if (!cancelled) {
          setBundeslaender((prev) => ({ ...prev, [r.id]: bl ?? '' }))
        }
        await new Promise((res) => setTimeout(res, 1100))
      }
      if (!cancelled) setLoadingBl(false)
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return reviere.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !(r.jaeger_name ?? '').toLowerCase().includes(q)) return false
      if (bundesland && (bundeslaender[r.id] ?? '') !== bundesland) return false
      return true
    })
  }, [reviere, search, bundesland, bundeslaender])

  const availableBl = useMemo(() => {
    const found = new Set(Object.values(bundeslaender).filter(Boolean))
    return BUNDESLAENDER.filter((bl) => found.has(bl))
  }, [bundeslaender])

  return (
    <div className="space-y-6">
      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border h-[480px]">
        <AllReviereMapClient
          entries={filtered}
          highlightId={highlightId}
          className="h-full w-full"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Revier oder Jäger suchen…"
            className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            disabled={loadingBl && availableBl.length === 0}
            className="h-9 rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          >
            <option value="">Alle Bundesländer</option>
            {availableBl.map((bl) => (
              <option key={bl} value={bl}>{bl}</option>
            ))}
          </select>
          {loadingBl && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin pointer-events-none" />
          )}
        </div>

        {(search || bundesland) && (
          <button onClick={() => { setSearch(''); setBundesland('') }} className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Zurücksetzen
          </button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} von {reviere.length} Revieren
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="border-0 bg-surface-container rounded-2xl">
          <CardContent className="p-12 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Keine Reviere gefunden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((revier) => {
            const bl = bundeslaender[revier.id]
            return (
              <Card
                key={revier.id}
                className={`border-0 rounded-2xl transition-colors ${
                  highlightId === revier.id ? 'bg-accent/10 ring-1 ring-accent' : 'bg-card hover:bg-muted/40'
                }`}
                onMouseEnter={() => setHighlightId(revier.id)}
                onMouseLeave={() => setHighlightId(null)}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground mb-0.5">{revier.name}</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Jäger: {revier.jaeger_name ?? 'Unbekannt'}
                      </p>
                      {bl ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 mb-1">
                          <MapPin className="w-3 h-3" />{bl}
                        </span>
                      ) : loadingBl ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Loader2 className="w-3 h-3 animate-spin" />Bundesland wird ermittelt…
                        </span>
                      ) : null}
                      {revier.phone_numbers?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {revier.phone_numbers.map((phone, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                              <Phone className="w-3 h-3" />{phone}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(revier.created_at).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/reviere/${revier.id}/edit`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <TransferRevierButton revierId={revier.id} revierName={revier.name} />
                      <DeleteRevierButton revierId={revier.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
