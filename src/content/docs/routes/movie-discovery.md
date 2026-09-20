---
title: Movie Discovery
description: Calendar, Top Movies, Search, lazy provider work, local ownership patches, and the cost of browser-only tab state.
---

Movie Discovery contains three ways to locate a movie, then a shared human-review path for choosing a torrent. The tabs look like navigation; today they are browser state, which affects what the server can optimize.

## Initial load always means Calendar

SSR calls `GET /api/movie-calendar?limit=PAGE_SIZE` regardless of the tab saved in `sessionStorage`. The browser restores Calendar, Top Movies, or Search only after hydration. A returning Search user therefore still pays for the first calendar page.

Fixing this properly means putting tab state in the URL or another server-visible input. That gives shareable links and back-button correctness. It is a v2 improvement unless measurements show the wasted calendar call is a launch blocker.

## Request and event ledger

| Event | Browser/SvelteKit route | Daemon work |
|---|---|---|
| First paint | page load | movie calendar page |
| Scroll / earlier months | `/movie-discovery/more` | calendar offset page |
| Open Top Movies | `/movie-discovery/top` | cached/scraped yearly chart |
| Rescan chart | `/movie-discovery/top-rescan` | streamed scrape + enrichment |
| Ownership sweep | Top endpoint with `sweep=true` | filesystem/Plex ownership work |
| Free-text search | `/movie-discovery/search` | YTS and APIBay search |
| Inspect known movie | `/:tmdbId/yts` and `/:tmdbId/apibay` | provider-specific releases |
| Identify free-text result | `?/searchTmdbMovies` | TMDB candidates |
| Grab selected result | `?/manualGrab` | Transmission, then manual ledger/failure |
| Render crash | `/api/client-error` | web-process diagnostic log |

Top Movies is intentionally lazy and cached per year. A real rescan streams progress rather than holding a blank request open. Calendar paging has a browser timeout, stale-response protection, TMDB-ID deduplication, and a six-chunk mounted window to control mobile memory.

## No fixed page poll

Discovery does work when the user asks for it. It does not need a permanent interval. Retry invalidates the `app:movie-discovery` load key. Grab panels patch local ownership state after a successful selection so the chosen movie can immediately look acquired.

Enhanced form `update()` may still perform a broad page invalidation after grab even though the component already knows the affected TMDB ID. Before November, opt that action out of automatic invalidation and retain the local patch—then verify all three tabs.

## Cold versus warm discovery

On the Mac, the first observed movie-calendar call took roughly 5.2 seconds; warm calls were about 8–12 ms. That is a cache story, not a contradiction. A performance chapter that quotes only the warm number misses the experience that needs a progress state.

Top Movies has even more external steps: scrape, parse IMDb identities, resolve through TMDB, merge ownership, cache. The UI should distinguish fresh cache, refresh in progress, provider failure, and true emptiness.

### In plain English

Calendar, yearly charts, and Search are three catalog desks. They all lead to the same checkout after you choose a release. The catalog desk can be slow the first time because it is fetching and organizing outside information; opening a cached drawer later is fast.

### Key takeaway

Movie Discovery’s lazy, bounded work is sound. The main structural debt is tab state the server cannot see and a post-grab refresh broader than the local update requires.
