# Travel Map

A premium personal travel map application. Mark places you've visited or dream of visiting on an interactive world map, with beautiful visualizations and high-resolution printable exports.

## Features

- **Interactive World Map** — Click anywhere to add places with automatic reverse geocoding
- **Place Management** — Organize by status (Visited / Wishlist), category, and country
- **Smart Sidebar** — Search, filter, sort, and browse places grouped by country
- **Printable Exports** — Ultra high-resolution PNG with 7 map styles, layout options, and live preview
- **Data Portability** — Export and import your data as JSON
- **Dark Mode** — Beautiful light and dark themes
- **Keyboard Shortcuts** — ⌘N add, ⌘E export, ⌘B sidebar, ⌘D dark mode, ⌘Z undo
- **Local Storage** — All data persists locally, no account required

## Tech Stack

- React 19 + TypeScript + Vite
- TailwindCSS + shadcn/ui
- React Leaflet + Leaflet
- Zustand (persisted state)
- Framer Motion
- React Hot Toast
- html-to-image

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘N | Toggle add place mode |
| ⌘E | Download printable map |
| ⌘B | Toggle sidebar (mobile) |
| ⌘D | Toggle dark mode |
| ⌘Z | Undo last action |
| ⌘/ | Help |
| Esc | Deselect place / exit add mode |

## License

MIT
