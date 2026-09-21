import { motion } from 'framer-motion'
import { MapPinPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/usePlaces'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'

interface EmptyMapCtaProps {
  onAddPlace: () => void
  onSkip: () => void
}

export function EmptyMapCta({ onAddPlace, onSkip }: EmptyMapCtaProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'absolute z-[1000] pointer-events-none',
        isMobile ? 'top-3 left-3 right-3' : 'top-4 left-4 max-w-sm',
      )}
    >
      <div className="pointer-events-auto rounded-2xl border border-border bg-card shadow-lg p-4 text-left">
        <h2 className="text-base font-semibold">{t('onboarding.mapTitle')}</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {isMobile ? t('onboarding.mapHintShort') : t('onboarding.mapHint')}
        </p>
        {!isMobile && (
          <ol className="text-left text-xs text-muted-foreground mt-3 space-y-1 list-decimal list-inside">
            <li>{t('onboarding.step1')}</li>
            <li>{t('onboarding.step2')}</li>
            <li>{t('onboarding.step3')}</li>
          </ol>
        )}
        <div className="flex items-center justify-start gap-2 mt-3 md:mt-4">
          <Button size="sm" className="h-9 md:h-8" onClick={onAddPlace}>
            <MapPinPlus className="h-4 w-4" />
            {t('onboarding.cta')}
          </Button>
          <Button size="sm" variant="ghost" className="h-9 md:h-8" onClick={onSkip}>
            {t('onboarding.skip')}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
