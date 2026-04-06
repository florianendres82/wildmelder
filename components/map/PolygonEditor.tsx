'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import ZoomDisplay from './ZoomDisplay'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet-draw'
import type { GeoJSON } from 'geojson'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation, Search, Loader2 } from 'lucide-react'

// Fix Leaflet icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

function latLngsToGeoJson(latlngs: L.LatLng[]): GeoJSON.Polygon {
  const coords = latlngs.map((ll) => [ll.lng, ll.lat])
  coords.push(coords[0])
  return { type: 'Polygon', coordinates: [coords] }
}

function geoJsonToLatLngs(polygon: GeoJSON.Polygon): L.LatLng[] {
  return polygon.coordinates[0]
    .slice(0, -1)
    .map(([lng, lat]) => L.latLng(lat, lng))
}

// Receives flyTo commands from outside and executes them inside the MapContainer
function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 13, { duration: 1.2 })
  }, [map, target])
  return null
}

// Draws and manages the polygon tool — must run inside MapContainer
function DrawControl({
  onPolygonChange,
  initialPolygon,
  onHasPolygon,
}: {
  onPolygonChange: (polygon: GeoJSON.Polygon | null) => void
  initialPolygon?: GeoJSON.Polygon
  onHasPolygon: (v: boolean) => void
}) {
  const map = useMap()

  useEffect(() => {
    const linkId = 'leaflet-draw-css'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = '/leaflet/leaflet-draw.css'
      document.head.appendChild(link)
    }

    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    if (initialPolygon) {
      const latlngs = geoJsonToLatLngs(initialPolygon)
      const polygon = L.polygon(latlngs, {
        color: '#154212',
        fillColor: '#2D5A27',
        fillOpacity: 0.3,
      })
      drawnItems.addLayer(polygon)
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] })
    }

    const drawControl = new L.Control.Draw({
      position: 'topright',
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#154212',
            fillColor: '#2D5A27',
            fillOpacity: 0.3,
          },
        } as L.DrawOptions.PolygonOptions,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
    })
    map.addControl(drawControl)

    const onCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created
      drawnItems.clearLayers()
      drawnItems.addLayer(event.layer)
      const poly = event.layer as L.Polygon
      onPolygonChange(latLngsToGeoJson(poly.getLatLngs()[0] as L.LatLng[]))
      onHasPolygon(true)
    }
    const onEdited = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Edited
      event.layers.eachLayer((layer) => {
        const poly = layer as L.Polygon
        onPolygonChange(latLngsToGeoJson(poly.getLatLngs()[0] as L.LatLng[]))
      })
    }
    const onDeleted = () => {
      onPolygonChange(null)
      onHasPolygon(false)
    }

    map.on(L.Draw.Event.CREATED, onCreated)
    map.on(L.Draw.Event.EDITED, onEdited)
    map.on(L.Draw.Event.DELETED, onDeleted)

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated)
      map.off(L.Draw.Event.EDITED, onEdited)
      map.off(L.Draw.Event.DELETED, onDeleted)
      map.removeControl(drawControl)
      map.removeLayer(drawnItems)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return null
}

interface PolygonEditorProps {
  onPolygonChange: (polygon: GeoJSON.Polygon | null) => void
  initialPolygon?: GeoJSON.Polygon
  onHasPolygon?: (v: boolean) => void
}

export default function PolygonEditor({ onPolygonChange, initialPolygon, onHasPolygon }: PolygonEditorProps) {
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [navError, setNavError] = useState('')

  const center: [number, number] = initialPolygon
    ? (() => {
        const coords = initialPolygon.coordinates[0]
        const lat = coords.reduce((s, [, la]) => s + la, 0) / coords.length
        const lng = coords.reduce((s, [lg]) => s + lg, 0) / coords.length
        return [lat, lng]
      })()
    : [51.1657, 10.4515]

  function handleGps() {
    setNavError('')
    if (!navigator.geolocation) {
      setNavError('GPS wird von diesem Browser nicht unterstützt.')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTarget([pos.coords.latitude, pos.coords.longitude])
        setGpsLoading(false)
      },
      () => {
        setNavError('GPS-Standort konnte nicht ermittelt werden.')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setNavError('')
    setSearchLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=de,at,ch`,
        { headers: { 'Accept-Language': 'de' } }
      )
      const results = await res.json()
      if (results.length > 0) {
        setFlyTarget([parseFloat(results[0].lat), parseFloat(results[0].lon)])
      } else {
        setNavError('Ort nicht gefunden.')
      }
    } catch {
      setNavError('Suche fehlgeschlagen.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Navigation controls */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGps}
          disabled={gpsLoading}
          className="shrink-0"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-1.5" />
          )}
          Mein Standort
        </Button>
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            type="text"
            placeholder="Gemeinde oder Ort suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-9"
          />
          <Button type="submit" variant="outline" size="sm" disabled={searchLoading} className="shrink-0">
            {searchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {navError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{navError}</p>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={center}
          zoom={initialPolygon ? 13 : 7}
          className="h-[600px] w-full"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo target={flyTarget} />
          <DrawControl
            onPolygonChange={onPolygonChange}
            initialPolygon={initialPolygon}
            onHasPolygon={onHasPolygon ?? (() => {})}
          />
          <ZoomDisplay />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Navigieren Sie zum Revier, dann Polygon-Werkzeug oben rechts nutzen.
      </p>
    </div>
  )
}
