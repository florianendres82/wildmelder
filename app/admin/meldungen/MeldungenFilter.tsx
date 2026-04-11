'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

const TIERARTEN = ['Reh', 'Wildschwein', 'Fuchs', 'Hase', 'Dachs', 'Hirsch', 'Vogel', 'Sonstiges']

const MELDUNGSARTEN = [
  { value: '', label: 'Alle Meldungsarten' },
  { value: 'unfallwild', label: 'Unfallwild' },
  { value: 'fallwild', label: 'Fallwild' },
]

const ZEITRAEUME = [
  { value: '', label: 'Alle Zeiträume' },
  { value: '1', label: 'Heute' },
  { value: '7', label: 'Letzte 7 Tage' },
  { value: '30', label: 'Letzte 30 Tage' },
  { value: '90', label: 'Letzte 90 Tage' },
  { value: '365', label: 'Dieses Jahr' },
]

export default function MeldungenFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tierArt = searchParams.get('tier') ?? ''
  const zeitraum = searchParams.get('tage') ?? ''
  const meldungsart = searchParams.get('meldungsart') ?? ''
  const q = searchParams.get('q') ?? ''

  const [searchInput, setSearchInput] = useState(q)

  // Sync input when URL changes externally
  useEffect(() => { setSearchInput(q) }, [q])

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    update('q', searchInput.trim())
  }

  const hasFilters = tierArt || zeitraum || meldungsart || q

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-48 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Suche nach ID, Ort, Tierart…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); update('q', '') }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Meldungsart */}
      <select
        value={meldungsart}
        onChange={(e) => update('meldungsart', e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {MELDUNGSARTEN.map((v) => (
          <option key={v.value} value={v.value}>{v.label}</option>
        ))}
      </select>

      {/* Wildart */}
      <select
        value={tierArt}
        onChange={(e) => update('tier', e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Alle Wildarten</option>
        {TIERARTEN.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Zeitraum */}
      <select
        value={zeitraum}
        onChange={(e) => update('tage', e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {ZEITRAEUME.map((z) => (
          <option key={z.value} value={z.value}>{z.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => { update('tier', ''); update('tage', ''); update('meldungsart', ''); update('q', ''); setSearchInput('') }}
          className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Zurücksetzen
        </button>
      )}
    </div>
  )
}
