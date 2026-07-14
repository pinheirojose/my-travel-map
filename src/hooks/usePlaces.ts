import { useMemo } from 'react'
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
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}
