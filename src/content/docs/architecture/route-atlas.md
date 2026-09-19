---
title: Routes, Requests, and Idle Work
description: What every main screen asks for, what it changes, and what keeps moving while you wait.
---

This is the route atlas for the v1 web UI. A “request” may mean browser to
SvelteKit, SvelteKit to daemon, or daemon to an external provider. Those hops
are deliberately separated in the real system.

## The shared layout

Authenticated navigation loads app auth state, daemon health, Transmission
session, config, setup state, readiness, installation health, and Plex auth
state. The layout then independently polls daemon status, Transmission status,
and Plex status through small browser-facing proxy routes.

## Primary pages

| Page | Initial data it requests | User-triggered events | Idle/background work | What the data visibly powers |
| --- | --- | --- | --- | --- |
| Dashboard | Candidates, run summaries, failures, completed manual archive, live torrents | Pause/resume/remove/requeue/dismiss/trim | Torrent refresh ~3s; content ~30s; global status polls | Torrent Manager, status cards, failure history, haul |
| Movies | Completed movie archive | Delete/untrack a movie; deep-link highlight | No local poll | Poster wall and archive cards |
| TV Shows | Cached show list | Refresh missing/Plex state; open show | Short refresh retries while enrichment settles | Show cards and missing counts |
| Show detail | Show list plus episode status | Grab episode/pack, search providers, pin TMDB, untrack | Episode refresh after actions | Episode grid, season status, grab controls |
| Movie Discovery | Movie calendar | Load more, Top Movies, rescan/sweep, search, YTS/PirateBay grab | Tab-local fetches, not a fixed continuous poll | Calendar, ranking cards, search results |
| TV Discovery | TV calendar | Load more, track/untrack, search TMDB, season-pack grab | Tracked tab fetches on demand | Calendar, Find, Tracked, Search |
| Config | Config, Transmission session, status, Plex state and sync timestamps | Save settings, connect Plex, sync, feed rescan, restart daemon | Restart-status polling only during restart | Runtime and provider control panels |
| Onboarding/setup/login | Setup and auth state | Configure, authenticate, trust origin | Targeted readiness checks | Guided first-run path |

## In plain English

The dashboard is deliberately the busiest page because it is a live control
room. Discovery pages mostly fetch when you ask them to explore more. Movies is
deliberately calmer: it is a history/archive view, not a real-time torrent
screen.

## Performance note

The NAS is useful evidence that the architecture survives on old hardware. It
is not the customer-performance target. Mac traces on an M-series machine are
the benchmark for page latency, request count, payload size, and UI settling
time.

## Key takeaway

Every page needs a request map because “this screen is slow” is meaningless
until we know which hop is slow and whether the user actually needed it.

## Endpoint inventory: the actual v1 requests

These are the browser-facing API routes used by the current web UI. Most load
requests are made by SvelteKit on the server, then handed to the browser as
page data; action routes keep the write token out of browser JavaScript.

### Shared shell and dashboard

| Screen or situation | Requests | Why it happens |
| --- | --- | --- |
| Signed-in shared layout | `GET /api/health`, `/api/transmission/session`, `/api/config`, `/api/setup/state`, `/api/setup/readiness`, `/api/setup/install-health`, `/api/plex/auth/status`, plus auth state | Header, navigation availability, setup banners, connection indicators |
| Every signed-in page while idle | `GET /api/poll/daemon-status` ~10s, `/api/poll/transmission-status` ~20s, `/api/poll/plex-status` ~45s | The global connection/status dots |
| Dashboard initial load | `GET /api/candidates`, `/api/status`, `/api/outcomes?status=failed_enqueue`, `/api/manual-grabs/completed` | Active candidates, run history, failed queue attempts, Your Haul |
| Dashboard live content | `GET /api/poll/torrents` ~3s and the dashboard content load ~30s; `/api/shows-slugs` supports title links | Torrent Manager and live completion state |
| Dashboard actions | Candidate requeue/dismiss, torrent dispose/remove, auto-reconcile, trim-file routes, failure actions | Buttons issue focused writes, although some still cause a broad refresh afterward |

### Library and discovery

| Screen | Initial load | Event-only calls | Visual result |
| --- | --- | --- | --- |
| Movies | `GET /api/movies` | `DELETE /api/movies/:tmdbId` | Completed archive cards; deletion/untracking |
| TV Shows | `GET /api/shows` | `POST /shows/refresh-missing` | Show cards and refreshed Plex/missing state |
| Show detail | `GET /api/shows`; `GET /api/shows/:slug/episodes` | TMDB refresh/candidates/pin/confirm, Plex refresh, manual grab, untrack, remove-and-delete, episode search and grab routes | Identity panel, overview, episode grid, and per-season controls |
| Movie Discovery | `GET /api/movie-calendar?limit=…` | `/movie-discovery/more`, `/movie-discovery/search`, `/movie-discovery/top`, `/movie-discovery/top-rescan`, provider-result requests, and `POST /api/movies/:tmdbId/manual-grab` | Calendar, Top Movies of Year, free-text search, release choices, and grab outcome |
| TV Discovery | `GET /api/calendar/tv?limit=…` | `/tv-discovery/more`, `/tv-discovery/tracked`, TMDB candidate search, show search, track/untrack and grab routes | Calendar, Find, Tracked, Search, and season-pack choices |
| Config | `GET /api/config`, `/api/transmission/session`, `/api/status`, `/api/plex/auth/status`, `/api/movie-calendar/plex-sync`, `/api/shows/plex-sync` | Config saves, TMDB/Plex auth, feed rescan, daemon restart, Transmission ping/status/queue setting updates | All integration cards and their action feedback |

`/api/client-error` is a best-effort diagnostic call when a discovery-page
render boundary catches an error. It should never be necessary for normal use;
its presence is a clue for debugging rather than page data.

## Where cascades can become sexy instead of broad

SvelteKit's `invalidate(key)` reruns the entire `load` function that declared
that key. It is much narrower than `invalidateAll()`, but it is not a magical
field-level patch. The next tier is an explicit mutation result plus a resource
tag: delete one movie, update that card/list count and the one archive query;
grab one episode, update that episode/season and its torrent row. Keep broad
revalidation for true configuration or auth changes, where the whole shell may
really be stale.
