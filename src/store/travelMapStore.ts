import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  MapStyleId,
  MapViewport,
  Place,
  PlaceDraft,
  PlaceStatus,
  SidebarFilters,
  SortOption,
} from '@/types'
import { DEFAULT_MAP_VIEWPORT, STORAGE_KEY } from '@/utils/constants'
import { generateId } from '@/utils'

interface TravelMapStore {
  places: Place[]
  mapViewport: MapViewport
  preferences: {
    darkMode: boolean
    hideSupportModal: boolean
    downloadCount: number
    selectedMapStyle: MapStyleId
    sidebarOpen: boolean
  }
  selectedPlaceId: string | null
  sidebarFilters: SidebarFilters
  recentlyAddedIds: string[]
  deletedPlaceBackup: Place | null

  addPlace: (draft: PlaceDraft) => Place
  updatePlace: (id: string, draft: Partial<PlaceDraft>) => void
  deletePlace: (id: string) => Place | null
  undoDelete: () => void
  resetAll: () => void
  importData: (places: Place[], viewport?: MapViewport) => void

  setMapViewport: (viewport: MapViewport) => void
  setSelectedPlaceId: (id: string | null) => void
  setDarkMode: (dark: boolean) => void
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
  setSelectedMapStyle: (style: MapStyleId) => void
  incrementDownloadCount: () => number
  setHideSupportModal: (hide: boolean) => void

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

export const useTravelMapStore = create<TravelMapStore>()(
  persist(
    (set, get) => ({
      places: [],
      mapViewport: DEFAULT_MAP_VIEWPORT,
      preferences: {
        darkMode: false,
        hideSupportModal: false,
        downloadCount: 0,
        selectedMapStyle: 'classic_atlas',
        sidebarOpen: false,
      },
      selectedPlaceId: null,
      sidebarFilters: defaultFilters,
      recentlyAddedIds: [],
      deletedPlaceBackup: null,

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
        }))
        return place
      },

      updatePlace: (id, draft) => {
        set((state) => ({
          places: state.places.map((p) =>
            p.id === id ? { ...p, ...draft } : p,
          ),
        }))
      },

      deletePlace: (id) => {
        const place = get().places.find((p) => p.id === id) ?? null
        if (!place) return null
        set((state) => ({
          places: state.places.filter((p) => p.id !== id),
          deletedPlaceBackup: place,
          selectedPlaceId:
            state.selectedPlaceId === id ? null : state.selectedPlaceId,
        }))
        return place
      },

      undoDelete: () => {
        const backup = get().deletedPlaceBackup
        if (!backup) return
        set((state) => ({
          places: [...state.places, backup],
          deletedPlaceBackup: null,
        }))
      },

      resetAll: () => {
        set({
          places: [],
          mapViewport: DEFAULT_MAP_VIEWPORT,
          selectedPlaceId: null,
          sidebarFilters: defaultFilters,
          recentlyAddedIds: [],
          deletedPlaceBackup: null,
        })
      },

      importData: (places, viewport) => {
        set({
          places,
          mapViewport: viewport ?? get().mapViewport,
          selectedPlaceId: null,
          recentlyAddedIds: [],
          deletedPlaceBackup: null,
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
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
