import { toPng } from 'html-to-image'
import type { MapStyleDefinition, Place, TravelStats } from '@/types'
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/utils/constants'
import { formatDate } from '@/utils'

const EXPORT_WIDTH = 3840
const EXPORT_HEIGHT = 2160
const TILE_SIZE = 256
const MAX_EXPORT_ZOOM = 8
const MAX_TILES = 256
const TILE_FETCH_CONCURRENCY = 8

interface GeoBounds {
  north: number
  south: number
  east: number
  west: number
}

interface MapArea {
  x: number
  y: number
  width: number
  height: number
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

/** Normalized Web Mercator Y in [0, 1], clipped to valid latitudes. */
function latToMercatorY(lat: number): number {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat))
  const sin = Math.sin((clamped * Math.PI) / 180)
  return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)
}

function lngToMercatorX(lng: number): number {
  return (lng + 180) / 360
}

function mercatorToWorld(lng: number, lat: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom
  return {
    x: lngToMercatorX(lng) * scale,
    y: latToMercatorY(lat) * scale,
  }
}

function createMarkerSvg(color: string, size: number, emoji: string): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.35"/>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="16" fill="${color}" stroke="white" stroke-width="3" filter="url(#s)"/>
      <text x="20" y="26" text-anchor="middle" font-size="14">${emoji}</text>
    </svg>
  `
}

function computeBounds(places: Place[]): GeoBounds {
  if (places.length === 0) {
    return { north: 72, south: -55, east: 180, west: -180 }
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

  // Single point / tight cluster: give enough room to look like a map.
  const latSpan = Math.max(north - south, 2)
  const lngSpan = Math.max(east - west, 2)
  const latPad = Math.max(latSpan * 0.25, 1.5)
  const lngPad = Math.max(lngSpan * 0.25, 1.5)

  return {
    north: Math.min(north + latPad, 85),
    south: Math.max(south - latPad, -85),
    east: Math.min(east + lngPad, 180),
    west: Math.max(west - lngPad, -180),
  }
}

function tileCountForBounds(bounds: GeoBounds, zoom: number): number {
  const nw = mercatorToWorld(bounds.west, bounds.north, zoom)
  const se = mercatorToWorld(bounds.east, bounds.south, zoom)
  const pad = TILE_SIZE
  const minX = Math.max(0, Math.floor((nw.x - pad) / TILE_SIZE))
  const maxX = Math.min(2 ** zoom - 1, Math.floor((se.x + pad) / TILE_SIZE))
  const minY = Math.max(0, Math.floor((nw.y - pad) / TILE_SIZE))
  const maxY = Math.min(2 ** zoom - 1, Math.floor((se.y + pad) / TILE_SIZE))
  return (maxX - minX + 1) * (maxY - minY + 1)
}

/**
 * Fit geographic bounds into the map area using Web Mercator, preserving aspect.
 * Chooses a zoom so tiles render near 1:1 (or mild downscale), avoiding soft upscaling.
 */
function fitBoundsToMap(
  bounds: GeoBounds,
  mapArea: MapArea,
): { zoom: number; originX: number; originY: number; scale: number } {
  const mercW = Math.max(
    lngToMercatorX(bounds.east) - lngToMercatorX(bounds.west),
    1e-6,
  )
  const mercH = Math.max(
    latToMercatorY(bounds.south) - latToMercatorY(bounds.north),
    1e-6,
  )

  // Ideal zoom: logical world pixels ≈ canvas map area (retina @2x covers mild upscale).
  const idealZoom = Math.min(
    Math.log2(mapArea.width / (mercW * TILE_SIZE)),
    Math.log2(mapArea.height / (mercH * TILE_SIZE)),
  )

  let zoom = Math.min(MAX_EXPORT_ZOOM, Math.max(1, Math.round(idealZoom)))
  while (zoom > 1 && tileCountForBounds(bounds, zoom) > MAX_TILES) {
    zoom -= 1
  }

  const nw = mercatorToWorld(bounds.west, bounds.north, zoom)
  const se = mercatorToWorld(bounds.east, bounds.south, zoom)
  const worldW = Math.max(se.x - nw.x, 1)
  const worldH = Math.max(se.y - nw.y, 1)

  // Uniform scale to fit inside map area (contain), then center.
  const scale = Math.min(mapArea.width / worldW, mapArea.height / worldH)
  const drawnW = worldW * scale
  const drawnH = worldH * scale
  const offsetX = mapArea.x + (mapArea.width - drawnW) / 2
  const offsetY = mapArea.y + (mapArea.height - drawnH) / 2

  return {
    zoom,
    originX: offsetX - nw.x * scale,
    originY: offsetY - nw.y * scale,
    scale,
  }
}

function worldToCanvas(
  lng: number,
  lat: number,
  zoom: number,
  originX: number,
  originY: number,
  scale: number,
): { x: number; y: number } {
  const world = mercatorToWorld(lng, lat, zoom)
  return {
    x: originX + world.x * scale,
    y: originY + world.y * scale,
  }
}

async function fetchTileBlobUrl(
  template: string,
  x: number,
  y: number,
  z: number,
): Promise<string | null> {
  const buildUrl = (retina: boolean) =>
    template
      .replace('{s}', ['a', 'b', 'c', 'd'][Math.abs(x + y) % 4])
      .replace('{z}', String(z))
      .replace('{x}', String(x))
      .replace('{y}', String(y))
      .replace('{r}', retina ? '@2x' : '')

  try {
    let response = await fetch(buildUrl(true), { mode: 'cors' })
    if (!response.ok) {
      response = await fetch(buildUrl(false), { mode: 'cors' })
    }
    if (!response.ok) return null
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0

  async function run() {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  )
  return results
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

async function renderMapTiles(
  ctx: CanvasRenderingContext2D,
  style: MapStyleDefinition,
  bounds: GeoBounds,
  mapArea: MapArea,
): Promise<{
  zoom: number
  originX: number
  originY: number
  scale: number
}> {
  const view = fitBoundsToMap(bounds, mapArea)
  const { zoom, originX, originY, scale } = view

  ctx.fillStyle = style.exportBackground
  ctx.fillRect(mapArea.x, mapArea.y, mapArea.width, mapArea.height)

  ctx.save()
  ctx.beginPath()
  ctx.rect(mapArea.x, mapArea.y, mapArea.width, mapArea.height)
  ctx.clip()

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const nw = mercatorToWorld(bounds.west, bounds.north, zoom)
  const se = mercatorToWorld(bounds.east, bounds.south, zoom)

  // Expand slightly so edge tiles cover the padded/centered view.
  const pad = TILE_SIZE
  const minTileX = Math.max(0, Math.floor((nw.x - pad) / TILE_SIZE))
  const maxTileX = Math.min(2 ** zoom - 1, Math.floor((se.x + pad) / TILE_SIZE))
  const minTileY = Math.max(0, Math.floor((nw.y - pad) / TILE_SIZE))
  const maxTileY = Math.min(2 ** zoom - 1, Math.floor((se.y + pad) / TILE_SIZE))

  const tiles: Array<{ x: number; y: number }> = []
  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      tiles.push({ x: tx, y: ty })
    }
  }

  const loaded = await mapPool(tiles, TILE_FETCH_CONCURRENCY, async (tile) => {
    const url = await fetchTileBlobUrl(style.tileUrl, tile.x, tile.y, zoom)
    if (!url) return null
    const img = await loadImage(url)
    URL.revokeObjectURL(url)
    return img ? { tile, img } : null
  })

  for (const item of loaded) {
    if (!item) continue
    const { tile, img } = item
    const drawSize = TILE_SIZE * scale
    const dx = originX + tile.x * TILE_SIZE * scale
    const dy = originY + tile.y * TILE_SIZE * scale
    ctx.drawImage(img, dx, dy, drawSize, drawSize)
  }

  ctx.restore()
  return view
}

async function drawMarker(
  ctx: CanvasRenderingContext2D,
  color: string,
  emoji: string,
  x: number,
  y: number,
  size: number,
): Promise<void> {
  const svg = createMarkerSvg(color, size, emoji)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = await loadImage(url)
  URL.revokeObjectURL(url)
  if (!img) return
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
}

export interface ExportLabels {
  mapTitle: string
  legend: string
  summary: string
  visited: string
  wishlist: string
  totalPlaces: string
  visitedCount: string
  wishlistCount: string
  countriesVisited: string
  continentsVisited: string
  worldVisitedPercent: string
  generated: string
}

const DEFAULT_EXPORT_LABELS: ExportLabels = {
  mapTitle: 'My Travel Map',
  legend: 'Legend',
  summary: 'Summary',
  visited: 'Visited',
  wishlist: 'Wishlist',
  totalPlaces: 'Total Places',
  visitedCount: 'Visited',
  wishlistCount: 'Wishlist',
  countriesVisited: 'Countries Visited',
  continentsVisited: 'Continents Visited',
  worldVisitedPercent: 'World Visited',
  generated: 'Generated',
}

export async function generatePrintableMap(
  places: Place[],
  style: MapStyleDefinition,
  stats: TravelStats,
  labels: ExportLabels = DEFAULT_EXPORT_LABELS,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = EXPORT_WIDTH
  canvas.height = EXPORT_HEIGHT
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = style.exportBackground
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)

  const mapArea: MapArea = {
    x: 80,
    y: 160,
    width: EXPORT_WIDTH - 160,
    height: EXPORT_HEIGHT - 460,
  }

  const bounds = computeBounds(places)
  const view = await renderMapTiles(ctx, style, bounds, mapArea)

  ctx.strokeStyle = style.exportAccentColor
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 2
  ctx.strokeRect(mapArea.x, mapArea.y, mapArea.width, mapArea.height)
  ctx.globalAlpha = 1

  const markerSize = places.length > 80 ? 36 : places.length > 30 ? 44 : 52

  for (const place of places) {
    const statusColor =
      place.status === 'visited'
        ? style.markerVisitedColor
        : style.markerWishlistColor
    const emoji = CATEGORY_EMOJI[place.category] ?? '📌'
    const pos = worldToCanvas(
      place.longitude,
      place.latitude,
      view.zoom,
      view.originX,
      view.originY,
      view.scale,
    )

    if (
      pos.x < mapArea.x - markerSize ||
      pos.x > mapArea.x + mapArea.width + markerSize ||
      pos.y < mapArea.y - markerSize ||
      pos.y > mapArea.y + mapArea.height + markerSize
    ) {
      continue
    }

    await drawMarker(ctx, statusColor, emoji, pos.x, pos.y, markerSize)
  }

  ctx.fillStyle = style.exportTextColor
  ctx.font = `700 72px ${style.exportTitleFont}`
  ctx.textAlign = 'center'
  ctx.fillText(labels.mapTitle, EXPORT_WIDTH / 2, 100)

  const legendY = EXPORT_HEIGHT - 260
  const legendX = 100
  const legendWidth = 360
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
  ctx.fillText(labels.legend, legendX + 24, legendY + 40)

  ctx.font = `400 24px ${style.exportBodyFont}`
  ctx.beginPath()
  ctx.arc(legendX + 36, legendY + 78, 10, 0, Math.PI * 2)
  ctx.fillStyle = style.markerVisitedColor
  ctx.fill()
  ctx.fillStyle = style.exportSecondaryColor
  ctx.fillText(labels.visited, legendX + 56, legendY + 86)

  ctx.beginPath()
  ctx.arc(legendX + 36, legendY + 122, 10, 0, Math.PI * 2)
  ctx.fillStyle = style.markerWishlistColor
  ctx.fill()
  ctx.fillStyle = style.exportSecondaryColor
  ctx.fillText(labels.wishlist, legendX + 56, legendY + 130)

  // Travel coverage stats — three featured cards
  const statsStartX = legendX + legendWidth + 32
  const statsGap = 24
  const statsWidth =
    (EXPORT_WIDTH - statsStartX - 100 - statsGap * 2) / 3
  const statsHeight = legendHeight

  const featuredStats: Array<{ value: string; label: string }> = [
    {
      value: `${stats.worldVisitedPercent}%`,
      label: labels.worldVisitedPercent,
    },
    {
      value: String(stats.countriesVisited),
      label: labels.countriesVisited,
    },
    {
      value: String(stats.continentsVisited),
      label: labels.continentsVisited,
    },
  ]

  featuredStats.forEach((stat, index) => {
    const x = statsStartX + index * (statsWidth + statsGap)

    ctx.fillStyle = style.exportLegendBg
    ctx.beginPath()
    ctx.roundRect(x, legendY, statsWidth, statsHeight, 16)
    ctx.fill()
    ctx.strokeStyle = style.exportAccentColor
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillStyle = style.exportTextColor
    ctx.font = `700 56px ${style.exportTitleFont}`
    ctx.fillText(stat.value, x + statsWidth / 2, legendY + 88)

    ctx.fillStyle = style.exportSecondaryColor
    ctx.font = `500 22px ${style.exportBodyFont}`
    ctx.fillText(stat.label, x + statsWidth / 2, legendY + 132)
  })

  ctx.font = `400 18px ${style.exportBodyFont}`
  ctx.fillStyle = style.exportSecondaryColor
  ctx.textAlign = 'right'
  const dateStr = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
  ctx.fillText(`${labels.generated} ${dateStr}`, EXPORT_WIDTH - 100, EXPORT_HEIGHT - 40)

  if (style.decorative) {
    ctx.strokeStyle = style.exportAccentColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(100, 120)
    ctx.lineTo(EXPORT_WIDTH - 100, 120)
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

export async function captureMapPreview(element: HTMLElement): Promise<string> {
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
