import { useCallback, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useTravelMapStore } from '@/store/travelMapStore'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useTravelStats } from '@/hooks/usePlaces'
import { useTranslation } from '@/hooks/useTranslation'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { TravelSidebar } from '@/components/sidebar/TravelSidebar'
import { PlaceDialog } from '@/components/places/PlaceDialog'
import { AddPlaceChooser } from '@/components/places/AddPlaceChooser'
import { ExportModal, SupportModal } from '@/components/export/ExportModals'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ClientOnly } from '@/components/ClientOnly'
import { WorldMap } from '@/components/map/WorldMap'
import { MapStylePicker } from '@/components/map/MapStylePicker'
import { reverseGeocode, createFallbackLocation } from '@/services/geocoding'
import {
  generatePrintableMap,
  buildExportFilename,
  buildJsonExport,
  validateJsonImport,
} from '@/services/export'
import { getMapStyle } from '@/utils/mapStyles'
import { downloadBlob, readFileAsText } from '@/utils'
import { SUPPORT_MODAL_INTERVAL } from '@/utils/constants'
import type { GeocodedLocation, Place, PlaceDraft } from '@/types'
import type { PlaceSearchResult } from '@/services/geocoding'

export function HomePage() {
  const [addMode, setAddMode] = useState(false)
  const [addChooserOpen, setAddChooserOpen] = useState(false)
  const [placeDialogOpen, setPlaceDialogOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [pendingLocation, setPendingLocation] = useState<GeocodedLocation | null>(null)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number
    lng: number
    zoom?: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openAddChooser = useCallback(() => {
    if (addMode) {
      setAddMode(false)
      return
    }
    setAddChooserOpen(true)
  }, [addMode])

  const places = useTravelMapStore((s) => s.places)
  const mapViewport = useTravelMapStore((s) => s.mapViewport)
  const preferences = useTravelMapStore((s) => s.preferences)
  const addPlace = useTravelMapStore((s) => s.addPlace)
  const updatePlace = useTravelMapStore((s) => s.updatePlace)
  const deletePlace = useTravelMapStore((s) => s.deletePlace)
  const undoDelete = useTravelMapStore((s) => s.undoDelete)
  const resetAll = useTravelMapStore((s) => s.resetAll)
  const importData = useTravelMapStore((s) => s.importData)
  const setSidebarOpen = useTravelMapStore((s) => s.setSidebarOpen)
  const setSelectedMapStyle = useTravelMapStore((s) => s.setSelectedMapStyle)
  const incrementDownloadCount = useTravelMapStore((s) => s.incrementDownloadCount)
  const setHideSupportModal = useTravelMapStore((s) => s.setHideSupportModal)

  const { darkMode, toggleDarkMode } = useDarkMode()
  const stats = useTravelStats()
  const { t, locale } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPlaceDialogOpen(true)
    setEditingPlace(null)
    setIsGeocoding(true)
    setPendingLocation(null)

    try {
      const location = await reverseGeocode(lat, lng, locale)
      setPendingLocation(location)
    } catch {
      setPendingLocation(createFallbackLocation(lat, lng))
      toast.error(t('toast.geocodeFailed'))
    } finally {
      setIsGeocoding(false)
    }
  }, [locale, t])

  const handleSearchResult = useCallback((result: PlaceSearchResult) => {
    setAddMode(false)
    setEditingPlace(null)
    setPendingLocation(result)
    setPlaceDialogOpen(true)
    setFlyToTarget({
      lat: result.latitude,
      lng: result.longitude,
      zoom: 13,
    })
  }, [])

  const clearFlyToTarget = useCallback(() => {
    setFlyToTarget(null)
  }, [])

  const handleSavePlace = useCallback(
    (draft: PlaceDraft) => {
      if (editingPlace) {
        updatePlace(editingPlace.id, draft)
        toast.success(t('toast.placeUpdated'))
      } else {
        addPlace(draft)
        toast.success(t('toast.placeAdded'))
        setAddMode(false)
      }
      setEditingPlace(null)
      setPendingLocation(null)
    },
    [editingPlace, addPlace, updatePlace, t],
  )

  const handleEditPlace = useCallback((place: Place) => {
    setEditingPlace(place)
    setPendingLocation(null)
    setPlaceDialogOpen(true)
  }, [])

  const handleDeletePlace = useCallback(
    (id: string) => {
      const deleted = deletePlace(id)
      if (deleted) {
        toast.success(
          (toastItem) => (
            <span className="flex items-center gap-2">
              {deleted.name} {t('toast.placeDeleted')}
              <button
                onClick={() => {
                  undoDelete()
                  toast.dismiss(toastItem.id)
                  toast.success(t('toast.placeRestored'))
                }}
                className="underline font-medium cursor-pointer"
              >
                {t('toast.undo')}
              </button>
            </span>
          ),
          { duration: 5000 },
        )
      }
    },
    [deletePlace, undoDelete, t],
  )

  const initiateDownload = useCallback(() => {
    const count = preferences.downloadCount
    const shouldShowSupport =
      !preferences.hideSupportModal &&
      (count + 1) % SUPPORT_MODAL_INTERVAL === 0

    if (shouldShowSupport) {
      setSupportModalOpen(true)
    } else {
      setExportModalOpen(true)
    }
  }, [preferences.downloadCount, preferences.hideSupportModal])

  const handleSupportSkip = useCallback(() => {
    setExportModalOpen(true)
  }, [])

  const handleDownload = useCallback(async () => {
    setIsExporting(true)
    try {
      const style = getMapStyle(preferences.selectedMapStyle)
      const blob = await generatePrintableMap(places, style, stats, {
        mapTitle: t('export.mapTitle'),
        legend: t('export.legend'),
        summary: t('export.summary'),
        visited: t('export.visited'),
        wishlist: t('export.wishlist'),
        totalPlaces: t('export.totalPlaces'),
        visitedCount: t('export.visitedCount'),
        wishlistCount: t('export.wishlistCount'),
        countriesVisited: t('export.countriesVisited'),
        generated: t('export.generated'),
      })
      downloadBlob(blob, buildExportFilename())
      incrementDownloadCount()
      setExportModalOpen(false)
      toast.success(t('toast.mapDownloaded'))
    } catch {
      toast.error(t('toast.mapGenerateFailed'))
    } finally {
      setIsExporting(false)
    }
  }, [places, preferences.selectedMapStyle, stats, incrementDownloadCount, t])

  const handleExportJson = useCallback(() => {
    const data = buildJsonExport(places, mapViewport, {
      darkMode: preferences.darkMode,
      hideSupportModal: preferences.hideSupportModal,
      downloadCount: preferences.downloadCount,
      selectedMapStyle: preferences.selectedMapStyle,
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    downloadBlob(blob, `travel-map-export-${new Date().toISOString().slice(0, 10)}.json`)
    toast.success(t('toast.dataExported'))
  }, [places, mapViewport, preferences, t])

  const handleImportJson = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await readFileAsText(file)
        const data = JSON.parse(text)
        if (!validateJsonImport(data)) {
          toast.error(t('toast.invalidImport'))
          return
        }
        importData(data.places, data.mapViewport)
        toast.success(t('toast.imported', { count: data.places.length }))
      } catch {
        toast.error(t('toast.importFailed'))
      }
      e.target.value = ''
    },
    [importData, t],
  )

  useKeyboardShortcuts({
    onAddPlace: openAddChooser,
    onAddPlaceEscape: () => setAddMode(false),
    onExport: initiateDownload,
    onToggleSidebar: () => setSidebarOpen(!preferences.sidebarOpen),
    onToggleDarkMode: toggleDarkMode,
  })

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Toolbar
        darkMode={darkMode}
        addMode={addMode}
        onAddPlace={openAddChooser}
        onReset={() => setResetDialogOpen(true)}
        onDownload={initiateDownload}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onToggleDarkMode={toggleDarkMode}
        onToggleSidebar={() => setSidebarOpen(!preferences.sidebarOpen)}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <main className="flex-1 min-h-0 md:w-[75%] relative">
          <ClientOnly>
            <WorldMap
              onMapClick={handleMapClick}
              onEditPlace={handleEditPlace}
              onDeletePlace={handleDeletePlace}
              addMode={addMode}
              flyToTarget={flyToTarget}
              onFlyToComplete={clearFlyToTarget}
            />
          </ClientOnly>

          <div className="absolute bottom-4 left-4 z-[1000]">
            <MapStylePicker variant="map" />
          </div>

          {addMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg"
            >
              {t('addPlace.mapHint')}
              <button
                type="button"
                onClick={() => setAddMode(false)}
                className="ml-3 underline underline-offset-2 opacity-90 hover:opacity-100 cursor-pointer"
              >
                {t('addPlace.cancel')}
              </button>
            </motion.div>
          )}
        </main>

        <TravelSidebar
          isOpen={preferences.sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <AddPlaceChooser
        open={addChooserOpen}
        onOpenChange={setAddChooserOpen}
        onChooseMapClick={() => setAddMode(true)}
        onSelectSearchResult={handleSearchResult}
      />

      <PlaceDialog
        open={placeDialogOpen}
        onOpenChange={(open) => {
          setPlaceDialogOpen(open)
          if (!open) {
            setEditingPlace(null)
            setPendingLocation(null)
          }
        }}
        location={pendingLocation}
        place={editingPlace}
        isLoading={isGeocoding}
        onSave={handleSavePlace}
      />

      <SupportModal
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
        onSkip={handleSupportSkip}
        onDontShowAgain={setHideSupportModal}
      />

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        selectedStyle={preferences.selectedMapStyle}
        onStyleChange={setSelectedMapStyle}
        onDownload={handleDownload}
        isExporting={isExporting}
      />

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title={t('confirm.resetTitle')}
        description={t('confirm.resetDescription')}
        confirmLabel={t('confirm.resetConfirm')}
        destructive
        onConfirm={() => {
          resetAll()
          toast.success(t('toast.resetDone'))
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'text-sm',
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
          },
        }}
      />
    </div>
  )
}
