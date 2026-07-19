import type { GeocodedLocation } from '@/types'

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state?: string
  region?: string
  country?: string
  country_code?: string
  tourism?: string
  historic?: string
  natural?: string
  amenity?: string
  name?: string
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address?: NominatimAddress
  name?: string
}

function extractCity(address: NominatimAddress): string {
  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    ''
  )
}

function extractRegion(address: NominatimAddress): string {
  return address.state ?? address.region ?? address.county ?? ''
}

function extractName(result: NominatimResult, address: NominatimAddress): string {
  if (result.name) return result.name
  if (address.tourism) return address.tourism
  if (address.historic) return address.historic
  if (address.natural) return address.natural
  if (address.amenity) return address.amenity
  if (address.name) return address.name

  const city = extractCity(address)
  if (city) return city

  const parts = result.display_name.split(',')
  return parts[0]?.trim() ?? 'Unknown Place'
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeocodedLocation> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'json')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('zoom', '18')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to reverse geocode location')
  }

  const result = (await response.json()) as NominatimResult
  const address = result.address ?? {}

  return {
    name: extractName(result, address),
    city: extractCity(address),
    region: extractRegion(address),
    country: address.country ?? '',
    countryCode: (address.country_code ?? '').toUpperCase(),
    latitude,
    longitude,
  }
}

export function createFallbackLocation(
  latitude: number,
  longitude: number,
): GeocodedLocation {
  return {
    name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    city: '',
    region: '',
    country: '',
    countryCode: '',
    latitude,
    longitude,
  }
}

export interface PlaceSearchResult extends GeocodedLocation {
  displayName: string
}

function toGeocodedLocation(result: NominatimResult): PlaceSearchResult {
  const address = result.address ?? {}
  const latitude = Number.parseFloat(result.lat)
  const longitude = Number.parseFloat(result.lon)

  return {
    name: extractName(result, address),
    city: extractCity(address),
    region: extractRegion(address),
    country: address.country ?? '',
    countryCode: (address.country_code ?? '').toUpperCase(),
    latitude,
    longitude,
    displayName: result.display_name,
  }
}

/** Forward-geocode a place name via Nominatim (e.g. "Eiffel Tower, Paris"). */
export async function searchPlaces(
  query: string,
  limit = 6,
): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'json')
  url.searchParams.set('q', trimmed)
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', String(limit))

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to search for places')
  }

  const results = (await response.json()) as NominatimResult[]
  return results
    .map(toGeocodedLocation)
    .filter(
      (r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude),
    )
}
