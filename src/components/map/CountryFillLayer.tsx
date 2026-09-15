import { useEffect, useRef, useState } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import type { PathOptions } from 'leaflet'
import toast from 'react-hot-toast'
import { useTravelMapStore } from '@/store/travelMapStore'
import { getMapStyle } from '@/utils/mapStyles'
import { mapVisiblePlaces } from '@/services/places'
import {
  countryIso2,
  loadWorldCountries,
  type CountryCollection,
  type CountryFeature,
} from '@/services/worldGeo'
import { useTranslation } from '@/hooks/useTranslation'

export function CountryFillLayer() {
  const { t } = useTranslation()
  const show = useTravelMapStore((s) => s.preferences.showCountryFill)
  const places = useTravelMapStore((s) => s.places)
  const showVisited = useTravelMapStore((s) => s.preferences.showVisited)
  const showWishlist = useTravelMapStore((s) => s.preferences.showWishlist)
  const yearFilter = useTravelMapStore((s) => s.preferences.yearFilter)
  const selectedMapStyle = useTravelMapStore((s) => s.preferences.selectedMapStyle)
  const [geo, setGeo] = useState<CountryCollection | null>(null)
  const loadFailedToast = useRef(false)
  const style = getMapStyle(selectedMapStyle)

  useEffect(() => {
    if (!show) return
    let cancelled = false
    void loadWorldCountries().then((data) => {
      if (cancelled) return
      setGeo(data)
      if (!data && !loadFailedToast.current) {
        loadFailedToast.current = true
        toast.error(t('toast.countriesLoadFailed'))
      }
    })
    return () => {
      cancelled = true
    }
  }, [show, t])

  const visible = mapVisiblePlaces(places, {
    showVisited,
    showWishlist,
    yearFilter,
  })

  const visited = new Set(
    visible
      .filter((p) => p.status === 'visited' && p.countryCode)
      .map((p) => p.countryCode.toUpperCase()),
  )
  const wishlist = new Set(
    visible
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
      key={`${selectedMapStyle}-${[...visited].join()}-${[...wishlist].join()}`}
      data={geo as never}
      style={(feature) => pathStyle(feature as CountryFeature | undefined)}
      filter={(feature) => {
        const code = countryIso2((feature as CountryFeature).properties)
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
    const state = useTravelMapStore.getState()
    const visible = mapVisiblePlaces(state.places, {
      showVisited: state.preferences.showVisited,
      showWishlist: state.preferences.showWishlist,
      yearFilter: state.preferences.yearFilter,
    })
    if (visible.length === 0) return
    const latlngs = visible.map((p) => [p.latitude, p.longitude] as [number, number])
    map.fitBounds(latlngs, { padding: [48, 48], maxZoom: 12, animate: true })
  }, [requestId, map])

  return null
}
