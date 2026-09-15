import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AppLocale,
  AppPreferences,
  HistoryEntry,
  MapStyleId,
  MapViewport,
  Place,
  PlaceDraft,
  PlaceStatus,
  SidebarFilters,
  SortOption,
} from '@/types'
import {
  DEFAULT_MAP_VIEWPORT,
  MAX_UNDO_HISTORY,
  STORAGE_KEY,
  STORAGE_QUOTA_EVENT,
} from '@/utils/constants'
import { detectBrowserLocale } from '@/i18n'
import { generateId } from '@/utils'

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const defaultPreferences: AppPreferences = {
  darkMode: false,
  hideSupportModal: false,
  downloadCount: 0,
  selectedMapStyle: 'classic_atlas',
  sidebarOpen: false,
  locale: detectBrowserLocale(),
  showVisited: true,
  showWishlist: true,
  showCountryFill: true,
  yearFilter: null,
  hideBackupReminder: false,
  lastJsonBackupPlaceCount: 0,
  hasCompletedOnboarding: false,
}

interface TravelMapStore {
  places: Place[]
  mapViewport: MapViewport
  preferences: AppPreferences
  selectedPlaceId: string | null
  sidebarFilters: SidebarFilters
  recentlyAddedIds: string[]
  history: HistoryEntry[]

  addPlace: (draft: PlaceDraft) => Place
  updatePlace: (id: string, draft: Partial<PlaceDraft>) => void
  deletePlace: (id: string) => Place | null
  undo: () => boolean
  resetAll: () => void
  importData: (
    places: Place[],
    options?: {
      viewport?: MapViewport
      preferences?: Partial<AppPreferences>
      mode?: 'replace' | 'merge'
    },
  ) => void

  setMapViewport: (viewport: MapViewport) => void
  setSelectedPlaceId: (id: string | null) => void
  setDarkMode: (dark: boolean) => void
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
  setSelectedMapStyle: (style: MapStyleId) => void
  setLocale: (locale: AppLocale) => void
  incrementDownloadCount: () => number
  setHideSupportModal: (hide: boolean) => void
  setMapLayer: (
    patch: Partial<
      Pick<
        AppPreferences,
        'showVisited' | 'showWishlist' | 'showCountryFill' | 'yearFilter'
      >
    >,
  ) => void
  completeOnboarding: () => void
  dismissBackupReminder: () => void
  markJsonBackup: () => void

  setSearch: (search: string) => void
  setStatusFilter: (status: PlaceStatus | 'all') => void
  setCategoryFilter: (category: SidebarFilters['category']) => void
  setCountryFilter: (country: string) => void
  setSort: (sort: SortOption) => void

  clearRecentlyAdded: (id: string) => void
}

const defaultFilters: SidebarFilters = {
  search: '',
  status: 'all',
  category: 'all',
  country: 'all',
  sort: 'recently_added',
}

function pushHistory(
  history: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [...history, entry].slice(-MAX_UNDO_HISTORY)
}

