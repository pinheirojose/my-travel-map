import { toPng } from 'html-to-image'
import type { MapStyleDefinition, Place, TravelStats } from '@/types'
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/utils/constants'
import { formatDate } from '@/utils'

const EXPORT_WIDTH = 3840
const EXPORT_HEIGHT = 2160

function createMarkerSvg(
  color: string,
  size: number,
  categoryIcon: string,
): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="21" text-anchor="middle" font-size="12" fill="white">${categoryIcon}</text>
    </svg>
  `
}

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

function latLngToPixel(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number },
  width: number,
  height: number,
  padding: number,
): { x: number; y: number } {
  const mapWidth = width - padding * 2
  const mapHeight = height - padding * 2 - 280

  const x =
    padding + ((lng - bounds.west) / (bounds.east - bounds.west)) * mapWidth
  const y =
    padding +
    ((bounds.north - lat) / (bounds.north - bounds.south)) * mapHeight

  return { x, y }
}

function computeBounds(places: Place[]): {
  north: number
  south: number
  east: number
  west: number
} {
  if (places.length === 0) {
    return { north: 70, south: -50, east: 180, west: -180 }
  }

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

  const latPad = Math.max((north - south) * 0.15, 5)
  const lngPad = Math.max((east - west) * 0.15, 5)

  return {
    north: Math.min(north + latPad, 85),
    south: Math.max(south - latPad, -85),
    east: Math.min(east + lngPad, 180),
    west: Math.max(west - lngPad, -180),
  }
}

async function fetchTile(
  url: string,
  x: number,
  y: number,
  z: number,
): Promise<string | null> {
  const tileUrl = url
    .replace('{s}', 'a')
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y))
    .replace('{r}', '')

  try {
    const response = await fetch(tileUrl)
    if (!response.ok) return null
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

function lngToTileX(lng: number, zoom: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
}

function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom),
  )
}

async function renderMapTiles(
  ctx: CanvasRenderingContext2D,
  style: MapStyleDefinition,
  bounds: { north: number; south: number; east: number; west: number },
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<void> {
  const zoom = 3

  const minTileX = lngToTileX(bounds.west, zoom)
  const maxTileX = lngToTileX(bounds.east, zoom)
  const minTileY = latToTileY(bounds.north, zoom)
  const maxTileY = latToTileY(bounds.south, zoom)

  ctx.fillStyle = style.exportBackground
  ctx.fillRect(x, y, width, height)

  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      const tileUrl = await fetchTile(style.tileUrl, tx, ty, zoom)
      if (!tileUrl) continue

      const tileLngWest = (tx / Math.pow(2, zoom)) * 360 - 180
      const tileLngEast = ((tx + 1) / Math.pow(2, zoom)) * 360 - 180
      const tileLatNorth =
        (Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / Math.pow(2, zoom)))) *
          180) /
        Math.PI
      const tileLatSouth =
        (Math.atan(
          Math.sinh(Math.PI * (1 - (2 * (ty + 1)) / Math.pow(2, zoom))),
        ) *
          180) /
        Math.PI

      const px = x + ((tileLngWest - bounds.west) / (bounds.east - bounds.west)) * width
      const pxEnd =
        x + ((tileLngEast - bounds.west) / (bounds.east - bounds.west)) * width
      const py = y + ((bounds.north - tileLatNorth) / (bounds.north - bounds.south)) * height
      const pyEnd =
        y + ((bounds.north - tileLatSouth) / (bounds.north - bounds.south)) * height

      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, px, py, pxEnd - px, pyEnd - py)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = tileUrl
      })
      URL.revokeObjectURL(tileUrl)
    }
  }
}

export async function generatePrintableMap(
  places: Place[],
  style: MapStyleDefinition,
  stats: TravelStats,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = EXPORT_WIDTH
  canvas.height = EXPORT_HEIGHT
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = style.exportBackground
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)

  const mapArea = { x: 60, y: 140, width: EXPORT_WIDTH - 120, height: EXPORT_HEIGHT - 420 }
  const bounds = computeBounds(places)

  await renderMapTiles(
    ctx,
    style,
    bounds,
    mapArea.x,
    mapArea.y,
    mapArea.width,
    mapArea.height,
  )

  for (const place of places) {
    const statusColor =
      place.status === 'visited'
        ? style.markerVisitedColor
        : style.markerWishlistColor
    const emoji = CATEGORY_EMOJI[place.category] ?? '📌'
    const pos = latLngToPixel(
      place.latitude,
      place.longitude,
      bounds,
      EXPORT_WIDTH,
      EXPORT_HEIGHT,
      60,
    )

    const markerSize = 28
    const svg = createMarkerSvg(statusColor, markerSize, emoji)
    const img = new Image()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    await new Promise<void>((resolve) => {
      img.onload = () => {
        ctx.drawImage(
          img,
          pos.x - markerSize / 2,
          pos.y - markerSize / 2,
          markerSize,
          markerSize,
        )
        URL.revokeObjectURL(url)
        resolve()
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve()
      }
      img.src = url
    })
  }

  ctx.fillStyle = style.exportTextColor
  ctx.font = `700 72px ${style.exportTitleFont}`
  ctx.textAlign = 'center'
  ctx.fillText('My Travel Map', EXPORT_WIDTH / 2, 90)

  const legendY = EXPORT_HEIGHT - 260
  const legendX = 100
  const legendWidth = 420
  const legendHeight = 180

  ctx.fillStyle = style.exportLegendBg
  ctx.beginPath()
  ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 16)
  ctx.fill()

  ctx.strokeStyle = style.exportAccentColor
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.font = `600 28px ${style.exportBodyFont}`
  ctx.textAlign = 'left'
  ctx.fillStyle = style.exportTextColor
  ctx.fillText('Legend', legendX + 24, legendY + 40)

  ctx.font = `400 24px ${style.exportBodyFont}`
  ctx.fillStyle = style.exportSecondaryColor

  ctx.beginPath()
  ctx.arc(legendX + 36, legendY + 72, 10, 0, Math.PI * 2)
  ctx.fillStyle = style.markerVisitedColor
  ctx.fill()
  ctx.fillStyle = style.exportSecondaryColor
  ctx.fillText('Visited', legendX + 56, legendY + 80)

  ctx.beginPath()
  ctx.arc(legendX + 36, legendY + 112, 10, 0, Math.PI * 2)
  ctx.fillStyle = style.markerWishlistColor
  ctx.fill()
  ctx.fillStyle = style.exportSecondaryColor
  ctx.fillText('Wishlist', legendX + 56, legendY + 120)

  const summaryX = legendX + legendWidth + 40
  const summaryWidth = 500

  ctx.fillStyle = style.exportLegendBg
  ctx.beginPath()
  ctx.roundRect(summaryX, legendY, summaryWidth, legendHeight, 16)
  ctx.fill()
  ctx.strokeStyle = style.exportAccentColor
  ctx.stroke()

  ctx.font = `600 28px ${style.exportBodyFont}`
  ctx.fillStyle = style.exportTextColor
  ctx.fillText('Summary', summaryX + 24, legendY + 40)

  ctx.font = `400 22px ${style.exportBodyFont}`
  ctx.fillStyle = style.exportSecondaryColor
  const summaryLines = [
    `Total Places: ${stats.totalPlaces}`,
    `Visited: ${stats.visitedPlaces}`,
    `Wishlist: ${stats.wishlistPlaces}`,
    `Countries Visited: ${stats.countriesVisited}`,
  ]
  summaryLines.forEach((line, i) => {
    ctx.fillText(line, summaryX + 24, legendY + 76 + i * 32)
  })

  ctx.font = `400 18px ${style.exportBodyFont}`
  ctx.fillStyle = style.exportSecondaryColor
  ctx.textAlign = 'right'
  const dateStr = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
  ctx.fillText(`Generated ${dateStr}`, EXPORT_WIDTH - 100, EXPORT_HEIGHT - 40)

  if (style.decorative) {
    ctx.strokeStyle = style.exportAccentColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(100, 110)
    ctx.lineTo(EXPORT_WIDTH - 100, 110)
    ctx.stroke()
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to generate image'))
      },
      'image/png',
      1,
    )
  })
}

export async function captureMapPreview(
  element: HTMLElement,
): Promise<string> {
  return toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    cacheBust: true,
  })
}

export function buildExportFilename(): string {
  const date = new Date().toISOString().slice(0, 10)
  return `my-travel-map-${date}.png`
}

export function buildJsonExport(
  places: Place[],
  mapViewport: { center: [number, number]; zoom: number },
  preferences: {
    darkMode: boolean
    hideSupportModal: boolean
    downloadCount: number
    selectedMapStyle: string
  },
) {
  return {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    places,
    mapViewport,
    preferences,
  }
}

export function validateJsonImport(data: unknown): data is {
  places: Place[]
  mapViewport?: { center: [number, number]; zoom: number }
} {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.places)) return false
  return obj.places.every(
    (p) =>
      p &&
      typeof p === 'object' &&
      typeof (p as Place).id === 'string' &&
      typeof (p as Place).name === 'string' &&
      typeof (p as Place).latitude === 'number',
  )
}

export { CATEGORY_CONFIG, STATUS_CONFIG, formatDate }
