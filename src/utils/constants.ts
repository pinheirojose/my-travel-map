import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  Castle,
  Church,
  Landmark,
  MapPin,
  Mountain,
  MountainSnow,
  Palmtree,
  Plane,
  Route,
  Ship,
  Trees,
  UtensilsCrossed,
  Waves,
  Eye,
} from 'lucide-react'
import type { PlaceCategory, PlaceStatus } from '@/types'

export const STATUS_CONFIG: Record<
  PlaceStatus,
  { label: string; color: string; emoji: string }
> = {
  visited: {
    label: 'Visited',
    color: '#22c55e',
    emoji: '🟢',
  },
  wishlist: {
    label: 'Wishlist',
    color: '#3b82f6',
    emoji: '🔵',
  },
}

export const CATEGORY_CONFIG: Record<
  PlaceCategory,
  { label: string; icon: LucideIcon }
> = {
  city: { label: 'City', icon: Building2 },
  landmark: { label: 'Landmark', icon: Landmark },
  historic_site: { label: 'Historic Site', icon: Castle },
  museum: { label: 'Museum', icon: Church },
  nature: { label: 'Nature', icon: Trees },
  national_park: { label: 'National Park', icon: MountainSnow },
  beach: { label: 'Beach', icon: Palmtree },
  mountain: { label: 'Mountain', icon: Mountain },
  lake: { label: 'Lake', icon: Waves },
  island: { label: 'Island', icon: Ship },
  restaurant: { label: 'Restaurant', icon: UtensilsCrossed },
  hiking_trail: { label: 'Hiking Trail', icon: Route },
  viewpoint: { label: 'Viewpoint', icon: Eye },
  airport: { label: 'Airport', icon: Plane },
  other: { label: 'Other', icon: MapPin },
}

export const DEFAULT_MAP_VIEWPORT = {
  center: [20, 0] as [number, number],
  zoom: 2,
}

export const STORAGE_KEY = 'travel-map-storage-v1'

export const SUPPORT_MODAL_INTERVAL = 3

export const SUPPORT_LINKS = {
  buyMeACoffee: 'https://buymeacoffee.com',
  kofi: 'https://ko-fi.com',
  githubSponsors: 'https://github.com/sponsors',
  stripe: 'https://stripe.com',
}
