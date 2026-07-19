import en from './en'
import ptPT from './pt-PT'
import type { Locale, Messages } from './types'
import { LOCALES } from './types'

export { LOCALES }
export type { Locale, Messages }

const catalogs: Record<Locale, Messages> = {
  en,
  'pt-PT': ptPT,
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]

  for (const lang of languages) {
    const normalized = lang.toLowerCase()
    if (normalized === 'pt-pt' || normalized.startsWith('pt-pt')) return 'pt-PT'
    if (normalized === 'pt' || normalized.startsWith('pt-')) return 'pt-PT'
  }
  return 'en'
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs.en
}

/** Resolve nested keys like "toolbar.addPlace" with optional {{var}} interpolation. */
export function translate(
  messages: Messages,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split('.')
  let current: unknown = messages

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return key
    }
  }

  if (typeof current !== 'string') return key

  if (!vars) return current

  return current.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`,
  )
}
