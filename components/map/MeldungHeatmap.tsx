'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface HeatPoint {
  lat: number
  lng: number
}

function HeatLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('leaflet.heat')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heat = (L as any).heatLayer(
      points.map((p) => [p.lat, p.lng, 1]),
      {
        radius: 30,
        blur: 25,
        maxZoom: 14,
        gradient: { 0.2: '#154212', 0.5: '#2D5A27', 0.8: '#fd8b00', 1.0: '#e63946' },
      }
    )
    heat.addTo(map)

    // Fit bounds to all points
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    }

    return () => {
      map.removeLayer(heat)
    }
  }, [map, points])

  return null
}

export default function MeldungHeatmap({ points }: { points: HeatPoint[] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={[51.1657, 10.4515]}
        zoom={6}
        className="h-[500px] w-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer points={points} />
      </MapContainer>
    </div>
  )
}
