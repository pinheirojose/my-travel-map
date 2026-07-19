import { useCallback, useMemo } from 'react'
import { getMessages, translate } from '@/i18n'
import type { Locale, Messages } from '@/i18n'
import { useTravelMapStore } from '@/store/travelMapStore'

type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string

export function useTranslation() {
  const locale = useTravelMapStore((s) => s.preferences.locale)
  const setLocale = useTravelMapStore((s) => s.setLocale)
  const messages = useMemo(() => getMessages(locale), [locale])

  const t: TranslateFn = useCallback(
    (key, vars) => translate(messages, key, vars),
    [messages],
  )

  return { t, locale, setLocale, messages }
}

export function useMessages(): Messages {
  const locale = useTravelMapStore((s) => s.preferences.locale)
  return useMemo(() => getMessages(locale), [locale])
}

export function useLocale(): Locale {
  return useTravelMapStore((s) => s.preferences.locale)
}
