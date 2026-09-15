import { useEffect } from 'react'
import { useTravelMapStore } from '@/store/travelMapStore'
import { useIsMobile, useMapVisibleStats } from '@/hooks/usePlaces'
import { useTranslation } from '@/hooks/useTranslation'
import { visitedYears } from '@/utils/clusterPlaces'
import { cn } from '@/utils'
import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapLayerControlsProps {
  onFitPlaces: () => void
}

export function MapLayerControls({ onFitPlaces }: MapLayerControlsProps) {
  const { t } = useTranslation()
  const places = useTravelMapStore((s) => s.places)
  const prefs = useTravelMapStore((s) => s.preferences)
  const setMapLayer = useTravelMapStore((s) => s.setMapLayer)
  const stats = useMapVisibleStats()
  const isMobile = useIsMobile()
  const years = visitedYears(places)
  const yearsKey = years.join(',')
  const done = stats.countriesLeft === 0 && stats.countriesVisited > 0
  const yearIndex =
    prefs.yearFilter == null ? years.length : years.indexOf(prefs.yearFilter)

  useEffect(() => {
    if (prefs.yearFilter != null && !years.includes(prefs.yearFilter)) {
      setMapLayer({ yearFilter: null })
    }
  }, [prefs.yearFilter, yearsKey, years, setMapLayer])

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md min-w-[11.5rem]">
        <p className="text-xl font-semibold tabular-nums leading-none tracking-tight">
          {done ? '0' : stats.countriesLeft}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
          {done ? t('mapLayers.countriesLeftDone') : t('mapLayers.countriesLeft')}
        </p>
      </div>
      <div className="flex flex-wrap gap-1 bg-card border border-border rounded-lg p-1 shadow-md">
        <LayerChip
          active={prefs.showVisited}
          color="#22c55e"
          onClick={() => setMapLayer({ showVisited: !prefs.showVisited })}
        >
          {t('mapLayers.visited')}
        </LayerChip>
        <LayerChip
          active={prefs.showWishlist}
          color="#3b82f6"
          onClick={() => setMapLayer({ showWishlist: !prefs.showWishlist })}
        >
          {t('mapLayers.wishlist')}
        </LayerChip>
        <LayerChip
          active={prefs.showCountryFill}
          onClick={() => setMapLayer({ showCountryFill: !prefs.showCountryFill })}
        >
          {t('mapLayers.countries')}
        </LayerChip>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={onFitPlaces}
          aria-label={t('toolbar.fitPlaces')}
          title={t('toolbar.fitPlaces')}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {years.length > 0 && !isMobile && (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md min-w-[200px]">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>{t('mapLayers.year')}</span>
            <span>
              {prefs.yearFilter == null
                ? t('mapLayers.allYears')
                : prefs.yearFilter}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={years.length}
            value={yearIndex < 0 ? years.length : yearIndex}
            onChange={(e) => {
              const index = Number(e.target.value)
              setMapLayer({
                yearFilter: index >= years.length ? null : years[index],
              })
            }}
            className="w-full accent-primary"
            aria-label={t('mapLayers.year')}
          />
        </div>
      )}
    </div>
  )
}

function LayerChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-7 px-2 rounded-md text-xs font-medium cursor-pointer transition-colors',
        active
          ? 'bg-primary/10 text-foreground'
          : 'text-muted-foreground hover:bg-accent',
      )}
    >
      {color && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
          style={{ backgroundColor: color, opacity: active ? 1 : 0.35 }}
        />
      )}
      {children}
    </button>
  )
}
