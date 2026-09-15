const GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson'

export interface CountryFeatureProperties {
  ISO_A2?: string
  iso_a2?: string
  ISO_A2_EH?: string
  WB_A2?: string
  ADM0_A3?: string
  NAME?: string
  ADMIN?: string
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

const NAME_TO_ISO: Record<string, string> = {
  FRANCE: 'FR',
  NORWAY: 'NO',
  KOSOVO: 'XK',
  'N. CYPRUS': 'CY',
  'NORTHERN CYPRUS': 'CY',
  SOMLILAND: 'SO',
  SOMALILAND: 'SO',
}

let cache: CountryCollection | null = null
let inflight: Promise<CountryCollection | null> | null = null

function validIso2(value: string | undefined): string {
  const raw = (value ?? '').toUpperCase().trim()
  if (!raw || raw === '-99' || raw === 'XX' || raw.length !== 2) return ''
  if (!/^[A-Z]{2}$/.test(raw)) return ''
  return raw
}

export function countryIso2(
  properties: CountryFeatureProperties | null | undefined,
): string {
  if (!properties) return ''
  return (
    validIso2(properties.ISO_A2) ||
    validIso2(properties.iso_a2) ||
    validIso2(properties.ISO_A2_EH) ||
    validIso2(properties.WB_A2) ||
    NAME_TO_ISO[(properties.NAME ?? '').toUpperCase()] ||
    NAME_TO_ISO[(properties.ADMIN ?? '').toUpperCase()] ||
    ''
  )
}

export async function loadWorldCountries(): Promise<CountryCollection | null> {
  if (cache) return cache
  if (inflight) return inflight

  inflight = fetch(GEOJSON_URL)
    .then(async (response) => {
      if (!response.ok) return null
      const data = (await response.json()) as CountryCollection
      if (!data?.features?.length) return null
      cache = data
      return data
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })

  return inflight
}
