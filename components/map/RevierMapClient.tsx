'use client'

import dynamic from 'next/dynamic'
import type { GeoJSON } from 'geojson'

const RevierMap = dynamic(() => import('./RevierMap'), {
  ssr: false,
  loading: () => <div className="h-48 w-full rounded-xl bg-muted animate-pulse" />,
})

interface RevierData {
  polygon: GeoJSON.Polygon
  name: string
  id?: string
}

interface RevierMapClientProps {
  reviere: RevierData[]
  className?: string
  zoom?: number
}

export default function RevierMapClient(props: RevierMapClientProps) {
  return <RevierMap {...props} />
}
