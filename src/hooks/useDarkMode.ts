import { useEffect } from 'react'
import { useTravelMapStore } from '@/store/travelMapStore'

export function useDarkMode() {
  const darkMode = useTravelMapStore((s) => s.preferences.darkMode)
  const setDarkMode = useTravelMapStore((s) => s.setDarkMode)

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('travel-map-storage-v1')
      if (!stored) setDarkMode(e.matches)
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [setDarkMode])

  return { darkMode, setDarkMode, toggleDarkMode: useTravelMapStore((s) => s.toggleDarkMode) }
}
