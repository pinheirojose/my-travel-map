import { Check, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTravelMapStore } from '@/store/travelMapStore'
import type { MapStyleId } from '@/types'
import { MAP_STYLES, getMapStyle } from '@/utils/mapStyles'
import { cn } from '@/utils'

interface MapStylePickerProps {
  /** Compact toolbar control vs larger map overlay control */
  variant?: 'toolbar' | 'map'
}

export function MapStylePicker({ variant = 'toolbar' }: MapStylePickerProps) {
  const selectedMapStyle = useTravelMapStore(
    (s) => s.preferences.selectedMapStyle,
  )
  const setSelectedMapStyle = useTravelMapStore((s) => s.setSelectedMapStyle)
  const current = getMapStyle(selectedMapStyle)

  const selectStyle = (id: MapStyleId) => {
    setSelectedMapStyle(id)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={variant === 'map' ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 gap-1.5',
                  variant === 'map' &&
                    'shadow-md border border-border/80 bg-card/95 backdrop-blur-sm',
                )}
                aria-label="Map style"
              >
                {variant === 'toolbar' ? (
                  <>
                    <span className="text-sm leading-none" aria-hidden>
                      {current.emoji}
                    </span>
                    <span className="hidden lg:inline text-xs">Map Style</span>
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4" />
                    <span className="text-xs">{current.emoji}</span>
                    <span className="hidden sm:inline text-xs max-w-[9rem] truncate">
                      {current.name}
                    </span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Map style — {current.name}</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="start" className="w-72 p-2">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
            Map style
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <div className="grid gap-1">
            {MAP_STYLES.map((style) => {
              const selected = style.id === selectedMapStyle
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => selectStyle(style.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors cursor-pointer',
                    selected
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-accent/70',
                  )}
                >
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-base shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${style.exportBackground}, ${style.exportAccentColor})`,
                    }}
                    aria-hidden
                  >
                    {style.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">
                        {style.name}
                      </span>
                      {selected && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {style.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
