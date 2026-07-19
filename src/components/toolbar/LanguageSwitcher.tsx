import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LOCALES, type Locale } from '@/i18n'
import { useTranslation } from '@/hooks/useTranslation'

export function LanguageSwitcher() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              aria-label={t('language.label')}
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline text-xs uppercase tracking-wide">
                {locale === 'pt-PT' ? 'PT' : 'EN'}
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{t('language.label')}</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('language.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
