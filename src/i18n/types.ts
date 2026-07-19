export type Locale = 'en' | 'pt-PT'

export const LOCALES: Array<{ id: Locale; label: string; nativeLabel: string }> = [
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'pt-PT', label: 'Portuguese (Portugal)', nativeLabel: 'Português (Portugal)' },
]

export type TranslationKey = string

export type Messages = {
  app: {
    name: string
    tagline: string
  }
  language: {
    label: string
    english: string
    portuguese: string
  }
  toolbar: {
    addPlace: string
    addPlaceTooltip: string
    mapStyle: string
    mapStyleTooltip: string
    download: string
    downloadTooltip: string
    export: string
    exportTooltip: string
    import: string
    importTooltip: string
    reset: string
    darkMode: string
    lightMode: string
    places: string
  }
  sidebar: {
    title: string
    searchPlaceholder: string
    status: string
    category: string
    country: string
    sort: string
    allStatuses: string
    allCategories: string
    allCountries: string
    sortRecentlyAdded: string
    sortAlphabetical: string
    sortVisitedDate: string
    totalPlaces: string
    visited: string
    wishlist: string
    countriesVisited: string
    countriesWishlist: string
    emptyTitle: string
    emptyFilteredTitle: string
    emptyHint: string
    emptyFilteredHint: string
    unknownCountry: string
  }
  status: {
    visited: string
    wishlist: string
  }
  category: {
    city: string
    landmark: string
    historic_site: string
    museum: string
    nature: string
    national_park: string
    beach: string
    mountain: string
    lake: string
    island: string
    restaurant: string
    hiking_trail: string
    viewpoint: string
    airport: string
    other: string
  }
  mapStyles: {
    classic_atlas: { name: string; description: string }
    minimal_bw: { name: string; description: string }
    watercolor: { name: string; description: string }
    dark_mode: { name: string; description: string }
    vintage_poster: { name: string; description: string }
    vintage_map: { name: string; description: string }
    modern_minimal: { name: string; description: string }
  }
  addPlace: {
    title: string
    searchTitle: string
    chooseDescription: string
    searchDescription: string
    clickOnMap: string
    clickOnMapHint: string
    search: string
    searchHint: string
    searchPlaceholder: string
    searchButton: string
    searching: string
    searchError: string
    searchPrompt: string
    noResults: string
    back: string
    mapHint: string
    cancel: string
  }
  placeDialog: {
    addTitle: string
    editTitle: string
    lookingUp: string
    name: string
    namePlaceholder: string
    status: string
    category: string
    visitedDate: string
    notes: string
    notesPlaceholder: string
    cancel: string
    save: string
  }
  placePopup: {
    edit: string
  }
  export: {
    title: string
    description: string
    previewLabel: string
    visited: string
    wishlist: string
    downloadPng: string
    generating: string
    mapTitle: string
    legend: string
    summary: string
    totalPlaces: string
    visitedCount: string
    wishlistCount: string
    countriesVisited: string
    generated: string
  }
  support: {
    title: string
    message1: string
    message2: string
    message3: string
    buyMeACoffee: string
    contribute: string
    skip: string
    dontShowAgain: string
  }
  confirm: {
    cancel: string
    confirm: string
    resetTitle: string
    resetDescription: string
    resetConfirm: string
  }
  error: {
    title: string
    description: string
    clearAndReload: string
    reload: string
  }
  toast: {
    geocodeFailed: string
    placeUpdated: string
    placeAdded: string
    placeDeleted: string
    undo: string
    placeRestored: string
    mapDownloaded: string
    mapGenerateFailed: string
    dataExported: string
    invalidImport: string
    imported: string
    importFailed: string
    resetDone: string
  }
  common: {
    close: string
  }
}
