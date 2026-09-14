import { useEffect, useState } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import type { PathOptions } from 'leaflet'
import { useTravelMapStore } from '@/store/travelMapStore'
import { getMapStyle } from '@/utils/mapStyles'
import {
  countryIso2,
  loadWorldCountries,
  type CountryCollection,
  type CountryFeature,
} from '@/services/worldGeo'

export function CountryFillLayer() {
  const show = useTravelMapStore((s) => s.preferences.showCountryFill)
  const places = useTravelMapStore((s) => s.places)
  const selectedMapStyle = useTravelMapStore((s) => s.preferences.selectedMapStyle)
  const [geo, setGeo] = useState<CountryCollection | null>(null)
  const style = getMapStyle(selectedMapStyle)

  useEffect(() => {
    if (!show) return
    void loadWorldCountries().then(setGeo)
  }, [show])

  const visited = new Set(
    places
      .filter((p) => p.status === 'visited' && p.countryCode)
      .map((p) => p.countryCode.toUpperCase()),
  )
  const wishlist = new Set(
    places
      .filter((p) => p.status === 'wishlist' && p.countryCode)
      .map((p) => p.countryCode.toUpperCase()),
  )

  if (!show || !geo) return null

  const pathStyle = (feature?: CountryFeature): PathOptions => {
    const code = countryIso2(feature?.properties)
    if (visited.has(code)) {
      return {
        fillColor: style.markerVisitedColor,
        fillOpacity: 0.28,
        color: style.markerVisitedColor,
        weight: 1,
        opacity: 0.7,
      }
    }
    if (wishlist.has(code)) {
      return {
        fillColor: style.markerWishlistColor,
        fillOpacity: 0.18,
        color: style.markerWishlistColor,
        weight: 1,
        opacity: 0.5,
      }
    }
    return {
      fillOpacity: 0,
      opacity: 0,
      weight: 0,
    }
  }

  return (
    <GeoJSON
      key={`${selectedMapStyle}-${visited.size}-${wishlist.size}-${places.length}`}
      data={geo as never}
      style={(feature) => pathStyle(feature as CountryFeature | undefined)}
      filter={(feature) => {
        const code = countryIso2(
          (feature as CountryFeature).properties,
        )
        return Boolean(code && (visited.has(code) || wishlist.has(code)))
      }}
      interactive={false}
    />
  )
}

export function FitBoundsOnDemand({
  requestId,
}: {
  requestId: number
}) {
  const map = useMap()
  useEffect(() => {
    if (!requestId) return
    const current = useTravelMapStore.getState().places
    if (current.length === 0) return
    const latlngs = current.map((p) => [p.latitude, p.longitude] as [number, number])
    map.fitBounds(latlngs, { padding: [48, 48], maxZoom: 8, animate: true })
  }, [requestId, map])

  return null
}
