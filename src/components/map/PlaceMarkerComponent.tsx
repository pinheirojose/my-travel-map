import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import type { Place } from '@/types'
import { useTravelMapStore } from '@/store/travelMapStore'
import { createPlaceIcon } from './PlaceMarker'
import { PlacePopup } from './PlacePopup'

interface PlaceMarkerProps {
  place: Place
  isSelected: boolean
  isNew: boolean
  onSelect: (id: string) => void
  onEdit: (place: Place) => void
  onDelete: (id: string) => void
}

export function PlaceMarkerComponent({
  place,
  isSelected,
  isNew,
  onSelect,
  onEdit,
  onDelete,
}: PlaceMarkerProps) {
  const markerRef = useRef<L.Marker>(null)
  const clearRecentlyAdded = useTravelMapStore((s) => s.clearRecentlyAdded)

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [isSelected])

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => clearRecentlyAdded(place.id), 600)
      return () => clearTimeout(timer)
    }
  }, [isNew, place.id, clearRecentlyAdded])

  return (
    <Marker
      ref={markerRef}
      position={[place.latitude, place.longitude]}
      icon={createPlaceIcon(place, isNew)}
      eventHandlers={{
        click: () => onSelect(place.id),
      }}
    >
      <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
        <div className="text-xs">
          <p className="font-semibold">{place.name}</p>
          {place.country && <p className="text-muted-foreground">{place.country}</p>}
          <p className="text-muted-foreground capitalize">
            {place.category.replace(/_/g, ' ')} · {place.status}
          </p>
        </div>
      </Tooltip>
      <Popup minWidth={240} maxWidth={320}>
        <PlacePopup
          place={place}
          onEdit={() => onEdit(place)}
          onDelete={() => onDelete(place.id)}
        />
      </Popup>
    </Marker>
  )
}
