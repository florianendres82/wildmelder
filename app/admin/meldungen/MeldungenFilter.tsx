'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const TIERARTEN = ['Reh', 'Wildschwein', 'Fuchs', 'Hase', 'Dachs', 'Hirsch', 'Vogel', 'Sonstiges']

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

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="flex flex-wrap gap-3 items-center">
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

      {(tierArt || zeitraum) && (
        <button
          onClick={() => { update('tier', ''); update('tage', '') }}
          className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  )
}
