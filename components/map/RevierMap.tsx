'use client'

import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import ZoomDisplay from './ZoomDisplay'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { GeoJSON } from 'geojson'

// Fix Leaflet icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface RevierData {
  polygon: GeoJSON.Polygon
  name: string
  id?: string
}

interface RevierMapProps {
  reviere: RevierData[]
  className?: string
  zoom?: number
}

function geoJsonToLatLngs(polygon: GeoJSON.Polygon): [number, number][] {
  return polygon.coordinates[0].map(([lng, lat]) => [lat, lng])
}

function getCenter(polygon: GeoJSON.Polygon): [number, number] {
  const coords = polygon.coordinates[0]
  const lat = coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length
  const lng = coords.reduce((sum, [lng]) => sum + lng, 0) / coords.length
  return [lat, lng]
}

export default function RevierMap({ reviere, className = 'h-48 w-full rounded-xl', zoom = 12 }: RevierMapProps) {
  const center: [number, number] =
    reviere.length > 0 ? getCenter(reviere[0].polygon) : [51.1657, 10.4515]

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reviere.map((revier, idx) => (
        <Polygon
          key={revier.id ?? idx}
          positions={geoJsonToLatLngs(revier.polygon)}
          pathOptions={{
            color: '#154212',
            fillColor: '#2D5A27',
            fillOpacity: 0.3,
            weight: 2,
          }}
        >
          {revier.name && <Tooltip sticky>{revier.name}</Tooltip>}
        </Polygon>
      ))}
      <ZoomDisplay />
    </MapContainer>
  )
}
