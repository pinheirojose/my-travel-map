import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from '@/hooks/useTranslation'

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { t } = useTranslation()

  const shortcuts = [
    { keys: '⌘N', label: t('help.shortcutAdd') },
    { keys: '⌘E', label: t('help.shortcutExport') },
    { keys: '⌘B', label: t('help.shortcutSidebar') },
    { keys: '⌘D', label: t('help.shortcutDark') },
    { keys: '⌘Z', label: t('help.shortcutUndo') },
    { keys: '⌘/', label: t('help.shortcutHelp') },
    { keys: 'Esc', label: t('help.shortcutEsc') },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('help.title')}</DialogTitle>
          <DialogDescription>{t('help.intro')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold mb-1">{t('help.addTitle')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('help.addBody')}</p>
          </section>
          <section>
            <h3 className="font-semibold mb-1">{t('help.exportTitle')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('help.exportBody')}</p>
          </section>
          <section>
            <h3 className="font-semibold mb-1">{t('help.undoTitle')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('help.undoBody')}</p>
          </section>
          <section>
            <h3 className="font-semibold mb-1">{t('help.languageTitle')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('help.languageBody')}</p>
          </section>
          <section>
            <h3 className="font-semibold mb-2">{t('help.shortcutsTitle')}</h3>
            <ul className="space-y-1.5">
              {shortcuts.map((item) => (
                <li key={item.keys} className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <kbd className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                    {item.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
