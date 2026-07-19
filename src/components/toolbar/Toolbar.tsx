import {
  Download,
  List,
  MapPinPlus,
  Moon,
  RotateCcw,
  Sun,
  Upload,
  FileJson,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MapStylePicker } from '@/components/map/MapStylePicker'
import { LanguageSwitcher } from '@/components/toolbar/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'

interface ToolbarProps {
  darkMode: boolean
  addMode: boolean
  onAddPlace: () => void
  onReset: () => void
  onDownload: () => void
  onExportJson: () => void
  onImportJson: () => void
  onToggleDarkMode: () => void
  onToggleSidebar: () => void
}

export function Toolbar({
  darkMode,
  addMode,
  onAddPlace,
  onReset,
  onDownload,
  onExportJson,
  onImportJson,
  onToggleDarkMode,
  onToggleSidebar,
}: ToolbarProps) {
  const { t } = useTranslation()

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/80 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPinPlus className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold tracking-tight leading-none">
                {t('app.name')}
              </h1>
              <p className="text-[10px] text-muted-foreground">{t('app.tagline')}</p>
            </div>
          </div>

          <ToolbarButton
            tooltip={t('toolbar.addPlaceTooltip')}
            onClick={onAddPlace}
            active={addMode}
          >
            <MapPinPlus className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">{t('toolbar.addPlace')}</span>
          </ToolbarButton>

          <MapStylePicker variant="toolbar" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            tooltip={t('toolbar.downloadTooltip')}
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">{t('toolbar.download')}</span>
          </ToolbarButton>

          <ToolbarButton
            tooltip={t('toolbar.exportTooltip')}
            onClick={onExportJson}
          >
            <FileJson className="h-4 w-4" />
            <span className="hidden xl:inline text-xs">{t('toolbar.export')}</span>
          </ToolbarButton>

          <ToolbarButton
            tooltip={t('toolbar.importTooltip')}
            onClick={onImportJson}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden xl:inline text-xs">{t('toolbar.import')}</span>
          </ToolbarButton>

          <ToolbarButton
            tooltip={t('toolbar.reset')}
            onClick={onReset}
            variant="ghost"
          >
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>

          <LanguageSwitcher />

          <ToolbarButton
            tooltip={darkMode ? t('toolbar.lightMode') : t('toolbar.darkMode')}
            onClick={onToggleDarkMode}
            variant="ghost"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </ToolbarButton>

          <ToolbarButton
            tooltip={t('toolbar.places')}
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </header>
    </TooltipProvider>
  )
}

function ToolbarButton({
  children,
  tooltip,
  onClick,
  active,
  variant = 'outline',
  className,
}: {
  children: React.ReactNode
  tooltip: string
  onClick: () => void
  active?: boolean
  variant?: 'outline' | 'ghost'
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          onClick={onClick}
          className={cn(
            'h-8 gap-1.5',
            active && 'bg-primary/10 border-primary text-primary',
            className,
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
