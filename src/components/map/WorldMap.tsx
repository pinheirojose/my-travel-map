import { useCallback, useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { PlaceMarkerComponent } from './PlaceMarkerComponent'
import { useTravelMapStore } from '@/store/travelMapStore'
import { getMapStyle } from '@/utils/mapStyles'
import type { Place } from '@/types'

interface WorldMapProps {
  onMapClick: (lat: number, lng: number) => void
  onEditPlace: (place: Place) => void
  onDeletePlace: (id: string) => void
  addMode: boolean
  flyToTarget?: { lat: number; lng: number; zoom?: number } | null
  onFlyToComplete?: () => void
}

function MapEventHandler({
  onMapClick,
  addMode,
}: {
  onMapClick: (lat: number, lng: number) => void
  addMode: boolean
}) {
  const setMapViewport = useTravelMapStore((s) => s.setMapViewport)

  useMapEvents({
    click(e) {
      if (addMode) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
    moveend(e) {
      const map = e.target
      const center = map.getCenter()
      setMapViewport({
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      })
    },
  })

  return null
}

function MapController({
  flyToTarget,
  onFlyToComplete,
}: {
  flyToTarget?: { lat: number; lng: number; zoom?: number } | null
  onFlyToComplete?: () => void
}) {
  const map = useMap()
  const selectedPlaceId = useTravelMapStore((s) => s.selectedPlaceId)
  const places = useTravelMapStore((s) => s.places)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }
    if (!selectedPlaceId) return
    const place = places.find((p) => p.id === selectedPlaceId)
    if (place) {
      map.flyTo([place.latitude, place.longitude], Math.max(map.getZoom(), 6), {
        duration: 1,
      })
    }
  }, [selectedPlaceId, places, map])

  const lastFlyKey = useRef<string | null>(null)

  useEffect(() => {
    if (!flyToTarget) {
      lastFlyKey.current = null
      return
    }
    const key = `${flyToTarget.lat},${flyToTarget.lng},${flyToTarget.zoom ?? 12}`
    if (lastFlyKey.current === key) return
    lastFlyKey.current = key
    map.flyTo(
      [flyToTarget.lat, flyToTarget.lng],
      flyToTarget.zoom ?? 12,
      { duration: 1 },
    )
    onFlyToComplete?.()
  }, [flyToTarget, map, onFlyToComplete])

  return null
}

function CursorStyle({ addMode }: { addMode: boolean }) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    if (addMode) {
      container.style.cursor = 'crosshair'
    } else {
      container.style.cursor = ''
    }
    return () => {
      container.style.cursor = ''
    }
  }, [addMode, map])

  return null
}

export function WorldMap({
  onMapClick,
  onEditPlace,
  onDeletePlace,
  addMode,
  flyToTarget,
  onFlyToComplete,
}: WorldMapProps) {
  const places = useTravelMapStore((s) => s.places)
  const mapViewport = useTravelMapStore((s) => s.mapViewport)
  const selectedPlaceId = useTravelMapStore((s) => s.selectedPlaceId)
  const recentlyAddedIds = useTravelMapStore((s) => s.recentlyAddedIds)
  const selectedMapStyle = useTravelMapStore(
    (s) => s.preferences.selectedMapStyle,
  )
  const setSelectedPlaceId = useTravelMapStore((s) => s.setSelectedPlaceId)

  const style = getMapStyle(selectedMapStyle)

  const handleSelect = useCallback(
    (id: string) => setSelectedPlaceId(id),
    [setSelectedPlaceId],
  )

  return (
    <MapContainer
      key="world-map"
      center={mapViewport.center}
      zoom={mapViewport.zoom}
      minZoom={2}
      maxZoom={18}
      worldCopyJump
      zoomControl={false}
      className="absolute inset-0 z-0"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution={style.tileAttribution}
        url={style.tileUrl}
        subdomains="abcd"
        maxZoom={19}
      />
      <MapEventHandler onMapClick={onMapClick} addMode={addMode} />
      <MapController
        flyToTarget={flyToTarget}
        onFlyToComplete={onFlyToComplete}
      />
      <CursorStyle addMode={addMode} />

      {places.map((place) => (
        <PlaceMarkerComponent
          key={place.id}
          place={place}
          isSelected={selectedPlaceId === place.id}
          isNew={recentlyAddedIds.includes(place.id)}
          onSelect={handleSelect}
          onEdit={onEditPlace}
          onDelete={onDeletePlace}
        />
      ))}
    </MapContainer>
  )
}
