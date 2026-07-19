import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, MousePointerClick, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchPlaces, type PlaceSearchResult } from '@/services/geocoding'
import { cn } from '@/utils'

type Step = 'choose' | 'search'

interface AddPlaceChooserProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChooseMapClick: () => void
  onSelectSearchResult: (result: PlaceSearchResult) => void
}

export function AddPlaceChooser({
  open,
  onOpenChange,
  onChooseMapClick,
  onSelectSearchResult,
}: AddPlaceChooserProps) {
  const [step, setStep] = useState<Step>('choose')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const requestId = useRef(0)

  useEffect(() => {
    if (!open) {
      setStep('choose')
      setQuery('')
      setResults([])
      setIsSearching(false)
      setError(null)
      setHasSearched(false)
    }
  }, [open])

  useEffect(() => {
    if (open && step === 'search') {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
      return () => window.clearTimeout(timer)
    }
  }, [open, step])

  const runSearch = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setError(null)
      return
    }

    const id = ++requestId.current
    setIsSearching(true)
    setError(null)

    try {
      const found = await searchPlaces(trimmed)
      if (id !== requestId.current) return
      setResults(found)
      setHasSearched(true)
    } catch {
      if (id !== requestId.current) return
      setResults([])
      setHasSearched(true)
      setError('Could not search right now. Please try again.')
    } finally {
      if (id === requestId.current) setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void runSearch(query)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'choose' ? 'Add a Place' : 'Search for a Place'}
          </DialogTitle>
          <DialogDescription>
            {step === 'choose'
              ? 'How would you like to add your next destination?'
              : 'Try something like “Eiffel Tower, Paris” or “Tokyo, Japan”.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'choose' ? (
          <div className="grid gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                onChooseMapClick()
                onOpenChange(false)
              }}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-border p-4 text-left transition-all',
                'hover:border-primary/40 hover:bg-accent/50 cursor-pointer',
              )}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MousePointerClick className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">Click on map</span>
                <span className="mt-0.5 block text-xs text-muted-foreground leading-relaxed">
                  Point anywhere on the world map to drop a pin and fill in the details.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStep('search')}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-border p-4 text-left transition-all',
                'hover:border-primary/40 hover:bg-accent/50 cursor-pointer',
              )}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">Search</span>
                <span className="mt-0.5 block text-xs text-muted-foreground leading-relaxed">
                  Look up a landmark, city, or address — for example “Eiffel Tower, Paris”.
                </span>
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Eiffel Tower, Paris"
                  className="pl-8"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" disabled={isSearching || !query.trim()}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>

            <div className="min-h-[180px] max-h-[260px] overflow-y-auto rounded-xl border border-border">
              {isSearching && (
                <div className="flex h-[180px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              )}

              {!isSearching && error && (
                <div className="flex h-[180px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  {error}
                </div>
              )}

              {!isSearching && !error && !hasSearched && (
                <div className="flex h-[180px] flex-col items-center justify-center gap-2 px-4 text-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Search for a place to add it to your map
                  </p>
                </div>
              )}

              {!isSearching && !error && hasSearched && results.length === 0 && (
                <div className="flex h-[180px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  No places found. Try a more specific name.
                </div>
              )}

              {!isSearching && results.length > 0 && (
                <ul className="divide-y divide-border">
                  {results.map((result, index) => (
                    <li key={`${result.latitude}-${result.longitude}-${index}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSearchResult(result)
                          onOpenChange(false)
                        }}
                        className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/60 cursor-pointer"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {result.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                            {result.displayName}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('choose')
                setQuery('')
                setResults([])
                setError(null)
                setHasSearched(false)
              }}
            >
              Back to options
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
