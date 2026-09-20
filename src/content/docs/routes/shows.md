---
title: Shows Library
description: Snapshot-backed list rendering, bounded refresh polling, and why browser-owned Plex sweeps are a v2 smell.
---

The Shows route answers a library-level question: what is tracked, what metadata identifies it, and what does Plex currently say about completion? It is not the episode workflow; that belongs to show detail.

## Initial data

Beyond the layout, the page calls `GET /api/shows`. The server projects the response into a lighter browser shape. The daemon can serve a fresh, stale, or cold snapshot and refresh metadata in the background rather than forcing navigation to wait for every enrichment call.

The response powers posters, titles, overview, TMDB identity, Plex completion, missing counts, sort/filter, and bulk refresh targeting.

On the measured Mac, the first sample took about 33–50 ms while later snapshot-backed calls fell near 1 ms. That is the cache doing useful work. The UI still needs to show a bounded “refreshing” state when it receives a stale snapshot.

## Idle behavior

There is no permanent Shows poll. If the response says background refresh is active, the browser invalidates `app:shows` after 500 ms and then approximately once per second, stopping after fifteen attempts. This is a bounded completion check, not an unending heartbeat.

Boundedness matters. If refresh hangs, the page stops generating work and leaves the user a retry path.

## Bulk Plex refresh

The bulk button calls a SvelteKit endpoint that:

1. fetches `/api/shows`;
2. selects missing or unknown shows;
3. calls each show’s Plex refresh sequentially;
4. waits roughly 800 ms between items;
5. reports progress and supports cancellation.

Sequential behavior is intentionally gentle on Plex and the daemon. After completion, however, the component calls `invalidateAll()`. Only Shows data needs refreshing. Changing that to `invalidate('app:shows')` is a low-risk v1 improvement.

## A browser should not own maintenance forever

The current bulk flow stops if the browser disconnects. That is acceptable for a manual v1 tool: the human initiated it and sees progress. In v2, a long Plex sweep should be a durable daemon job with an ID, progress, cancellation, and a result. The browser should observe the job, not be its life support.

## What the route gets right

- one collection endpoint;
- reduced browser DTO;
- stale-while-refresh behavior;
- bounded retry loop;
- sequential Plex pressure;
- explicit missing versus unknown targeting.

Do not replace those with eager per-card requests. A grid that sends one Plex/TMDB request per tile becomes slower as the UI becomes more useful.

### In plain English

The Shows page uses a prepared index card box instead of asking Plex and TMDB to re-research every show whenever you open the room. If the index is old, it updates in the background and checks a limited number of times for the new copy.

### Key takeaway

Snapshot-backed collection pages are a good v1 pattern. Narrow the bulk-refresh invalidation now; move the sweep itself to a durable job in v2.
