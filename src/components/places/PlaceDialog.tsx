import { useState, useEffect } from 'react'
import type { GeocodedLocation, Place, PlaceCategory, PlaceDraft, PlaceStatus } from '@/types'
import { PLACE_CATEGORIES, PLACE_STATUSES } from '@/types'
import { STATUS_CONFIG } from '@/utils/constants'
import { useIsMobile } from '@/hooks/usePlaces'
import { useTranslation } from '@/hooks/useTranslation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, Loader2, MapPin } from 'lucide-react'
import { cn } from '@/utils'

interface PlaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: GeocodedLocation | null
  place?: Place | null
  isLoading?: boolean
  onSave: (draft: PlaceDraft) => void
}

const defaultDraft = (location: GeocodedLocation): PlaceDraft => ({
  name: location.name,
  status: 'visited',
  category: 'city',
  country: location.country,
  countryCode: location.countryCode,
  region: location.region,
  city: location.city,
  latitude: location.latitude,
  longitude: location.longitude,
  notes: '',
  visitedDate: null,
})

export function PlaceDialog({
  open,
  onOpenChange,
  location,
  place,
  isLoading,
  onSave,
}: PlaceDialogProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState<PlaceDraft | null>(null)
  const [coordsOpen, setCoordsOpen] = useState(false)

  useEffect(() => {
    if (place) {
      setDraft({
        name: place.name,
        status: place.status,
        category: place.category,
        country: place.country,
        countryCode: place.countryCode,
        region: place.region,
        city: place.city,
        latitude: place.latitude,
        longitude: place.longitude,
        notes: place.notes,
        visitedDate: place.visitedDate,
      })
    } else if (location) {
      setDraft(defaultDraft(location))
    }
    if (open) setCoordsOpen(false)
  }, [location, place, open])

  const handleSave = () => {
    if (!draft?.name.trim()) return
    onSave(draft)
    onOpenChange(false)
  }

  const update = <K extends keyof PlaceDraft>(key: K, value: PlaceDraft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-md',
          isMobile &&
            'top-auto bottom-0 translate-y-0 rounded-b-none max-h-[min(85dvh,100%)] flex flex-col overflow-hidden gap-0 p-0 pb-0 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4',
        )}
      >
        <div className={cn(isMobile ? 'px-6 pt-6 pr-14' : undefined)}>
          <DialogHeader>
            <DialogTitle>
              {place ? t('placeDialog.editTitle') : t('placeDialog.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('placeDialog.lookingUp')}
                </span>
              ) : draft ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {[draft.city, draft.region, draft.country].filter(Boolean).join(', ') ||
                    `${draft.latitude.toFixed(4)}, ${draft.longitude.toFixed(4)}`}
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
        </div>

        {draft && !isLoading && (
          <div
            className={cn(
              'grid gap-4 py-2',
              isMobile && 'flex-1 overflow-y-auto px-6 min-h-0',
            )}
          >
            <div className="grid gap-2">
              <Label htmlFor="name">{t('placeDialog.name')}</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={t('placeDialog.namePlaceholder')}
                autoFocus={!isMobile && !isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>{t('placeDialog.status')}</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => update('status', v as PlaceStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: STATUS_CONFIG[status].color }}
                          />
                          {t(`status.${status}`)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t('placeDialog.category')}</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => update('category', v as PlaceCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`category.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="city">{t('placeDialog.city')}</Label>
                <Input
                  id="city"
                  value={draft.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">{t('placeDialog.region')}</Label>
                <Input
                  id="region"
                  value={draft.region}
                  onChange={(e) => update('region', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="country">{t('placeDialog.country')}</Label>
                <Input
                  id="country"
                  value={draft.country}
                  onChange={(e) => update('country', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="countryCode">{t('placeDialog.countryCode')}</Label>
                <Input
                  id="countryCode"
                  value={draft.countryCode}
                  maxLength={2}
                  onChange={(e) =>
                    update('countryCode', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                  }
                />
              </div>
            </div>

            <Collapsible open={coordsOpen} onOpenChange={setCoordsOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-sm font-medium text-left cursor-pointer py-1"
                >
                  {t('placeDialog.exactLocation')}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      coordsOpen && 'rotate-180',
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="grid gap-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">{t('placeDialog.latitude')}</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0001"
                      value={draft.latitude}
                      onChange={(e) =>
                        update('latitude', Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">{t('placeDialog.longitude')}</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      value={draft.longitude}
                      onChange={(e) =>
                        update('longitude', Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
                {!isMobile && (
                  <p className="text-[11px] text-muted-foreground -mt-1">
                    {t('placeDialog.locationHint')}
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>

            <div className="grid gap-2">
              <Label htmlFor="visitedDate">{t('placeDialog.visitedDate')}</Label>
              <Input
                id="visitedDate"
                type="date"
                value={draft.visitedDate ?? ''}
                onChange={(e) => update('visitedDate', e.target.value || null)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t('placeDialog.notes')}</Label>
              <Textarea
                id="notes"
                value={draft.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder={t('placeDialog.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter
          className={cn(
            isMobile &&
              'sticky bottom-0 bg-card px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border mt-0',
          )}
        >
          <Button variant="outline" className="h-10 md:h-9" onClick={() => onOpenChange(false)}>
            {t('placeDialog.cancel')}
          </Button>
          <Button
            className="h-10 md:h-9"
            onClick={handleSave}
            disabled={!draft?.name.trim() || isLoading}
          >
            {t('placeDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
