'use client'

import { useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import ZoomDisplay from './ZoomDisplay'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Search, Loader2, Map, Satellite } from 'lucide-react'

// Fix Leaflet default icons (used elsewhere)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

const pinIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" fill="none">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10.293 14.25 24.48 15.156 25.406a1.18 1.18 0 0 0 1.688 0C17.75 40.48 32 26.293 32 16 32 7.163 24.837 0 16 0Z" fill="#fd8b00"/>
    <circle cx="16" cy="16" r="7" fill="white"/>
  </svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
})

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({
  onLocationChange,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  )
  const [address, setAddress] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [satellite, setSatellite] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  const defaultCenter: [number, number] = position ?? [51.1657, 10.4515] // Germany center

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
        { headers: { 'Accept-Language': 'de' } }
      )
      const data = await res.json()
      return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }

  const updatePosition = useCallback(
    async (lat: number, lng: number) => {
      setPosition([lat, lng])
      const addr = await reverseGeocode(lat, lng)
      setAddress(addr)
      onLocationChange(lat, lng, addr)
      mapRef.current?.setView([lat, lng], 15)
    },
    [onLocationChange]
  )

  function handleGps() {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError('GPS wird von diesem Browser nicht unterstützt.')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updatePosition(pos.coords.latitude, pos.coords.longitude)
        setGpsLoading(false)
      },
      () => {
        setGpsError('GPS-Standort konnte nicht ermittelt werden. Bitte auf der Karte markieren.')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=de,at,ch`,
        { headers: { 'Accept-Language': 'de' } }
      )
      const results = await res.json()
      if (results.length > 0) {
        const { lat, lon } = results[0]
        await updatePosition(parseFloat(lat), parseFloat(lon))
      }
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* GPS Button */}
      <Button
        type="button"
        onClick={handleGps}
        disabled={gpsLoading}
        className="w-full h-14 text-base font-semibold"
      >
        {gpsLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Navigation className="w-5 h-5 mr-2" />
        )}
        {gpsLoading ? 'Standort wird ermittelt…' : 'GPS-Standort automatisch ermitteln'}
      </Button>

      {gpsError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {gpsError}
        </p>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Gemeinde, Straße oder Ort suchen…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={searchLoading} className="shrink-0">
          {searchLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Map */}
      <div
        className="rounded-xl overflow-hidden border border-border relative aspect-[3/2] w-full"
        style={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--pin-cursor' as any]: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'%3E%3Cpath d='M14 0C6.268 0 0 6.268 0 14c0 8.96 12.469 21.07 13.258 21.88a1.03 1.03 0 0 0 1.484 0C15.531 35.07 28 22.96 28 14 28 6.268 21.732 0 14 0Z' fill='%23fd8b00'/%3E%3Ccircle cx='14' cy='14' r='6' fill='white'/%3E%3Ccircle cx='14' cy='14' r='3' fill='%23fd8b00'/%3E%3C/svg%3E") 14 36, crosshair`,
        }}
      >
        <style>{`.leaflet-container { cursor: var(--pin-cursor) !important; }`}</style>
        <MapContainer
          center={defaultCenter}
          zoom={position ? 15 : 6}
          className="h-full w-full"
          style={{ zIndex: 0 }}
          ref={mapRef}
        >
          {satellite ? (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          <MapClickHandler onMapClick={updatePosition} />
          {position && <Marker position={position} icon={pinIcon} />}
          <ZoomDisplay />
        </MapContainer>
        {/* Layer toggle — absolute over the map */}
        <button
          type="button"
          onClick={() => setSatellite((s) => !s)}
          className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-lg px-2.5 py-1.5 shadow border border-border hover:bg-white transition-colors"
        >
          {satellite ? (
            <><Map className="w-3.5 h-3.5" /> Karte</>
          ) : (
            <><Satellite className="w-3.5 h-3.5" /> Satellit</>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Auf die Karte tippen, um den Standort manuell zu setzen
      </p>

      {/* Address display */}
      {address && (
        <div className="bg-primary/10 rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground mb-0.5">Gewählter Standort</p>
          <p className="text-sm text-foreground font-medium">{address}</p>
        </div>
      )}
    </div>
  )
}
