import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface ImportDialogProps {
  open: boolean
  count: number
  onOpenChange: (open: boolean) => void
  onReplace: () => void
  onMerge: () => void
}

export function ImportDialog({
  open,
  count,
  onOpenChange,
  onReplace,
  onMerge,
}: ImportDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('importDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('importDialog.description', { count })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('importDialog.cancel')}
          </Button>
          <Button variant="destructive" onClick={onReplace}>
            {t('importDialog.replace')}
          </Button>
          <Button onClick={onMerge}>{t('importDialog.merge')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
