'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default marker icon path resolution with webpack
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}

interface LeafletMapProps {
  center: [number, number]
  zoom?: number
  className?: string
  children?: React.ReactNode
}

export default function LeafletMap({
  center,
  zoom = 13,
  className = 'h-64 w-full rounded-xl',
  children,
}: LeafletMapProps) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}
