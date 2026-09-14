import L from 'leaflet'
import type { Place } from '@/types'
import { STATUS_CONFIG } from '@/utils/constants'

const CATEGORY_EMOJI: Record<string, string> = {
  city: '🏙',
  landmark: '📍',
  historic_site: '🏛',
  museum: '🏛',
  nature: '🌿',
  national_park: '🏞',
  beach: '🏖',
  mountain: '⛰',
  lake: '🌊',
  island: '🏝',
  restaurant: '🍽',
  hiking_trail: '🥾',
  viewpoint: '👁',
  airport: '✈',
  other: '📌',
}

function createIconSvg(
  place: Place,
  animate: boolean,
  visitedColor: string,
  wishlistColor: string,
): string {
  const statusColor =
    place.status === 'visited' ? visitedColor : wishlistColor
  const emoji = CATEGORY_EMOJI[place.category] ?? '📌'

  return `
    <div class="${animate ? 'marker-animate' : ''}" style="position:relative;width:36px;height:36px;">
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:${statusColor};
        border:2.5px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;line-height:1;
      ">
        ${emoji}
      </div>
    </div>
  `
}

export function createPlaceIcon(
  place: Place,
  animate = false,
  colors?: { visited: string; wishlist: string },
): L.DivIcon {
  const visitedColor = colors?.visited ?? STATUS_CONFIG.visited.color
  const wishlistColor = colors?.wishlist ?? STATUS_CONFIG.wishlist.color

  return L.divIcon({
    className: 'custom-marker',
    html: createIconSvg(place, animate, visitedColor, wishlistColor),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

export function createClusterIcon(count: number, color: string): L.DivIcon {
  const size = count > 50 ? 48 : count > 12 ? 42 : 36
  return L.divIcon({
    className: 'custom-cluster',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-center;
      color:white;font-size:13px;font-weight:600;font-family:Inter,sans-serif;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function getStatusLabel(status: Place['status']): string {
  return STATUS_CONFIG[status].label
}
