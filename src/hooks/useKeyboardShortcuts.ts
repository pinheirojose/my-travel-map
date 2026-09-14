import { useEffect, useCallback } from 'react'
import { useTravelMapStore } from '@/store/travelMapStore'

interface KeyboardShortcutsOptions {
  onAddPlace: () => void
  onAddPlaceEscape?: () => void
  onExport: () => void
  onToggleSidebar: () => void
  onToggleDarkMode: () => void
  onHelp?: () => void
}

export function useKeyboardShortcuts({
  onAddPlace,
  onAddPlaceEscape,
  onExport,
  onToggleSidebar,
  onToggleDarkMode,
  onHelp,
}: KeyboardShortcutsOptions) {
  const undo = useTravelMapStore((s) => s.undo)
  const historyLength = useTravelMapStore((s) => s.history.length)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (isInput) return

      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'n') {
        e.preventDefault()
        onAddPlace()
      } else if (mod && e.key === 'e') {
        e.preventDefault()
        onExport()
      } else if (mod && e.key === 'b') {
        e.preventDefault()
        onToggleSidebar()
      } else if (mod && e.key === 'd') {
        e.preventDefault()
        onToggleDarkMode()
      } else if (mod && (e.key === '/' || e.key === '?')) {
        e.preventDefault()
        onHelp?.()
      } else if (mod && e.key === 'z' && historyLength > 0) {
        e.preventDefault()
        undo()
      } else if (e.key === 'Escape') {
        useTravelMapStore.getState().setSelectedPlaceId(null)
        onAddPlaceEscape?.()
      }
    },
    [
      onAddPlace,
      onAddPlaceEscape,
      onExport,
      onToggleSidebar,
      onToggleDarkMode,
      onHelp,
      undo,
      historyLength,
    ],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
