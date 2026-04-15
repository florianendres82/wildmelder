'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet'
import ZoomDisplay from './ZoomDisplay'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

export interface AllRevierEntry {
  id: string
  name: string
  jaeger_name: string | null
  coordinates: number[][][]
}

function geoToLatLngs(coordinates: number[][][]): [number, number][] {
  return coordinates[0].map(([lng, lat]) => [lat, lng])
}

function FitBounds({ entries }: { entries: AllRevierEntry[] }) {
  const map = useMap()
  useEffect(() => {
    if (entries.length === 0) return
    const allCoords = entries.flatMap((r) => geoToLatLngs(r.coordinates))
    if (allCoords.length === 0) return
    map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] })
  }, [map, entries])
  return null
}

export default function AllReviereMap({
  entries,
  highlightId,
  className = 'h-full w-full',
}: {
  entries: AllRevierEntry[]
  highlightId?: string | null
  className?: string
}) {
  return (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      className={className}
      style={{ zIndex: 0 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds entries={entries} />
      {entries.map((r) => {
        const highlighted = highlightId === r.id
        return (
          <Polygon
            key={r.id}
            positions={geoToLatLngs(r.coordinates)}
            pathOptions={{
              color: highlighted ? '#fd8b00' : '#154212',
              fillColor: highlighted ? '#fd8b00' : '#2D5A27',
              fillOpacity: highlighted ? 0.45 : 0.25,
              weight: highlighted ? 3 : 2,
            }}
          >
            <Tooltip sticky>
              <strong>{r.name}</strong>
              {r.jaeger_name && <> — {r.jaeger_name}</>}
            </Tooltip>
          </Polygon>
        )
      })}
      <ZoomDisplay />
    </MapContainer>
  )
}
