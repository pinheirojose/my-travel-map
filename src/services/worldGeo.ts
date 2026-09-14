const GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson'

export interface CountryFeatureProperties {
  ISO_A2?: string
  iso_a2?: string
  NAME?: string
}

export interface CountryFeature {
  type: 'Feature'
  properties: CountryFeatureProperties | null
  geometry: unknown
}

export interface CountryCollection {
  type: 'FeatureCollection'
  features: CountryFeature[]
}

let cache: CountryCollection | null = null
let inflight: Promise<CountryCollection | null> | null = null

export function countryIso2(
  properties: CountryFeatureProperties | null | undefined,
): string {
  const raw = (properties?.ISO_A2 || properties?.iso_a2 || '').toUpperCase()
  if (!raw || raw === '-99' || raw === 'XX') return ''
  return raw
}

export async function loadWorldCountries(): Promise<CountryCollection | null> {
  if (cache) return cache
  if (inflight) return inflight

  inflight = fetch(GEOJSON_URL)
    .then(async (response) => {
      if (!response.ok) return null
      const data = (await response.json()) as CountryCollection
      cache = data
      return data
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })

  return inflight
}
