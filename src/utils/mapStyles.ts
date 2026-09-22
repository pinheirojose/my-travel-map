import type { MapStyleDefinition } from '@/types'

export const MAP_STYLES: MapStyleDefinition[] = [
  {
    id: 'classic_atlas',
    name: 'Classic Atlas',
    emoji: '🌍',
    description: 'Soft colors inspired by printed atlases.',
    tileUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: '&copy; Esri &copy; OpenStreetMap contributors',
    exportBackground: '#f5f0e8',
    exportTextColor: '#2c2416',
    exportAccentColor: '#8b6914',
    exportSecondaryColor: '#6b5d4d',
    exportLegendBg: 'rgba(255, 252, 245, 0.95)',
    exportTitleFont: '"Cormorant Garamond", "Palatino Linotype", Palatino, serif',
    exportBodyFont: '"Inter", sans-serif',
    markerVisitedColor: '#22c55e',
    markerWishlistColor: '#3b82f6',
    decorative: true,
  },
  {
    id: 'minimal_bw',
    name: 'Minimal Black & White',
    emoji: '🖤',
    description: 'Elegant monochrome style designed for framing.',
    tileUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: '&copy; Esri',
    exportBackground: '#ffffff',
    exportTextColor: '#111111',
    exportAccentColor: '#333333',
    exportSecondaryColor: '#666666',
    exportLegendBg: 'rgba(255, 255, 255, 0.95)',
    exportTitleFont: '"Cormorant Garamond", "Palatino Linotype", Palatino, serif',
    exportBodyFont: '"Inter", sans-serif',
    markerVisitedColor: '#111111',
    markerWishlistColor: '#666666',
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    emoji: '🌑',
    description: 'Dark background with vibrant markers.',
    tileUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: '&copy; Esri',
    exportBackground: '#0f1419',
    exportTextColor: '#f0f0f0',
    exportAccentColor: '#60a5fa',
    exportSecondaryColor: '#94a3b8',
    exportLegendBg: 'rgba(15, 20, 25, 0.92)',
    exportTitleFont: '"Outfit", "Helvetica Neue", sans-serif',
    exportBodyFont: '"Inter", sans-serif',
    markerVisitedColor: '#4ade80',
    markerWishlistColor: '#60a5fa',
  },
  {
    id: 'vintage_poster',
    name: 'Vintage Travel Poster',
    emoji: '✈️',
    description: 'Retro travel-poster inspired colors and typography.',
    tileUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: '&copy; Esri',
    exportBackground: '#1a3a4a',
    exportTextColor: '#f5e6c8',
    exportAccentColor: '#e8a838',
    exportSecondaryColor: '#c4a882',
    exportLegendBg: 'rgba(26, 58, 74, 0.92)',
    exportTitleFont: '"Cormorant Garamond", "Palatino Linotype", Palatino, serif',
    exportBodyFont: '"Inter", sans-serif',
    markerVisitedColor: '#f59e0b',
    markerWishlistColor: '#38bdf8',
    decorative: true,
  },
  {
    id: 'vintage_map',
    name: 'Vintage Map',
    emoji: '🗺️',
    description: 'Antique cartography with warm parchment tones and classic detailing.',
    // Esri NatGeo tiles use z/y/x ordering.
    tileUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: '&copy; Esri &amp; National Geographic',
    exportBackground: '#efe2c9',
    exportTextColor: '#3b2a1a',
    exportAccentColor: '#8b5a2b',
    exportSecondaryColor: '#6b5344',
    exportLegendBg: 'rgba(250, 241, 222, 0.95)',
    exportTitleFont: '"Cormorant Garamond", "Palatino Linotype", Palatino, serif',
    exportBodyFont: '"Inter", sans-serif',
    markerVisitedColor: '#8b3a2a',
    markerWishlistColor: '#2f5d50',
    decorative: true,
  },
  {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    emoji: '📍',
    description: 'Ultra-clean style with subtle borders and modern aesthetics.',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '&copy; OpenStreetMap contributors',
    exportBackground: '#f8fafc',
    exportTextColor: '#0f172a',
    exportAccentColor: '#0ea5e9',
    exportSecondaryColor: '#64748b',
    exportLegendBg: 'rgba(248, 250, 252, 0.95)',
    exportTitleFont: '"Outfit", "Helvetica Neue", sans-serif',
    exportBodyFont: '"Inter", sans-serif',
    markerVisitedColor: '#10b981',
    markerWishlistColor: '#0ea5e9',
  },
]

export function getMapStyle(id: string): MapStyleDefinition {
  return MAP_STYLES.find((s) => s.id === id) ?? MAP_STYLES[0]
}

export function isMapStyleId(id: unknown): id is MapStyleDefinition['id'] {
  return MAP_STYLES.some((s) => s.id === id)
}
