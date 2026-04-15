'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

const AllReviereMap = dynamic(() => import('./AllReviereMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-muted-foreground" />
    </div>
  ),
})

export interface AllRevierEntry {
  id: string
  name: string
  jaeger_name: string | null
  coordinates: number[][][]
}

export default function AllReviereMapClient({
  entries,
  highlightId,
  className,
}: {
  entries: AllRevierEntry[]
  highlightId?: string | null
  className?: string
}) {
  return <AllReviereMap entries={entries} highlightId={highlightId} className={className} />
}
