# Travel Map

A personal travel map. Mark places you have visited or want to visit, then download a high-resolution poster. Everything stays in this browser — export JSON so you do not lose it.

Live site: [https://myworldmarked.vercel.app/](https://myworldmarked.vercel.app/)

## Features

- **Add places** — Search a name, or choose Add Place → Click on map (plain map clicks do nothing until that mode is on)
- **Place management** — Visited or wishlist, category, date, notes, drag the pin, edit country code
- **Sidebar** — Search, filter, sort, grouped by country
- **Map layers** — Toggle visited / wishlist pins, country fills, year filter (desktop), countries left to visit
- **Printable PNG** — 7 styles, landscape or portrait, fit places or whole world
- **JSON backup** — Export and import (replace or merge)
- **English and Português (Portugal)**
- **Dark mode** — Follows the system on first visit
- **Local storage** — No account

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘N | Add place |
| ⌘E | Download printable map |
| ⌘B | Toggle places list (mobile) |
| ⌘D | Toggle dark mode |
| ⌘Z | Undo last action |
| ⌘/ | Help |
| Esc | Deselect / exit add mode |

## License

MIT
