import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/usePlaces'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'

interface BackupBannerProps {
  onExport: () => void
  onDismiss: () => void
}

export function BackupBanner({ onExport, onDismiss }: BackupBannerProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <div
      className={cn(
        'absolute z-[1000] rounded-xl border border-amber-500/40 bg-card shadow-lg p-3 pointer-events-auto',
        isMobile ? 'top-3 left-3 right-3' : 'top-4 right-4 max-w-xs',
      )}
    >
      <div className="flex items-start gap-2">
        <Archive className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium">{t('backup.title')}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {t('backup.message')}
          </p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-9 md:h-7 text-xs" onClick={onExport}>
              {t('backup.exportNow')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 md:h-7 text-xs"
              onClick={onDismiss}
            >
              {t('backup.dismiss')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
