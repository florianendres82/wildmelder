'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import ZoomDisplay from './ZoomDisplay'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import L from 'leaflet'

// Fix Leaflet icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

const HEATMAP_ZOOM_THRESHOLD = 11

export interface HeatPoint {
  lat: number
  lng: number
}

function ClusterAndHeatLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom())
    map.on('zoomend', onZoom)
    return () => { map.off('zoomend', onZoom) }
  }, [map])

  // Fit bounds on mount
  useEffect(() => {
    if (points.length === 0) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Cluster layer (low zoom)
  useEffect(() => {
    if (zoom >= HEATMAP_ZOOM_THRESHOLD || points.length === 0) return

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('leaflet.markercluster')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 60,
      iconCreateFunction: (c: { getChildCount: () => number }) => {
        const count = c.getChildCount()
        const size = count < 10 ? 36 : count < 50 ? 44 : 54
        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;
            background:oklch(0.27 0.09 145);
            border:3px solid oklch(0.37 0.10 145);
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            color:#fff;font-weight:700;font-size:${size < 44 ? 12 : 14}px;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
      },
    })

    points.forEach((p) => {
      L.marker([p.lat, p.lng]).addTo(cluster)
    })

    map.addLayer(cluster)
    return () => { map.removeLayer(cluster) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, zoom >= HEATMAP_ZOOM_THRESHOLD, points])

  // Heat layer (high zoom)
  useEffect(() => {
    if (zoom < HEATMAP_ZOOM_THRESHOLD || points.length === 0) return

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('leaflet.heat')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heat = (L as any).heatLayer(
      points.map((p) => [p.lat, p.lng, 1]),
      {
        radius: 30,
        blur: 25,
        maxZoom: 16,
        gradient: { 0.2: '#154212', 0.5: '#2D5A27', 0.8: '#fd8b00', 1.0: '#e63946' },
      }
    )
    map.addLayer(heat)
    return () => { map.removeLayer(heat) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, zoom >= HEATMAP_ZOOM_THRESHOLD, points])

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
        <ClusterAndHeatLayer points={points} />
        <ZoomDisplay />
      </MapContainer>
      <div className="px-4 py-2 bg-surface-container text-xs text-muted-foreground flex items-center gap-2">
        <span>Kreise = Cluster (niedriger Zoom) · Heatmap ab Zoomstufe {HEATMAP_ZOOM_THRESHOLD}</span>
      </div>
    </div>
  )
}
