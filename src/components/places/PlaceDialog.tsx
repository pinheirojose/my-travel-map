import { useState, useEffect } from 'react'
import type { GeocodedLocation, Place, PlaceCategory, PlaceDraft, PlaceStatus } from '@/types'
import { PLACE_CATEGORIES, PLACE_STATUSES } from '@/types'
import { STATUS_CONFIG } from '@/utils/constants'
import { useTranslation } from '@/hooks/useTranslation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Loader2, MapPin } from 'lucide-react'

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
  const [draft, setDraft] = useState<PlaceDraft | null>(null)

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
      <DialogContent className="sm:max-w-md">
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

        {draft && !isLoading && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('placeDialog.name')}</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={t('placeDialog.namePlaceholder')}
                autoFocus
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

            <div className="grid gap-2">
              <Label htmlFor="country">{t('placeDialog.country')}</Label>
              <Input
                id="country"
                value={draft.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>

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
            <p className="text-[11px] text-muted-foreground -mt-2">
              {t('placeDialog.locationHint')}
            </p>

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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('placeDialog.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!draft?.name.trim() || isLoading}>
            {t('placeDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
