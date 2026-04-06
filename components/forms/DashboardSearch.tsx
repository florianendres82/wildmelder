'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function DashboardSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [input, setInput] = useState(q)

  useEffect(() => { setInput(q) }, [q])

  function commit(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('q', value)
    else params.delete('q')
    router.replace(`${pathname}?${params.toString()}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    commit(input.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full sm:w-72">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Suche nach ID, Ort, Tierart…"
        className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {input && (
        <button
          type="button"
          onClick={() => { setInput(''); commit('') }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  )
}
