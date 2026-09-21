import { Calendar, MapPin, Pencil, Trash2 } from 'lucide-react'
import type { Place } from '@/types'
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/utils/constants'
import { formatCoordinates, formatDate } from '@/utils'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface PlacePopupProps {
  place: Place
  onEdit: () => void
  onDelete: () => void
  showDragHint?: boolean
}

export function PlacePopup({
  place,
  onEdit,
  onDelete,
  showDragHint = true,
}: PlacePopupProps) {
  const { t } = useTranslation()
  const CategoryIcon = CATEGORY_CONFIG[place.category].icon
  const statusConfig = STATUS_CONFIG[place.status]

  return (
    <div className="p-1 space-y-3 min-w-0">
      <div>
        <h3 className="font-semibold text-base leading-tight">{place.name}</h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <CategoryIcon className="h-3.5 w-3.5" />
          <span>{t(`category.${place.category}`)}</span>
          <span>·</span>
          <span
            className="inline-flex items-center gap-1"
            style={{ color: statusConfig.color }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusConfig.color }}
            />
            {t(`status.${place.status}`)}
          </span>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {place.country && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {[place.city, place.region, place.country].filter(Boolean).join(', ')}
          </p>
        )}
        <p>{formatCoordinates(place.latitude, place.longitude)}</p>
        {place.visitedDate && (
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(place.visitedDate)}
          </p>
        )}
      </div>

      {place.notes && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 leading-relaxed">
          {place.notes}
        </p>
      )}

      <div className="flex gap-1.5 pt-1">
        <Button size="sm" variant="outline" className="flex-1 h-9 md:h-7 text-xs" onClick={onEdit}>
          <Pencil className="h-3 w-3" />
          {t('placePopup.edit')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 md:h-7 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={t('confirm.deleteConfirm')}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {showDragHint && (
        <p className="text-[10px] text-muted-foreground">{t('placePopup.dragHint')}</p>
      )}
    </div>
  )
}
