import { Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface BackupBannerProps {
  onExport: () => void
  onDismiss: () => void
}

export function BackupBanner({ onExport, onDismiss }: BackupBannerProps) {
  const { t } = useTranslation()

  return (
    <div className="absolute top-4 right-4 z-[1000] max-w-xs rounded-xl border border-amber-500/40 bg-card shadow-lg p-3">
      <div className="flex items-start gap-2">
        <Archive className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">{t('backup.title')}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {t('backup.message')}
          </p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-7 text-xs" onClick={onExport}>
              {t('backup.exportNow')}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDismiss}>
              {t('backup.dismiss')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
