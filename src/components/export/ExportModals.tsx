import { useState } from 'react'
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
import type { MapStyleId } from '@/types'
import { SUPPORT_LINKS } from '@/utils/constants'
import { MAP_STYLES } from '@/utils/mapStyles'
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
            ❤️ Support Travel Map
          </DialogTitle>
          <DialogDescription className="text-center leading-relaxed pt-2">
            If you enjoy using Travel Map and would like to help keep the project
            free and continuously improving, consider supporting its development.
            <br /><br />
            Your contribution helps fund new features, map improvements and
            long-term maintenance.
            <br /><br />
            Supporting the project is completely optional, but greatly appreciated.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex flex-col gap-2 pt-2">
          <Button
            className="w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-medium"
            onClick={() => window.open(SUPPORT_LINKS.buyMeACoffee, '_blank')}
          >
            ❤️ Buy Me a Coffee
          </Button>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white font-medium"
            onClick={() => window.open(SUPPORT_LINKS.kofi, '_blank')}
          >
            💚 Contribute
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleSkip}
          >
            Skip and Download
          </Button>
        </div>

        <div className="relative flex items-center gap-2 pt-1">
          <Checkbox
            id="dont-show"
            checked={dontShow}
            onCheckedChange={(checked) => setDontShow(checked === true)}
          />
          <Label htmlFor="dont-show" className="text-xs text-muted-foreground cursor-pointer">
            Don't show this again
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStyle: string
  onStyleChange: (styleId: MapStyleId) => void
  onDownload: () => Promise<void>
  isExporting: boolean
}

export function ExportModal({
  open,
  onOpenChange,
  selectedStyle,
  onStyleChange,
  onDownload,
  isExporting,
}: ExportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Download Printable Map</DialogTitle>
          <DialogDescription>
            Choose a visual style for your export. This also updates the live map
            while you browse and mark places.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
          {MAP_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={cn(
                'relative flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left cursor-pointer',
                selectedStyle === style.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/30 hover:bg-accent/50',
              )}
            >
              <span className="text-2xl mb-1">{style.emoji}</span>
              <span className="text-sm font-medium leading-tight">{style.name}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                {style.description}
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

        <div
          className="rounded-xl border border-border p-6 text-center"
          style={{
            background: MAP_STYLES.find((s) => s.id === selectedStyle)?.exportBackground,
            color: MAP_STYLES.find((s) => s.id === selectedStyle)?.exportTextColor,
          }}
        >
          <p
            className="text-2xl font-bold mb-1"
            style={{
              fontFamily: MAP_STYLES.find((s) => s.id === selectedStyle)?.exportTitleFont,
            }}
          >
            My Travel Map
          </p>
          <p className="text-sm opacity-70">Preview of selected style</p>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: MAP_STYLES.find((s) => s.id === selectedStyle)
                    ?.markerVisitedColor,
                }}
              />
              Visited
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: MAP_STYLES.find((s) => s.id === selectedStyle)
                    ?.markerWishlistColor,
                }}
              />
              Wishlist
            </span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={onDownload}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating high-resolution map...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PNG
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
