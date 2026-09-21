import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useTravelMapStore } from '@/store/travelMapStore'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useIsMobile, useMapVisiblePlaces } from '@/hooks/usePlaces'
import { useTranslation } from '@/hooks/useTranslation'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { TravelSidebar } from '@/components/sidebar/TravelSidebar'
import { PlaceDialog } from '@/components/places/PlaceDialog'
import { AddPlaceChooser } from '@/components/places/AddPlaceChooser'
import { ExportModal, SupportModal } from '@/components/export/ExportModals'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ClientOnly } from '@/components/ClientOnly'
import { MapLayerControls } from '@/components/map/MapLayerControls'
import { EmptyMapCta } from '@/components/map/EmptyMapCta'
import { HelpDialog } from '@/components/help/HelpDialog'
import { BackupBanner } from '@/components/backup/BackupBanner'
import { ImportDialog } from '@/components/import/ImportDialog'
import { reverseGeocode, createFallbackLocation } from '@/services/geocoding'
import {
  generatePrintableMap,
  buildExportFilename,
  buildJsonExport,
  validateJsonImport,
  captureMapPreview,
} from '@/services/export'
import { getMapStyle } from '@/utils/mapStyles'
import { findDuplicatePlace } from '@/utils/duplicates'
import { computeStats } from '@/services/places'
import { downloadBlob, readFileAsText } from '@/utils'
import {
  BACKUP_REMINDER_THRESHOLD,
  STORAGE_QUOTA_EVENT,
  SUPPORT_MODAL_INTERVAL,
} from '@/utils/constants'
import type {
  AppPreferences,
  ExportPrintOptions,
  GeocodedLocation,
  MapStyleId,
  Place,
  PlaceDraft,
} from '@/types'
import type { PlaceSearchResult } from '@/services/geocoding'

const WorldMap = lazy(() =>
  import('@/components/map/WorldMap').then((mod) => ({ default: mod.WorldMap })),
)

