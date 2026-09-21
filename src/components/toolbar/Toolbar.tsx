import {
  CircleHelp,
  Download,
  EllipsisVertical,
  FileJson,
  Languages,
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
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MapStylePicker } from '@/components/map/MapStylePicker'
import { LanguageSwitcher } from '@/components/toolbar/LanguageSwitcher'
import { useTravelMapStore } from '@/store/travelMapStore'
import { useTranslation } from '@/hooks/useTranslation'
import { LOCALES, type Locale } from '@/i18n'
import type { MapStyleId } from '@/types'
import { MAP_STYLES } from '@/utils/mapStyles'
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
  const { t, locale, setLocale } = useTranslation()
  const selectedMapStyle = useTravelMapStore((s) => s.preferences.selectedMapStyle)
  const setSelectedMapStyle = useTravelMapStore((s) => s.setSelectedMapStyle)

  return (
    <TooltipProvider delayDuration={300}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0 z-10 pl-safe pr-safe">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 mr-1 md:mr-2">
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

          <div className="hidden md:block">
            <MapStylePicker variant="toolbar" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            tooltip={t('toolbar.downloadTooltip')}
            onClick={onDownload}
            ariaLabel={t('toolbar.download')}
            className="hidden md:inline-flex"
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

          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          <ToolbarButton
            tooltip={darkMode ? t('toolbar.lightMode') : t('toolbar.darkMode')}
            onClick={onToggleDarkMode}
            variant="ghost"
            ariaLabel={darkMode ? t('toolbar.lightMode') : t('toolbar.darkMode')}
            className="hidden md:inline-flex"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </ToolbarButton>

          <ToolbarButton
            tooltip={t('toolbar.helpTooltip')}
            onClick={onHelp}
            variant="ghost"
            className="hidden md:inline-flex"
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
                className="h-10 w-10 md:h-8 md:w-8"
                aria-label={t('toolbar.more')}
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[min(70dvh,24rem)] overflow-y-auto">
              <div className="md:hidden">
                <DropdownMenuItem className="gap-2" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                  {t('toolbar.download')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={onExportJson}>
                  <FileJson className="h-4 w-4" />
                  {t('toolbar.export')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={onImportJson}>
                  <Upload className="h-4 w-4" />
                  {t('toolbar.import')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={onToggleDarkMode}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {darkMode ? t('toolbar.lightMode') : t('toolbar.darkMode')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={onHelp}>
                  <CircleHelp className="h-4 w-4" />
                  {t('toolbar.help')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Languages className="h-3.5 w-3.5" />
                  {t('language.label')}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={locale}
                  onValueChange={(value) => setLocale(value as Locale)}
                >
                  {LOCALES.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.id}
                      value={option.id}
                      className="cursor-pointer"
                    >
                      {option.id === 'en'
                        ? t('language.english')
                        : t('language.portuguese')}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  {t('toolbar.mapStyle')}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedMapStyle}
                  onValueChange={(value) => setSelectedMapStyle(value as MapStyleId)}
                >
                  {MAP_STYLES.map((style) => (
                    <DropdownMenuRadioItem
                      key={style.id}
                      value={style.id}
                      className="cursor-pointer"
                    >
                      {t(`mapStyles.${style.id}.name`)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
              </div>
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
            'h-10 md:h-8 gap-1.5',
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
