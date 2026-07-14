import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTravelMapStore } from '@/store/travelMapStore'
import { useGroupedPlaces, useTravelStats } from '@/hooks/usePlaces'
import { getUniqueCountries } from '@/services/places'
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/utils/constants'
import { PLACE_CATEGORIES, PLACE_STATUSES } from '@/types'
import { countryCodeToFlag } from '@/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function TravelSidebar({ isOpen, onClose }: SidebarProps) {
  const places = useTravelMapStore((s) => s.places)
  const filters = useTravelMapStore((s) => s.sidebarFilters)
  const selectedPlaceId = useTravelMapStore((s) => s.selectedPlaceId)
  const setSearch = useTravelMapStore((s) => s.setSearch)
  const setStatusFilter = useTravelMapStore((s) => s.setStatusFilter)
  const setCategoryFilter = useTravelMapStore((s) => s.setCategoryFilter)
  const setCountryFilter = useTravelMapStore((s) => s.setCountryFilter)
  const setSort = useTravelMapStore((s) => s.setSort)
  const setSelectedPlaceId = useTravelMapStore((s) => s.setSelectedPlaceId)

  const grouped = useGroupedPlaces()
  const stats = useTravelStats()
  const countries = getUniqueCountries(places)
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(
    () => new Set(grouped.map((g) => g.key)),
  )

  const toggleCountry = (key: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Travel Places</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.status} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {PLACE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.category} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PLACE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_CONFIG[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.country} onValueChange={setCountryFilter}>
            <SelectTrigger className="h-8 text-xs col-span-2">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {countryCodeToFlag(c.code)} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sort} onValueChange={setSort}>
            <SelectTrigger className="h-8 text-xs col-span-2">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recently_added">Recently Added</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="visited_date">Visited Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {grouped.length === 0 ? (
            <EmptyState hasPlaces={places.length > 0} />
          ) : (
            grouped.map((group) => (
              <Collapsible
                key={group.key}
                open={expandedCountries.has(group.key)}
                onOpenChange={() => toggleCountry(group.key)}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  {expandedCountries.has(group.key) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-base">{countryCodeToFlag(group.countryCode)}</span>
                  <span className="font-medium text-sm flex-1 text-left truncate">
                    {group.country}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {group.places.length}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-2 pl-2 border-l border-border space-y-0.5 pb-2">
                    {group.places.map((place) => {
                      const CategoryIcon = CATEGORY_CONFIG[place.category].icon
                      const statusColor = STATUS_CONFIG[place.status].color
                      return (
                        <button
                          key={place.id}
                          onClick={() => {
                            setSelectedPlaceId(place.id)
                            onClose()
                          }}
                          className={cn(
                            'flex items-center gap-2.5 w-full p-2 rounded-lg text-left transition-all cursor-pointer',
                            selectedPlaceId === place.id
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50',
                          )}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: statusColor }}
                          />
                          <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{place.name}</p>
                            {place.city && (
                              <p className="text-xs text-muted-foreground truncate">
                                {place.city}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 space-y-2">
        <Separator className="mb-3" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <Stat label="Total Places" value={stats.totalPlaces} />
          <Stat label="Visited" value={stats.visitedPlaces} />
          <Stat label="Wishlist" value={stats.wishlistPlaces} />
          <Stat label="Countries Visited" value={stats.countriesVisited} />
          <Stat label="Countries Wishlist" value={stats.countriesWishlist} />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[25%] min-w-[280px] max-w-[400px] border-l border-border bg-card h-full">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-card border-l border-border z-50 md:hidden flex flex-col shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

function EmptyState({ hasPlaces }: { hasPlaces: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <MapPin className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">
        {hasPlaces ? 'No matching places' : 'No places yet'}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
        {hasPlaces
          ? 'Try adjusting your filters'
          : 'Click anywhere on the map to add your first destination'}
      </p>
    </div>
  )
}
