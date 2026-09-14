import { useEffect, useMemo, useState } from 'react'
import { computeStats, filterAndSortPlaces, groupPlacesByCountry } from '@/services/places'
import { useTravelMapStore } from '@/store/travelMapStore'

export function useFilteredPlaces() {
  const places = useTravelMapStore((s) => s.places)
  const filters = useTravelMapStore((s) => s.sidebarFilters)

  return useMemo(
    () => filterAndSortPlaces(places, filters),
    [places, filters],
  )
}

export function useGroupedPlaces() {
  const filtered = useFilteredPlaces()

  return useMemo(() => {
    const groups = groupPlacesByCountry(filtered)
    return Array.from(groups.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.country.localeCompare(b.country))
  }, [filtered])
}

export function useTravelStats() {
  const places = useTravelMapStore((s) => s.places)
  return useMemo(() => computeStats(places), [places])
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isMobile
}
