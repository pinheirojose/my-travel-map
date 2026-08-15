export const PLACE_STATUSES = ['visited', 'wishlist'] as const
export type PlaceStatus = (typeof PLACE_STATUSES)[number]

export const PLACE_CATEGORIES = [
  'city',
  'landmark',
  'historic_site',
  'museum',
  'nature',
  'national_park',
  'beach',
  'mountain',
  'lake',
  'island',
  'restaurant',
  'hiking_trail',
  'viewpoint',
  'airport',
  'other',
] as const

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number]

export interface Place {
  id: string
  name: string
  status: PlaceStatus
  category: PlaceCategory
  country: string
  countryCode: string
  region: string
  city: string
  latitude: number
  longitude: number
  notes: string
  visitedDate: string | null
  createdAt: string
}

export interface PlaceDraft {
  name: string
  status: PlaceStatus
  category: PlaceCategory
  country: string
  countryCode: string
  region: string
  city: string
  latitude: number
  longitude: number
  notes: string
  visitedDate: string | null
}

export interface GeocodedLocation {
  name: string
  city: string
  region: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
}

export interface MapViewport {
  center: [number, number]
  zoom: number
}

export type SortOption = 'alphabetical' | 'recently_added' | 'visited_date'

export type MapStyleId =
  | 'classic_atlas'
  | 'minimal_bw'
  | 'watercolor'
  | 'dark_mode'
  | 'vintage_poster'
  | 'vintage_map'
  | 'modern_minimal'

export interface MapStyleDefinition {
  id: MapStyleId
  name: string
  emoji: string
  description: string
  tileUrl: string
  tileAttribution: string
  exportBackground: string
  exportTextColor: string
  exportAccentColor: string
  exportSecondaryColor: string
  exportLegendBg: string
  exportTitleFont: string
  exportBodyFont: string
  markerVisitedColor: string
  markerWishlistColor: string
  decorative?: boolean
}

export interface TravelStats {
  totalPlaces: number
  visitedPlaces: number
  wishlistPlaces: number
  countriesVisited: number
  countriesWishlist: number
  continentsVisited: number
  worldVisitedPercent: number
}

export interface SupportLinks {
  buyMeACoffee?: string
  kofi?: string
  githubSponsors?: string
  stripe?: string
}

export type AppLocale = 'en' | 'pt-PT'

export interface AppPreferences {
  darkMode: boolean
  hideSupportModal: boolean
  downloadCount: number
  selectedMapStyle: MapStyleId
  sidebarOpen: boolean
  locale: AppLocale
}

export interface TravelMapState {
  places: Place[]
  mapViewport: MapViewport
  preferences: AppPreferences
  selectedPlaceId: string | null
  sidebarFilters: SidebarFilters
  recentlyAddedIds: string[]
  deletedPlaceBackup: Place | null
}

export interface SidebarFilters {
  search: string
  status: PlaceStatus | 'all'
  category: PlaceCategory | 'all'
  country: string | 'all'
  sort: SortOption
}

export interface TravelMapExport {
  version: 1
  exportedAt: string
  places: Place[]
  mapViewport: MapViewport
  preferences: Omit<AppPreferences, 'sidebarOpen'>
}
