import { useEffect, useCallback } from 'react'
import { useTravelMapStore } from '@/store/travelMapStore'

interface KeyboardShortcutsOptions {
  onAddPlace: () => void
  onExport: () => void
  onToggleSidebar: () => void
  onToggleDarkMode: () => void
}

export function useKeyboardShortcuts({
  onAddPlace,
  onExport,
  onToggleSidebar,
  onToggleDarkMode,
}: KeyboardShortcutsOptions) {
  const undoDelete = useTravelMapStore((s) => s.undoDelete)
  const deletedPlaceBackup = useTravelMapStore((s) => s.deletedPlaceBackup)

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
      } else if (mod && e.key === 'z' && deletedPlaceBackup) {
        e.preventDefault()
        undoDelete()
      } else if (e.key === 'Escape') {
        useTravelMapStore.getState().setSelectedPlaceId(null)
      }
    },
    [
      onAddPlace,
      onExport,
      onToggleSidebar,
      onToggleDarkMode,
      undoDelete,
      deletedPlaceBackup,
    ],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
