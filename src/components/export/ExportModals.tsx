import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Heart, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { ExportPrintOptions, MapStyleId } from '@/types'
import { SUPPORT_LINKS, DEFAULT_EXPORT_PRINT_OPTIONS } from '@/utils/constants'
import { MAP_STYLES } from '@/utils/mapStyles'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'

interface SupportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSkip: () => void
  onDontShowAgain: (checked: boolean) => void
}

export function SupportModal({
  open,
  onOpenChange,
  onSkip,
  onDontShowAgain,
}: SupportModalProps) {
  const { t } = useTranslation()
  const [dontShow, setDontShow] = useState(false)

  const handleSkip = () => {
    if (dontShow) onDontShowAgain(true)
    onSkip()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-sky-500/5 pointer-events-none" />

        <DialogHeader className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-950 dark:to-amber-950 flex items-center justify-center mb-2"
          >
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500/20" />
          </motion.div>
          <DialogTitle className="text-center text-xl">
            {t('support.title')}
          </DialogTitle>
          <DialogDescription className="text-center leading-relaxed pt-2">
            {t('support.message1')}
            <br /><br />
            {t('support.message2')}
            <br /><br />
            {t('support.message3')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex flex-col gap-2 pt-2">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white font-medium"
            onClick={() => window.open(SUPPORT_LINKS.stripe, '_blank')}
          >
            {t('support.donate')}
          </Button>
          <Button
            disabled
            className="w-full bg-[#FFDD00]/50 text-black/60 font-medium"
          >
            {t('support.buyMeACoffee')}
            <span className="text-[11px] font-normal opacity-80">
              ({t('support.unavailable')})
            </span>
          </Button>
          <Button
            disabled
            className="w-full bg-emerald-600/40 text-white/70 font-medium"
          >
            {t('support.contribute')}
            <span className="text-[11px] font-normal opacity-80">
              ({t('support.unavailable')})
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleSkip}
          >
            {t('support.skip')}
          </Button>
        </div>

        <div className="relative flex items-center gap-2 pt-1">
          <Checkbox
            id="dont-show"
            checked={dontShow}
            onCheckedChange={(checked) => setDontShow(checked === true)}
          />
          <Label htmlFor="dont-show" className="text-xs text-muted-foreground cursor-pointer">
            {t('support.dontShowAgain')}
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStyle: MapStyleId
  liveStyle: MapStyleId
  onApplyLiveStyle: (styleId: MapStyleId) => void
  onDownload: (
    styleId: MapStyleId,
    options: ExportPrintOptions,
  ) => Promise<void>
  isExporting: boolean
  exportProgress: { done: number; total: number } | null
  previewUrl: string | null
}

export function ExportModal({
  open,
  onOpenChange,
  selectedStyle,
  liveStyle,
  onApplyLiveStyle,
  onDownload,
  isExporting,
  exportProgress,
  previewUrl,
}: ExportModalProps) {
  const { t } = useTranslation()
  const [styleId, setStyleId] = useState<MapStyleId>(selectedStyle)
  const [applyLive, setApplyLive] = useState(false)
  const [options, setOptions] = useState<ExportPrintOptions>(
    DEFAULT_EXPORT_PRINT_OPTIONS,
  )
  const originalLiveRef = useRef(liveStyle)
  const selected = MAP_STYLES.find((s) => s.id === styleId)

  useEffect(() => {
    if (open) {
      setStyleId(selectedStyle)
      setApplyLive(false)
      originalLiveRef.current = liveStyle
    }
  }, [open, selectedStyle])

  const handleStyle = (id: MapStyleId) => {
    setStyleId(id)
    if (applyLive) onApplyLiveStyle(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>{t('export.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
          {MAP_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyle(style.id)}
              className={cn(
                'relative flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left cursor-pointer',
                styleId === style.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/30 hover:bg-accent/50',
              )}
            >
              <span className="text-2xl mb-1">{style.emoji}</span>
              <span className="text-sm font-medium leading-tight">
                {t(`mapStyles.${style.id}.name`)}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                {t(`mapStyles.${style.id}.description`)}
              </span>
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full border border-white/50 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${style.exportBackground}, ${style.exportAccentColor})`,
                }}
              />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t('export.layout')}
            </p>
            <div className="flex gap-1">
              <OptionChip
                active={options.layout === 'landscape'}
                onClick={() => setOptions((o) => ({ ...o, layout: 'landscape' }))}
              >
                {t('export.landscape')}
              </OptionChip>
              <OptionChip
                active={options.layout === 'portrait'}
                onClick={() => setOptions((o) => ({ ...o, layout: 'portrait' }))}
              >
                {t('export.portrait')}
              </OptionChip>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t('export.crop')}
            </p>
            <div className="flex gap-1">
              <OptionChip
                active={options.crop === 'fit'}
                onClick={() => setOptions((o) => ({ ...o, crop: 'fit' }))}
              >
                {t('export.cropFit')}
              </OptionChip>
              <OptionChip
                active={options.crop === 'world'}
                onClick={() => setOptions((o) => ({ ...o, crop: 'world' }))}
              >
                {t('export.cropWorld')}
              </OptionChip>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={options.showTitle}
              onCheckedChange={(checked) =>
                setOptions((o) => ({ ...o, showTitle: checked === true }))
              }
            />
            {t('export.showTitle')}
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={options.showStats}
              onCheckedChange={(checked) =>
                setOptions((o) => ({ ...o, showStats: checked === true }))
              }
            />
            {t('export.showStats')}
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={applyLive}
              onCheckedChange={(checked) => {
                const next = checked === true
                setApplyLive(next)
                if (next) onApplyLiveStyle(styleId)
                else onApplyLiveStyle(originalLiveRef.current)
              }}
            />
            {t('export.applyToLiveMap')}
          </label>
        </div>

        <div
          className="rounded-xl border border-border overflow-hidden min-h-[120px] flex items-center justify-center"
          style={{
            background: selected?.exportBackground,
            color: selected?.exportTextColor,
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={t('export.previewLabel')}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="p-6 text-center">
              <p
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: selected?.exportTitleFont }}
              >
                {t('export.mapTitle')}
              </p>
              <p className="text-sm opacity-70">{t('export.liveMapNote')}</p>
            </div>
          )}
        </div>

        {isExporting && exportProgress && exportProgress.total > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {t('export.progress', {
              done: exportProgress.done,
              total: exportProgress.total,
            })}
          </p>
        )}

        <Button
          className="w-full"
          onClick={() => onDownload(styleId, options)}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('export.generating')}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {t('export.downloadPng')}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function OptionChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 px-2.5 rounded-md text-xs border cursor-pointer',
        active
          ? 'border-primary bg-primary/10'
          : 'border-border hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}
