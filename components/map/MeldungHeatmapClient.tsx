'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

const MeldungHeatmap = dynamic(() => import('./MeldungHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-muted-foreground" />
    </div>
  ),
})

interface HeatPoint { lat: number; lng: number }

export default function MeldungHeatmapClient({ points }: { points: HeatPoint[] }) {
  return <MeldungHeatmap points={points} />
}
