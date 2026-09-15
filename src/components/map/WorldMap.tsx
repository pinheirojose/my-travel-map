import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { PlaceMarkerComponent } from './PlaceMarkerComponent'
import { CountryFillLayer, FitBoundsOnDemand } from './CountryFillLayer'
import { createClusterIcon } from './PlaceMarker'
import { useTravelMapStore } from '@/store/travelMapStore'
import { getMapStyle } from '@/utils/mapStyles'
import { clusterPlaces } from '@/utils/clusterPlaces'
import { mapVisiblePlaces } from '@/services/places'
import type { Place } from '@/types'

interface WorldMapProps {
  onMapClick: (lat: number, lng: number) => void
  onEditPlace: (place: Place) => void
  onDeletePlace: (id: string) => void
  onPlaceMoved: (place: Place, lat: number, lng: number) => void
  addMode: boolean
  flyToTarget?: { lat: number; lng: number; zoom?: number } | null
  onFlyToComplete?: () => void
  fitRequestId?: number
}

function MapEventHandler({
  onMapClick,
  addMode,
  onZoom,
}: {
  onMapClick: (lat: number, lng: number) => void
  addMode: boolean
  onZoom: (zoom: number) => void
}) {
  const setMapViewport = useTravelMapStore((s) => s.setMapViewport)

  const map = useMapEvents({
    click(e) {
      if (addMode) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
    zoomend() {
      onZoom(map.getZoom())
    },
    moveend(e) {
      const target = e.target
      const center = target.getCenter()
      setMapViewport({
        center: [center.lat, center.lng],
        zoom: target.getZoom(),
      })
    },
  })

  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])

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
  onPlaceMoved,
  addMode,
  flyToTarget,
  onFlyToComplete,
  fitRequestId = 0,
}: WorldMapProps) {
  const places = useTravelMapStore((s) => s.places)
  const mapViewport = useTravelMapStore((s) => s.mapViewport)
  const selectedPlaceId = useTravelMapStore((s) => s.selectedPlaceId)
  const recentlyAddedIds = useTravelMapStore((s) => s.recentlyAddedIds)
  const showVisited = useTravelMapStore((s) => s.preferences.showVisited)
  const showWishlist = useTravelMapStore((s) => s.preferences.showWishlist)
  const yearFilter = useTravelMapStore((s) => s.preferences.yearFilter)
  const selectedMapStyle = useTravelMapStore(
    (s) => s.preferences.selectedMapStyle,
  )
  const setSelectedPlaceId = useTravelMapStore((s) => s.setSelectedPlaceId)
  const [zoom, setZoom] = useState(mapViewport.zoom)

  const style = getMapStyle(selectedMapStyle)
  const filtered = useMemo(
    () =>
      mapVisiblePlaces(places, {
        showVisited,
        showWishlist,
        yearFilter,
      }),
    [places, showVisited, showWishlist, yearFilter],
  )
  const clustered = useMemo(
    () => clusterPlaces(filtered, zoom),
    [filtered, zoom],
  )

  const handleSelect = useCallback(
    (id: string) => setSelectedPlaceId(id),
    [setSelectedPlaceId],
  )

  const handleZoom = useCallback((next: number) => setZoom(next), [])

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
        key={style.id}
        attribution={style.tileAttribution}
        url={style.tileUrl}
        subdomains={style.tileSubdomains ?? 'abc'}
        maxZoom={19}
      />
      <CountryFillLayer />
      <MapEventHandler
        onMapClick={onMapClick}
        addMode={addMode}
        onZoom={handleZoom}
      />
      <MapController
        flyToTarget={flyToTarget}
        onFlyToComplete={onFlyToComplete}
      />
      <FitBoundsOnDemand requestId={fitRequestId} />
      <CursorStyle addMode={addMode} />

      {clustered.map((item) => {
        if (item.type === 'cluster') {
          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={createClusterIcon(item.count, style.exportAccentColor)}
              eventHandlers={{
                click: (e) => {
                  const map = e.target._map as L.Map
                  map.flyTo(
                    [item.latitude, item.longitude],
                    Math.min(map.getZoom() + 2, 12),
                    { duration: 0.6 },
                  )
                },
              }}
            />
          )
        }
        const place = item.place
        return (
          <PlaceMarkerComponent
            key={place.id}
            place={place}
            isSelected={selectedPlaceId === place.id}
            isNew={recentlyAddedIds.includes(place.id)}
            draggable={!addMode}
            onSelect={handleSelect}
            onEdit={onEditPlace}
            onDelete={onDeletePlace}
            onMoved={onPlaceMoved}
          />
        )
      })}
    </MapContainer>
  )
}
