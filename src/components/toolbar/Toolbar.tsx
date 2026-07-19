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
                Travel Map
              </h1>
              <p className="text-[10px] text-muted-foreground">Your personal journey</p>
            </div>
          </div>

          <ToolbarButton
            tooltip="Add Place (⌘N)"
            onClick={onAddPlace}
            active={addMode}
          >
            <MapPinPlus className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">Add Place</span>
          </ToolbarButton>

          <MapStylePicker variant="toolbar" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton tooltip="Download Map (⌘E)" onClick={onDownload}>
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline text-xs">Download</span>
          </ToolbarButton>

          <ToolbarButton tooltip="Export JSON" onClick={onExportJson}>
            <FileJson className="h-4 w-4" />
            <span className="hidden xl:inline text-xs">Export</span>
          </ToolbarButton>

          <ToolbarButton tooltip="Import JSON" onClick={onImportJson}>
            <Upload className="h-4 w-4" />
            <span className="hidden xl:inline text-xs">Import</span>
          </ToolbarButton>

          <ToolbarButton tooltip="Reset All" onClick={onReset} variant="ghost">
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            tooltip={`${darkMode ? 'Light' : 'Dark'} Mode (⌘D)`}
            onClick={onToggleDarkMode}
            variant="ghost"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </ToolbarButton>

          <ToolbarButton
            tooltip="Places (⌘B)"
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
