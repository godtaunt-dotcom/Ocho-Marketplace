# Routes

Application client-side routing map.

## Overview
Zero-dependency browser hash routing (`window.location.hash`, `hashchange` listener) implemented in `ocho/client/src/App.tsx`.

## Route Definitions

| Path | Component / Page | Description | Auth Required |
|---|---|---|---|
| `#/` | `HomePage` (`ocho/client/src/pages/HomePage.tsx`) | Beranda katalog barang, filter kategori, search bar, sorting, pagination | Tidak |
| `#/items/:id` | `ItemDetailPage` (`ocho/client/src/pages/ItemDetailPage.tsx`) | Detail barang, foto galeri, profil penjual, checkout modal, laporan barang | Tidak (Browse) / Ya (Checkout) |
| `#/showcase` | `ComponentShowcase` (`ocho/client/src/pages/ComponentShowcase.tsx`) | Showcase sistem desain, varian tombol, input, badge, modal, card, alert | Tidak |

## Deep Linking Strategy
- Hash routing avoids 404 fallback issues on static hosting / SPA servers.
- Parameter extraction via regex/parsing on hash string (e.g. `#/items/item-1` extracts `id = "item-1"`).
- Programmatic navigation via `window.location.hash = '#/items/' + id` or direct `<a>` hrefs.
