import type { Place, PlaceStatus, TravelStats } from '@/types'

export function computeStats(places: Place[]): TravelStats {
  const visited = places.filter((p) => p.status === 'visited')
  const wishlist = places.filter((p) => p.status === 'wishlist')

  const visitedCountries = new Set(
    visited.filter((p) => p.countryCode).map((p) => p.countryCode),
  )
  const wishlistCountries = new Set(
    wishlist.filter((p) => p.countryCode).map((p) => p.countryCode),
  )

  return {
    totalPlaces: places.length,
    visitedPlaces: visited.length,
    wishlistPlaces: wishlist.length,
    countriesVisited: visitedCountries.size,
    countriesWishlist: wishlistCountries.size,
  }
}

export function groupPlacesByCountry(
  places: Place[],
): Map<string, { country: string; countryCode: string; places: Place[] }> {
  const groups = new Map<
    string,
    { country: string; countryCode: string; places: Place[] }
  >()

  for (const place of places) {
    const key = place.countryCode || place.country || 'unknown'
    const existing = groups.get(key)
    if (existing) {
      existing.places.push(place)
    } else {
      groups.set(key, {
        country: place.country || 'Unknown',
        countryCode: place.countryCode,
        places: [place],
      })
    }
  }

  return groups
}

export function filterAndSortPlaces(
  places: Place[],
  filters: {
    search: string
    status: PlaceStatus | 'all'
    category: string
    country: string
    sort: string
  },
): Place[] {
  let result = [...places]

  if (filters.search) {
    const query = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.country.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query) ||
        p.notes.toLowerCase().includes(query),
    )
  }

  if (filters.status !== 'all') {
    result = result.filter((p) => p.status === filters.status)
  }

  if (filters.category !== 'all') {
    result = result.filter((p) => p.category === filters.category)
  }

  if (filters.country !== 'all') {
    result = result.filter(
      (p) => (p.countryCode || p.country) === filters.country,
    )
  }

  switch (filters.sort) {
    case 'alphabetical':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'visited_date':
      result.sort((a, b) => {
        if (!a.visitedDate && !b.visitedDate) return 0
        if (!a.visitedDate) return 1
        if (!b.visitedDate) return -1
        return new Date(b.visitedDate).getTime() - new Date(a.visitedDate).getTime()
      })
      break
    case 'recently_added':
    default:
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }

  return result
}

export function getUniqueCountries(places: Place[]): Array<{
  code: string
  name: string
}> {
  const map = new Map<string, string>()
  for (const place of places) {
    const code = place.countryCode || place.country
    if (code && !map.has(code)) {
      map.set(code, place.country || code)
    }
  }
  return Array.from(map.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
