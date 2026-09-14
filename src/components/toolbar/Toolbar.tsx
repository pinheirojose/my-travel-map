import {
  CircleHelp,
  Download,
  EllipsisVertical,
  FileJson,
  List,
  MapPinPlus,
  Moon,
  RotateCcw,
  Sun,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  onHelp: () => void
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
  onHelp,
}: ToolbarProps) {
  const { t } = useTranslation()

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
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
            ariaLabel={t('toolbar.addPlace')}
          >
            <MapPinPlus className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">{t('toolbar.addPlace')}</span>
          </ToolbarButton>

          <div className="hidden sm:block">
            <MapStylePicker variant="toolbar" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            tooltip={t('toolbar.downloadTooltip')}
            onClick={onDownload}
            ariaLabel={t('toolbar.download')}
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">{t('toolbar.download')}</span>
          </ToolbarButton>

          <div className="hidden md:flex items-center gap-1">
            <ToolbarButton
              tooltip={t('toolbar.exportTooltip')}
              description={t('toolbar.exportHelp')}
              onClick={onExportJson}
              ariaLabel={t('toolbar.export')}
            >
              <FileJson className="h-4 w-4" />
              <span className="hidden xl:inline text-xs">{t('toolbar.export')}</span>
            </ToolbarButton>

            <ToolbarButton
              tooltip={t('toolbar.importTooltip')}
              description={t('toolbar.importHelp')}
              onClick={onImportJson}
              ariaLabel={t('toolbar.import')}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden xl:inline text-xs">{t('toolbar.import')}</span>
            </ToolbarButton>
          </div>

          <LanguageSwitcher />

          <ToolbarButton
            tooltip={darkMode ? t('toolbar.lightMode') : t('toolbar.darkMode')}
            onClick={onToggleDarkMode}
            variant="ghost"
            ariaLabel={darkMode ? t('toolbar.lightMode') : t('toolbar.darkMode')}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </ToolbarButton>

          <ToolbarButton
            tooltip={t('toolbar.helpTooltip')}
            onClick={onHelp}
            variant="ghost"
            className="hidden sm:inline-flex"
            ariaLabel={t('toolbar.help')}
          >
            <CircleHelp className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            tooltip={t('toolbar.places')}
            onClick={onToggleSidebar}
            className="md:hidden"
            ariaLabel={t('toolbar.places')}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                aria-label={t('toolbar.more')}
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem className="sm:hidden gap-2" onClick={onHelp}>
                <CircleHelp className="h-4 w-4" />
                {t('toolbar.help')}
              </DropdownMenuItem>
              <DropdownMenuItem className="md:hidden gap-2" onClick={onExportJson}>
                <FileJson className="h-4 w-4" />
                {t('toolbar.export')}
              </DropdownMenuItem>
              <DropdownMenuItem className="md:hidden gap-2" onClick={onImportJson}>
                <Upload className="h-4 w-4" />
                {t('toolbar.import')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem onClick={onReset} className="text-destructive gap-2">
                <RotateCcw className="h-4 w-4" />
                {t('toolbar.reset')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  )
}

function ToolbarButton({
  children,
  tooltip,
  description,
  onClick,
  active,
  variant = 'outline',
  className,
  ariaLabel,
}: {
  children: React.ReactNode
  tooltip: string
  description?: string
  onClick: () => void
  active?: boolean
  variant?: 'outline' | 'ghost'
  className?: string
  ariaLabel?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          onClick={onClick}
          aria-label={ariaLabel ?? tooltip}
          className={cn(
            'h-8 gap-1.5',
            active && 'bg-primary/10 border-primary text-primary',
            className,
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className={description ? 'max-w-[240px]' : undefined}>
        <p className="font-medium">{tooltip}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