export function HomePage() {
  const [addMode, setAddMode] = useState(false)
  const [addChooserOpen, setAddChooserOpen] = useState(false)
  const [placeDialogOpen, setPlaceDialogOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null)
  const [pendingDuplicate, setPendingDuplicate] = useState<PlaceDraft | null>(
    null,
  )
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const [pendingLocation, setPendingLocation] = useState<GeocodedLocation | null>(
    null,
  )
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [flyToTarget, setFlyToTarget] = useState<{
    lat: number
    lng: number
    zoom?: number
  } | null>(null)
  const [fitRequestId, setFitRequestId] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<{
    places: Place[]
    mapViewport?: { center: [number, number]; zoom: number }
    preferences?: Partial<AppPreferences>
  } | null>(null)
  const [welcomeOpen, setWelcomeOpen] = useState(true)
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
  const undo = useTravelMapStore((s) => s.undo)
  const resetAll = useTravelMapStore((s) => s.resetAll)
  const importData = useTravelMapStore((s) => s.importData)
  const setSidebarOpen = useTravelMapStore((s) => s.setSidebarOpen)
  const setSelectedMapStyle = useTravelMapStore((s) => s.setSelectedMapStyle)
  const incrementDownloadCount = useTravelMapStore((s) => s.incrementDownloadCount)
  const setHideSupportModal = useTravelMapStore((s) => s.setHideSupportModal)
  const dismissBackupReminder = useTravelMapStore((s) => s.dismissBackupReminder)
  const markJsonBackup = useTravelMapStore((s) => s.markJsonBackup)

  const { darkMode, toggleDarkMode } = useDarkMode()
  const visiblePlaces = useMapVisiblePlaces()
  const isMobile = useIsMobile()
  const { t, locale } = useTranslation()

  const showBackupBanner =
    places.length >= BACKUP_REMINDER_THRESHOLD &&
    !preferences.hideBackupReminder &&
    places.length > preferences.lastJsonBackupPlaceCount

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const onQuota = () => toast.error(t('toast.storageFull'))
    window.addEventListener(STORAGE_QUOTA_EVENT, onQuota)
    return () => window.removeEventListener(STORAGE_QUOTA_EVENT, onQuota)
  }, [t])

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setPlaceDialogOpen(true)
      setEditingPlace(null)
      setIsGeocoding(true)
      setPendingLocation(null)

      try {
        const location = await reverseGeocode(lat, lng, locale)
        setPendingLocation(location)
      } catch (err) {
        setPendingLocation(createFallbackLocation(lat, lng))
        toast.error(
          err instanceof Error && err.message === 'RATE_LIMIT'
            ? t('toast.geocodeRateLimit')
            : t('toast.geocodeFailed'),
        )
      } finally {
        setIsGeocoding(false)
      }
    },
    [locale, t],
  )

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

  const commitPlace = useCallback(
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
      setPendingDuplicate(null)
    },
    [editingPlace, addPlace, updatePlace, t],
  )

  const handleSavePlace = useCallback(
    (draft: PlaceDraft) => {
      const duplicate = findDuplicatePlace(places, draft, editingPlace?.id)
      if (duplicate) {
        setPendingDuplicate(draft)
        return
      }
      commitPlace(draft)
    },
    [places, editingPlace, commitPlace],
  )

  const handleEditPlace = useCallback((place: Place) => {
    setEditingPlace(place)
    setPendingLocation(null)
    setPlaceDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return
    const deleted = deletePlace(deleteTarget.id)
    setDeleteTarget(null)
    if (deleted) {
      toast.success(
        (toastItem) => (
          <span className="flex items-center gap-2">
            {deleted.name} {t('toast.placeDeleted')}
            <button
              onClick={() => {
                undo()
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
  }, [deleteTarget, deletePlace, undo, t])

  const handlePlaceMoved = useCallback(
    async (place: Place, lat: number, lng: number) => {
      try {
        const location = await reverseGeocode(lat, lng, locale)
        updatePlace(place.id, {
          latitude: lat,
          longitude: lng,
          city: location.city || place.city,
          region: location.region || place.region,
          country: location.country || place.country,
          countryCode: location.countryCode || place.countryCode,
        })
      } catch (err) {
        updatePlace(place.id, { latitude: lat, longitude: lng })
        if (err instanceof Error && err.message === 'RATE_LIMIT') {
          toast.error(t('toast.geocodeRateLimit'))
        }
      }
      toast.success(t('toast.placeUpdated'))
    },
    [locale, updatePlace, t],
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

  useEffect(() => {
    if (!exportModalOpen) {
      setPreviewUrl(null)
      return
    }
    const el = document.querySelector('.leaflet-container') as HTMLElement | null
    if (!el) return
    void captureMapPreview(el)
      .then(setPreviewUrl)
      .catch(() => setPreviewUrl(null))
  }, [exportModalOpen])

  const handleSupportSkip = useCallback(() => {
    setExportModalOpen(true)
  }, [])

  const handleDownload = useCallback(
    async (styleId: MapStyleId, options: ExportPrintOptions) => {
      setIsExporting(true)
      setExportProgress({ done: 0, total: 0 })
      try {
        const style = getMapStyle(styleId)
        const exportPlaces = visiblePlaces.length > 0 ? visiblePlaces : places
        const result = await generatePrintableMap(
          exportPlaces,
          style,
          computeStats(exportPlaces),
          {
            mapTitle: t('export.mapTitle'),
            legend: t('export.legend'),
            summary: t('export.summary'),
            visited: t('export.visited'),
            wishlist: t('export.wishlist'),
            totalPlaces: t('export.totalPlaces'),
            visitedCount: t('export.visitedCount'),
            wishlistCount: t('export.wishlistCount'),
            countriesVisited: t('export.countriesVisited'),
            continentsVisited: t('export.continentsVisited'),
            worldVisitedPercent: t('export.worldVisitedPercent'),
            generated: t('export.generated'),
          },
          options,
          (done, total) => setExportProgress({ done, total }),
        )
        downloadBlob(result.blob, buildExportFilename())
        incrementDownloadCount()
        setExportModalOpen(false)
        toast.success(t('toast.mapDownloaded'))
        if (result.missingTiles > 0) {
          toast.error(t('export.missingTiles', { count: result.missingTiles }))
        }
      } catch {
        toast.error(t('toast.mapGenerateFailed'))
      } finally {
        setIsExporting(false)
        setExportProgress(null)
      }
    },
    [places, visiblePlaces, incrementDownloadCount, t],
  )

  const handleExportJson = useCallback(() => {
    const data = buildJsonExport(places, mapViewport, preferences)
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    downloadBlob(
      blob,
      `travel-map-export-${new Date().toISOString().slice(0, 10)}.json`,
    )
    markJsonBackup()
    toast.success(t('toast.dataExported'))
  }, [places, mapViewport, preferences, markJsonBackup, t])

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
        setPendingImport({
          places: data.places,
          mapViewport: data.mapViewport,
          preferences: data.preferences as Partial<AppPreferences> | undefined,
        })
      } catch {
        toast.error(t('toast.importFailed'))
      }
      e.target.value = ''
    },
    [t],
  )

  const applyImport = useCallback(
    (mode: 'replace' | 'merge') => {
      if (!pendingImport) return
      importData(pendingImport.places, {
        viewport: pendingImport.mapViewport,
        preferences: pendingImport.preferences,
        mode,
      })
      toast.success(
        mode === 'merge'
          ? t('toast.importedMerge', { count: pendingImport.places.length })
          : t('toast.imported', { count: pendingImport.places.length }),
      )
      setPendingImport(null)
    },
    [pendingImport, importData, t],
  )

  useKeyboardShortcuts({
    onAddPlace: openAddChooser,
    onAddPlaceEscape: () => setAddMode(false),
    onExport: initiateDownload,
    onToggleSidebar: () => setSidebarOpen(!preferences.sidebarOpen),
    onToggleDarkMode: toggleDarkMode,
    onHelp: () => setHelpOpen(true),
  })

  return (
    <div className="flex flex-col h-dvh overflow-hidden pt-safe">
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
        onHelp={() => setHelpOpen(true)}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <main className="flex-1 min-h-0 md:w-[75%] relative">
          <ClientOnly>
            <Suspense fallback={null}>
              <WorldMap
                onMapClick={handleMapClick}
                onEditPlace={handleEditPlace}
                onDeletePlace={(id) => {
                  const place = places.find((p) => p.id === id) ?? null
                  setDeleteTarget(place)
                }}
                onPlaceMoved={handlePlaceMoved}
                addMode={addMode}
                flyToTarget={flyToTarget}
                onFlyToComplete={clearFlyToTarget}
                fitRequestId={fitRequestId}
              />
            </Suspense>
          </ClientOnly>

          <div className="absolute bottom-4 left-3 right-3 md:left-4 md:right-auto z-[1000] flex flex-col gap-2 pb-safe">
            <MapLayerControls
              onFitPlaces={() => setFitRequestId((n) => n + 1)}
            />
          </div>

          {welcomeOpen && !addMode && (
            <EmptyMapCta
              onAddPlace={() => {
                setWelcomeOpen(false)
                openAddChooser()
              }}
              onSkip={() => setWelcomeOpen(false)}
            />
          )}

          {showBackupBanner && !addMode && !welcomeOpen && (
            <BackupBanner
              onExport={handleExportJson}
              onDismiss={dismissBackupReminder}
            />
          )}

          {addMode && (
            <motion.div
              initial={{ opacity: 0, y: isMobile ? -8 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                isMobile
                  ? 'absolute top-0 inset-x-0 z-[1000] h-10 flex items-center justify-center gap-3 bg-primary text-primary-foreground px-3 text-sm font-medium shadow-md'
                  : 'absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg'
              }
            >
              {t('addPlace.mapHint')}
              <button
                type="button"
                onClick={() => setAddMode(false)}
                className="underline underline-offset-2 opacity-90 hover:opacity-100 cursor-pointer"
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
        liveStyle={preferences.selectedMapStyle}
        onApplyLiveStyle={setSelectedMapStyle}
        onDownload={handleDownload}
        isExporting={isExporting}
        exportProgress={exportProgress}
        previewUrl={previewUrl}
      />

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />

      <ImportDialog
        open={Boolean(pendingImport)}
        count={pendingImport?.places.length ?? 0}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null)
        }}
        onReplace={() => applyImport('replace')}
        onMerge={() => applyImport('merge')}
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={t('confirm.deleteTitle')}
        description={t('confirm.deleteDescription')}
        confirmLabel={t('confirm.deleteConfirm')}
        destructive
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingDuplicate)}
        onOpenChange={(open) => {
          if (!open) setPendingDuplicate(null)
        }}
        title={t('confirm.duplicateTitle')}
        description={t('confirm.duplicateDescription', {
          name: pendingDuplicate?.name ?? '',
        })}
        confirmLabel={t('confirm.duplicateConfirm')}
        onConfirm={() => {
          if (pendingDuplicate) commitPlace(pendingDuplicate)
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
        containerStyle={{
          bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        }}
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
