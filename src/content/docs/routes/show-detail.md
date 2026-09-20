---
title: Show Detail and Episode Grabs
description: The full-show lookup, season walk, identity controls, provider search, manual grabs, and the best targeted-update pattern in v1.
---

Show Detail is where Pirate Claw’s identity, Plex, TMDB, Transmission, and manual acquisition models meet. It is the richest route and the one most likely to reveal architectural coupling.

## Initial load

After the layout, the server performs two sequential operations:

1. `GET /api/shows`, then locate the requested slug in the full collection.
2. `GET /api/shows/:slug/episodes` for the selected/default season.

The first powers title, artwork, overview, identity status, Plex completion, strict matching, and season summaries. The second powers episode rows, aired/owned state, grab history, and missing controls.

The load merges freshly walked season counts back into the selected show so the header and grid do not disagree during one request. That is a thoughtful local consistency fix.

Fetching every show to render one is still structurally expensive. A dedicated `GET /api/shows/:slug` belongs in v2. Before November, the snapshot-backed `/api/shows` makes the current path safe enough unless Mac traces prove otherwise.

## User events and exact daemon calls

The browser routes in the middle keep credentials and daemon topology out of client JavaScript. The final column is the actual daemon contract.

| User event | SvelteKit route/action | Daemon endpoint |
|---|---|---|
| Select/recheck season | `/shows/:slug/episodes?season=N` | `GET /api/shows/:slug/episodes` |
| Search EZTV | `/shows/:slug/eztv` | `GET /api/shows/:slug/eztv` |
| Search Pirate Bay | `/shows/:slug/thepiratebay` | `GET /api/shows/:slug/thepiratebay` |
| Free-text torrent search | `/shows/:slug/search` | `GET /api/shows/:slug/search` |
| Refresh TMDB | `?/refreshTmdb` | `POST /api/shows/:slug/tmdb/refresh` |
| Refresh Plex | `?/refreshPlex` | `POST /api/shows/:slug/plex/refresh` |
| Search identity candidates | `?/searchTmdbMatches` | `GET /api/shows/:slug/tmdb/candidates` |
| Pin or clear identity | `?/pinTmdbMatch` | `PUT /api/shows/:slug/tmdb/pin` |
| Confirm provisional identity | `?/confirmTmdbMatch` | `POST /api/shows/:slug/tmdb/pin/confirm` |
| Toggle Strict | `?/toggleStrict` | `GET /api/config`, then `PUT /api/config` |
| Untrack | `?/removeShow` | `DELETE /api/shows/:slug` |
| Grab episode or season pack | `?/manualGrab` | `POST /api/shows/:slug/manual-grab` |
| Remove stalled grab | `?/removeStalledGrab` | `POST /api/transmission/torrent/remove-and-delete` |
| Inspect/trim pack files | `/torrents/:hash/files` | `GET`/`POST /api/transmission/torrent/:hash/files` |

Provider searches happen on demand, not at initial render. That is important: an episode grid does not need torrent-provider traffic until the user asks to acquire something.

## The best mutation pattern in v1

Manual grab and stalled-torrent removal use enhanced form updates with `invalidateAll: false`, then reload only the affected season. That is exactly the behavior we want: the mutation states its practical effect and refreshes the smallest useful resource.

Identity and metadata actions use normal enhanced form `update()` and correctly avoid an extra explicit invalidation. There is still room to narrow them in v2, but at least they do not double-refresh.

## The config-shaped scar

Toggling Strict rewrites the entire TV show rule list because tracking rules are stored as list-shaped configuration. Careful echoing preserves fields such as `matchPattern`; omitting one during rewrite could silently un-Strict other shows.

That is too much blast radius for a one-show toggle. Do not hurriedly change the persistence model before ship. In v2, provide granular tracked-show endpoints and revision checks at the resource level.

## Episode descriptions are deliberately not the priority

V1 uses Plex existence as the practical finish line and focuses on acquisition state. Rich episode-level metadata can wait. This is a good scope decision: completing season-pack selection, adoption, and ownership semantics creates more value than decorating every episode row.

### In plain English

Show Detail is the workbench. It first brings in the show’s binder, then opens one season. Searches and grabs happen only when you use a tool. After a grab, it refreshes the one tray you touched instead of cleaning the whole workshop.

### Key takeaway

Preserve the targeted season-refresh pattern. The v2 work is a dedicated show resource and granular tracking mutations, not more broad invalidation.
