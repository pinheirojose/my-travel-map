import type { Place } from '@/types'

export type ClusterItem =
  | { type: 'place'; place: Place }
  | {
      type: 'cluster'
      id: string
      latitude: number
      longitude: number
      count: number
      places: Place[]
    }

export function clusterPlaces(places: Place[], zoom: number): ClusterItem[] {
  if (places.length === 0) return []
  if (zoom >= 9) {
    return places.map((place) => ({ type: 'place', place }))
  }

  const cell = Math.max(360 / 2 ** (zoom + 2), 0.4)
  const buckets = new Map<string, Place[]>()

  for (const place of places) {
    const x = Math.floor((place.longitude + 180) / cell)
    const y = Math.floor((place.latitude + 90) / cell)
    const key = `${x}:${y}`
    const list = buckets.get(key)
    if (list) list.push(place)
    else buckets.set(key, [place])
  }

  const items: ClusterItem[] = []
  for (const [key, group] of buckets) {
    if (group.length === 1) {
      items.push({ type: 'place', place: group[0] })
      continue
    }
    const latitude =
      group.reduce((sum, p) => sum + p.latitude, 0) / group.length
    const longitude =
      group.reduce((sum, p) => sum + p.longitude, 0) / group.length
    items.push({
      type: 'cluster',
      id: `cluster-${key}`,
      latitude,
      longitude,
      count: group.length,
      places: group,
    })
  }
  return items
}

export function placeBounds(
  places: Place[],
): [[number, number], [number, number]] | null {
  if (places.length === 0) return null
  let north = -90
  let south = 90
  let east = -180
  let west = 180
  for (const place of places) {
    north = Math.max(north, place.latitude)
    south = Math.min(south, place.latitude)
    east = Math.max(east, place.longitude)
    west = Math.min(west, place.longitude)
  }
  const latPad = Math.max((north - south) * 0.15, 0.8)
  const lngPad = Math.max((east - west) * 0.15, 0.8)
  return [
    [south - latPad, west - lngPad],
    [north + latPad, east + lngPad],
  ]
}

export function visitedYears(places: Place[]): number[] {
  const years = new Set<number>()
  for (const place of places) {
    if (!place.visitedDate) continue
    const year = Number.parseInt(place.visitedDate.slice(0, 4), 10)
    if (Number.isFinite(year)) years.add(year)
  }
  return Array.from(years).sort((a, b) => a - b)
}
