/**
 * ISO 3166-1 alpha-2 → continent for travel stats.
 * Continents follow the common 7-continent model used by travel apps.
 */
export type ContinentId =
  | 'africa'
  | 'antarctica'
  | 'asia'
  | 'europe'
  | 'north_america'
  | 'oceania'
  | 'south_america'

/** Widely used denominator for “% of the world visited” (UN members + observers). */
export const TOTAL_WORLD_COUNTRIES = 195

export const CONTINENT_IDS: ContinentId[] = [
  'africa',
  'antarctica',
  'asia',
  'europe',
  'north_america',
  'oceania',
  'south_america',
]

const COUNTRY_TO_CONTINENT: Record<string, ContinentId> = {
  // Africa
  DZ: 'africa', AO: 'africa', BJ: 'africa', BW: 'africa', BF: 'africa',
  BI: 'africa', CV: 'africa', CM: 'africa', CF: 'africa', TD: 'africa',
  KM: 'africa', CG: 'africa', CD: 'africa', CI: 'africa', DJ: 'africa',
  EG: 'africa', GQ: 'africa', ER: 'africa', SZ: 'africa', ET: 'africa',
  GA: 'africa', GM: 'africa', GH: 'africa', GN: 'africa', GW: 'africa',
  KE: 'africa', LS: 'africa', LR: 'africa', LY: 'africa', MG: 'africa',
  MW: 'africa', ML: 'africa', MR: 'africa', MU: 'africa', MA: 'africa',
  MZ: 'africa', NA: 'africa', NE: 'africa', NG: 'africa', RW: 'africa',
  ST: 'africa', SN: 'africa', SC: 'africa', SL: 'africa', SO: 'africa',
  ZA: 'africa', SS: 'africa', SD: 'africa', TZ: 'africa', TG: 'africa',
  TN: 'africa', UG: 'africa', ZM: 'africa', ZW: 'africa', EH: 'africa',
  // Asia
  AF: 'asia', AM: 'asia', AZ: 'asia', BH: 'asia', BD: 'asia', BT: 'asia',
  BN: 'asia', KH: 'asia', CN: 'asia', CY: 'asia', GE: 'asia', IN: 'asia',
  ID: 'asia', IR: 'asia', IQ: 'asia', IL: 'asia', JP: 'asia', JO: 'asia',
  KZ: 'asia', KW: 'asia', KG: 'asia', LA: 'asia', LB: 'asia', MY: 'asia',
  MV: 'asia', MN: 'asia', MM: 'asia', NP: 'asia', KP: 'asia', OM: 'asia',
  PK: 'asia', PS: 'asia', PH: 'asia', QA: 'asia', SA: 'asia', SG: 'asia',
  KR: 'asia', LK: 'asia', SY: 'asia', TW: 'asia', TJ: 'asia', TH: 'asia',
  TL: 'asia', TR: 'asia', TM: 'asia', AE: 'asia', UZ: 'asia', VN: 'asia',
  YE: 'asia', HK: 'asia', MO: 'asia',
  // Europe
  AL: 'europe', AD: 'europe', AT: 'europe', BY: 'europe', BE: 'europe',
  BA: 'europe', BG: 'europe', HR: 'europe', CZ: 'europe', DK: 'europe',
  EE: 'europe', FI: 'europe', FR: 'europe', DE: 'europe', GR: 'europe',
  HU: 'europe', IS: 'europe', IE: 'europe', IT: 'europe', XK: 'europe',
  LV: 'europe', LI: 'europe', LT: 'europe', LU: 'europe', MT: 'europe',
  MD: 'europe', MC: 'europe', ME: 'europe', NL: 'europe', MK: 'europe',
  NO: 'europe', PL: 'europe', PT: 'europe', RO: 'europe', RU: 'europe',
  SM: 'europe', RS: 'europe', SK: 'europe', SI: 'europe', ES: 'europe',
  SE: 'europe', CH: 'europe', UA: 'europe', GB: 'europe', VA: 'europe',
  GG: 'europe', JE: 'europe', IM: 'europe', FO: 'europe', AX: 'europe',
  GI: 'europe',
  // North America
  AG: 'north_america', BS: 'north_america', BB: 'north_america',
  BZ: 'north_america', CA: 'north_america', CR: 'north_america',
  CU: 'north_america', DM: 'north_america', DO: 'north_america',
  SV: 'north_america', GD: 'north_america', GT: 'north_america',
  HT: 'north_america', HN: 'north_america', JM: 'north_america',
  MX: 'north_america', NI: 'north_america', PA: 'north_america',
  KN: 'north_america', LC: 'north_america', VC: 'north_america',
  TT: 'north_america', US: 'north_america', PR: 'north_america',
  VI: 'north_america', VG: 'north_america', KY: 'north_america',
  BM: 'north_america', GL: 'north_america', GP: 'north_america',
  MQ: 'north_america', AW: 'north_america', CW: 'north_america',
  SX: 'north_america', TC: 'north_america',
  // South America
  AR: 'south_america', BO: 'south_america', BR: 'south_america',
  CL: 'south_america', CO: 'south_america', EC: 'south_america',
  GY: 'south_america', PY: 'south_america', PE: 'south_america',
  SR: 'south_america', UY: 'south_america', VE: 'south_america',
  FK: 'south_america', GF: 'south_america',
  // Oceania
  AU: 'oceania', FJ: 'oceania', KI: 'oceania', MH: 'oceania',
  FM: 'oceania', NR: 'oceania', NZ: 'oceania', PW: 'oceania',
  PG: 'oceania', WS: 'oceania', SB: 'oceania', TO: 'oceania',
  TV: 'oceania', VU: 'oceania', NC: 'oceania', PF: 'oceania',
  GU: 'oceania', AS: 'oceania', CK: 'oceania', NU: 'oceania',
  // Antarctica
  AQ: 'antarctica',
}

export function getContinentForCountryCode(
  countryCode: string,
): ContinentId | null {
  if (!countryCode) return null
  return COUNTRY_TO_CONTINENT[countryCode.toUpperCase()] ?? null
}

export function computeWorldVisitedPercent(countriesVisited: number): number {
  if (countriesVisited <= 0) return 0
  return Math.min(
    100,
    Math.round((countriesVisited / TOTAL_WORLD_COUNTRIES) * 1000) / 10,
  )
}

export function computeCountriesLeft(countriesVisited: number): number {
  return Math.max(0, TOTAL_WORLD_COUNTRIES - Math.max(0, countriesVisited))
}