export const useTravelMapStore = create<TravelMapStore>()(
  persist(
    (set, get) => ({
      places: [],
      mapViewport: DEFAULT_MAP_VIEWPORT,
      preferences: {
        ...defaultPreferences,
        darkMode: systemPrefersDark(),
        locale: detectBrowserLocale(),
      },
      selectedPlaceId: null,
      sidebarFilters: defaultFilters,
      recentlyAddedIds: [],
      history: [],

      addPlace: (draft) => {
        const place: Place = {
          id: generateId(),
          ...draft,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          places: [...state.places, place],
          recentlyAddedIds: [...state.recentlyAddedIds, place.id],
          selectedPlaceId: place.id,
          history: pushHistory(state.history, { kind: 'add', id: place.id }),
          preferences: {
            ...state.preferences,
            hasCompletedOnboarding: true,
          },
        }))
        return place
      },

      updatePlace: (id, draft) => {
        const before = get().places.find((p) => p.id === id)
        if (!before) return
        set((state) => ({
          places: state.places.map((p) =>
            p.id === id ? { ...p, ...draft } : p,
          ),
          history: pushHistory(state.history, { kind: 'update', place: before }),
        }))
      },

      deletePlace: (id) => {
        const place = get().places.find((p) => p.id === id) ?? null
        if (!place) return null
        set((state) => ({
          places: state.places.filter((p) => p.id !== id),
          selectedPlaceId:
            state.selectedPlaceId === id ? null : state.selectedPlaceId,
          history: pushHistory(state.history, { kind: 'delete', place }),
        }))
        return place
      },

      undo: () => {
        const { history } = get()
        const last = history[history.length - 1]
        if (!last) return false
        const rest = history.slice(0, -1)

        if (last.kind === 'add') {
          set((state) => ({
            places: state.places.filter((p) => p.id !== last.id),
            selectedPlaceId:
              state.selectedPlaceId === last.id ? null : state.selectedPlaceId,
            history: rest,
          }))
        } else if (last.kind === 'delete') {
          set((state) => ({
            places: [...state.places, last.place],
            history: rest,
          }))
        } else if (last.kind === 'update') {
          set((state) => ({
            places: state.places.map((p) =>
              p.id === last.place.id ? last.place : p,
            ),
            history: rest,
          }))
        } else {
          set({
            places: last.places,
            mapViewport: last.mapViewport,
            selectedPlaceId: null,
            history: rest,
          })
        }
        return true
      },

      resetAll: () => {
        const { places, mapViewport, history } = get()
        set({
          places: [],
          mapViewport: DEFAULT_MAP_VIEWPORT,
          selectedPlaceId: null,
          sidebarFilters: defaultFilters,
          recentlyAddedIds: [],
          history: pushHistory(history, {
            kind: 'snapshot',
            places,
            mapViewport,
          }),
        })
      },

      importData: (places, options) => {
        const mode = options?.mode ?? 'replace'
        const { places: current, mapViewport, history, preferences } = get()
        const nextPlaces =
          mode === 'merge'
            ? mergePlaces(current, places)
            : places
        const nextPrefs = options?.preferences
          ? {
              ...preferences,
              ...pickImportedPreferences(options.preferences),
            }
          : preferences

        set({
          places: nextPlaces,
          mapViewport: options?.viewport ?? mapViewport,
          preferences: {
            ...nextPrefs,
            hasCompletedOnboarding:
              nextPlaces.length > 0 || nextPrefs.hasCompletedOnboarding,
          },
          selectedPlaceId: null,
          recentlyAddedIds: [],
          history: pushHistory(history, {
            kind: 'snapshot',
            places: current,
            mapViewport,
          }),
        })
      },

      setMapViewport: (viewport) => set({ mapViewport: viewport }),
      setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),

      setDarkMode: (dark) =>
        set((state) => ({
          preferences: { ...state.preferences, darkMode: dark },
        })),

      toggleDarkMode: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            darkMode: !state.preferences.darkMode,
          },
        })),

      setSidebarOpen: (open) =>
        set((state) => ({
          preferences: { ...state.preferences, sidebarOpen: open },
        })),

      setSelectedMapStyle: (style) =>
        set((state) => ({
          preferences: { ...state.preferences, selectedMapStyle: style },
        })),

      setLocale: (locale) =>
        set((state) => ({
          preferences: { ...state.preferences, locale },
        })),

      incrementDownloadCount: () => {
        const count = get().preferences.downloadCount + 1
        set((state) => ({
          preferences: { ...state.preferences, downloadCount: count },
        }))
        return count
      },

      setHideSupportModal: (hide) =>
        set((state) => ({
          preferences: { ...state.preferences, hideSupportModal: hide },
        })),

      setMapLayer: (patch) =>
        set((state) => ({
          preferences: { ...state.preferences, ...patch },
        })),

      completeOnboarding: () =>
        set((state) => ({
          preferences: { ...state.preferences, hasCompletedOnboarding: true },
        })),

      dismissBackupReminder: () =>
        set((state) => ({
          preferences: { ...state.preferences, hideBackupReminder: true },
        })),

      markJsonBackup: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            lastJsonBackupPlaceCount: state.places.length,
            hideBackupReminder: false,
          },
        })),

      setSearch: (search) =>
        set((state) => ({
          sidebarFilters: { ...state.sidebarFilters, search },
        })),

      setStatusFilter: (status) =>
        set((state) => ({
          sidebarFilters: { ...state.sidebarFilters, status },
        })),

      setCategoryFilter: (category) =>
        set((state) => ({
          sidebarFilters: { ...state.sidebarFilters, category },
        })),

      setCountryFilter: (country) =>
        set((state) => ({
          sidebarFilters: { ...state.sidebarFilters, country },
        })),

      setSort: (sort) =>
        set((state) => ({
          sidebarFilters: { ...state.sidebarFilters, sort },
        })),

      clearRecentlyAdded: (id) =>
        set((state) => ({
          recentlyAddedIds: state.recentlyAddedIds.filter((i) => i !== id),
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        places: state.places,
        mapViewport: state.mapViewport,
        preferences: state.preferences,
        sidebarFilters: state.sidebarFilters,
      }),
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value)
          } catch {
            window.dispatchEvent(new Event(STORAGE_QUOTA_EVENT))
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<TravelMapStore>
        const persistedPrefs = persistedState.preferences
        const hadPersistedPrefs = Boolean(persistedPrefs)
        return {
          ...current,
          ...persistedState,
          history: [],
          preferences: {
            ...current.preferences,
            ...persistedPrefs,
            darkMode: hadPersistedPrefs
              ? Boolean(persistedPrefs?.darkMode)
              : systemPrefersDark(),
            locale:
              persistedPrefs?.locale ??
              current.preferences.locale ??
              detectBrowserLocale(),
            showVisited: persistedPrefs?.showVisited ?? true,
            showWishlist: persistedPrefs?.showWishlist ?? true,
            showCountryFill: persistedPrefs?.showCountryFill ?? true,
            yearFilter: persistedPrefs?.yearFilter ?? null,
            hideBackupReminder: persistedPrefs?.hideBackupReminder ?? false,
            lastJsonBackupPlaceCount:
              persistedPrefs?.lastJsonBackupPlaceCount ?? 0,
            hasCompletedOnboarding:
              persistedPrefs?.hasCompletedOnboarding ??
              (persistedState.places?.length ?? 0) > 0,
          },
        }
      },
    },
  ),
)

function mergePlaces(current: Place[], incoming: Place[]): Place[] {
  const byId = new Map(current.map((p) => [p.id, p]))
  for (const place of incoming) {
    byId.set(place.id, place)
  }
  return Array.from(byId.values())
}

function pickImportedPreferences(
  prefs: Partial<AppPreferences>,
): Partial<AppPreferences> {
  const next: Partial<AppPreferences> = {}
  if (prefs.darkMode !== undefined) next.darkMode = prefs.darkMode
  if (prefs.selectedMapStyle) next.selectedMapStyle = prefs.selectedMapStyle
  if (prefs.locale) next.locale = prefs.locale
  if (prefs.showVisited !== undefined) next.showVisited = prefs.showVisited
  if (prefs.showWishlist !== undefined) next.showWishlist = prefs.showWishlist
  if (prefs.showCountryFill !== undefined)
    next.showCountryFill = prefs.showCountryFill
  if (prefs.hideSupportModal !== undefined)
    next.hideSupportModal = prefs.hideSupportModal
  return next
}
