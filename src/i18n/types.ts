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
    exportHelp: string
    import: string
    importTooltip: string
    importHelp: string
    reset: string
    darkMode: string
    lightMode: string
    places: string
    help: string
    helpTooltip: string
    more: string
    fitPlaces: string
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
    continentsVisited: string
    worldVisitedPercent: string
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
    searchRateLimit: string
    searchPrompt: string
    noResults: string
    back: string
    mapHint: string
    cancel: string
  }
  onboarding: {
    mapTitle: string
    mapHint: string
    cta: string
    skip: string
    dialogTitle: string
    step1: string
    step2: string
    step3: string
  }
  help: {
    title: string
    intro: string
    addTitle: string
    addBody: string
    exportTitle: string
    exportBody: string
    undoTitle: string
    undoBody: string
    languageTitle: string
    languageBody: string
    shortcutsTitle: string
    shortcutAdd: string
    shortcutExport: string
    shortcutSidebar: string
    shortcutDark: string
    shortcutUndo: string
    shortcutEsc: string
    shortcutHelp: string
  }
  mapLayers: {
    visited: string
    wishlist: string
    countries: string
    allYears: string
    year: string
    countriesLeft: string
    countriesLeftDone: string
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
    country: string
    city: string
    region: string
    latitude: string
    longitude: string
    locationHint: string
    cancel: string
    save: string
  }
  placePopup: {
    edit: string
    dragHint: string
  }
  backup: {
    title: string
    message: string
    exportNow: string
    dismiss: string
  }
  importDialog: {
    title: string
    description: string
    replace: string
    merge: string
    cancel: string
  }
  confirm: {
    cancel: string
    confirm: string
    resetTitle: string
    resetDescription: string
    resetConfirm: string
    deleteTitle: string
    deleteDescription: string
    deleteConfirm: string
    duplicateTitle: string
    duplicateDescription: string
    duplicateConfirm: string
  }
  export: {
    title: string
    description: string
    previewLabel: string
    liveMapNote: string
    applyToLiveMap: string
    visited: string
    wishlist: string
    downloadPng: string
    generating: string
    progress: string
    missingTiles: string
    layout: string
    landscape: string
    portrait: string
    crop: string
    cropFit: string
    cropWorld: string
    showTitle: string
    showStats: string
    mapTitle: string
    legend: string
    summary: string
    totalPlaces: string
    visitedCount: string
    wishlistCount: string
    countriesVisited: string
    continentsVisited: string
    worldVisitedPercent: string
    generated: string
  }
  support: {
    title: string
    message1: string
    message2: string
    message3: string
    donate: string
    buyMeACoffee: string
    contribute: string
    unavailable: string
    skip: string
    dontShowAgain: string
  }
  error: {
    title: string
    description: string
    clearAndReload: string
    reload: string
  }
  toast: {
    geocodeFailed: string
    geocodeRateLimit: string
    placeUpdated: string
    placeAdded: string
    placeDeleted: string
    undo: string
    placeRestored: string
    actionUndone: string
    mapDownloaded: string
    mapGenerateFailed: string
    dataExported: string
    invalidImport: string
    imported: string
    importedMerge: string
    importFailed: string
    resetDone: string
  }
  common: {
    close: string
  }
}
