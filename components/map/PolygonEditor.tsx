'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet-draw'
import type { GeoJSON } from 'geojson'

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
  coords.push(coords[0]) // close ring
  return { type: 'Polygon', coordinates: [coords] }
}

function geoJsonToLatLngs(polygon: GeoJSON.Polygon): L.LatLng[] {
  return polygon.coordinates[0]
    .slice(0, -1)
    .map(([lng, lat]) => L.latLng(lat, lng))
}

// Inner component — runs inside MapContainer so useMap() works correctly
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
    // Inject leaflet-draw CSS (paths fixed for Next.js public folder)
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
      const latlngs = poly.getLatLngs()[0] as L.LatLng[]
      onPolygonChange(latLngsToGeoJson(latlngs))
      onHasPolygon(true)
    }

    const onEdited = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Edited
      event.layers.eachLayer((layer) => {
        const poly = layer as L.Polygon
        const latlngs = poly.getLatLngs()[0] as L.LatLng[]
        onPolygonChange(latLngsToGeoJson(latlngs))
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
  const center: [number, number] = initialPolygon
    ? (() => {
        const coords = initialPolygon.coordinates[0]
        const lat = coords.reduce((s, [, la]) => s + la, 0) / coords.length
        const lng = coords.reduce((s, [lg]) => s + lg, 0) / coords.length
        return [lat, lng]
      })()
    : [51.1657, 10.4515]

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={center}
          zoom={initialPolygon ? 13 : 7}
          className="h-96 w-full"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DrawControl
            onPolygonChange={onPolygonChange}
            initialPolygon={initialPolygon}
            onHasPolygon={onHasPolygon ?? (() => {})}
          />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Verwenden Sie das Polygon-Werkzeug oben rechts auf der Karte, um Ihr Revier einzuzeichnen.
      </p>
    </div>
  )
}
