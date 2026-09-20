---
title: Configuration and Onboarding
description: The heaviest route, optimistic concurrency, setup/auth flows, duplicated reads, and the line between safe v1 fixes and packaging work.
---

Configuration is the page where every subsystem meets, so it is predictably the heaviest ordinary route. Onboarding repeats many of the same dependencies. This is also where security, restart semantics, and installability stop being abstract architecture.

## Config request fan-out

The page adds six calls to the layout’s eight:

- `/api/config`
- `/api/transmission/session`
- `/api/status`
- `/api/plex/auth/status`
- `/api/movie-calendar/plex-sync`
- `/api/shows/plex-sync`

That is fourteen daemon requests on navigation. Config, Transmission session, and Plex auth duplicate layout work. Plex auth can itself ask the Plex server for version state.

The config read carries an ETag used for optimistic concurrency. Reusing parent config is not as simple as deleting the duplicate: the parent contract must carry the revision safely or the page loses protection against overwriting another edit. This is the senior lesson—deduplication must preserve semantics.

## Mutation surface

| Operation | Daemon endpoint(s) |
|---|---|
| Save Plex URL | `PUT /api/config/plex` |
| Disconnect Plex | `POST /api/plex/auth/disconnect` |
| Save manual Plex token | `POST /api/plex/auth/manual-token` |
| Cancel Plex sign-in | `POST /api/plex/auth/cancel` |
| Start/finalize Plex sign-in | `POST /api/plex/auth/start`, then `POST /api/plex/auth/finalize` after callback |
| Save runtime controls | `PUT /api/config` |
| Save TV defaults | `PUT /api/config/tv/defaults` |
| Save movie policy | `PUT /api/config/movies` |
| Save TMDB settings | `PUT /api/config/tmdb` |
| Save feeds | `PUT /api/config/feeds` |
| Rescan feeds | `POST /api/feed/rescan` |
| Restart daemon | `POST /api/daemon/restart`; browser polls `/api/daemon/restart-status` |
| Test Transmission | `POST /api/transmission/ping` plus `GET /api/setup/transmission/status` |
| Save queue caps | `PUT /api/transmission/queue-settings` |
| Plex movie sync | browser `/config/plex-movie-sync` → streaming `POST /api/movie-calendar/plex-sync?stream=true` |
| Plex TV sync | browser `/config/plex-tv-sync` → `GET /api/shows`, sequential per-show refresh, then `POST /api/shows/plex-sync?recordOnly=true` |

Some saved settings require restart because dependencies were constructed at daemon boot. The UI tracks “restart required” rather than pretending a written file means live behavior changed.

Feed rescan deliberately disables page invalidation so unsaved form inputs are not discarded. That small choice demonstrates good mutation design: a background command should not reset unrelated editing state.

## Plex synchronization

Movie sync streams daemon progress. TV sync fetches shows, refreshes them sequentially, then records the sync. Both cards maintain local progress/timestamp state, yet call `invalidateAll()` when done. A Config-specific refresh—or no refresh when confirmed local state is sufficient—would avoid repeating fourteen calls.

Long term these should be durable daemon jobs, not browser-owned workflows.

## Setup and authentication

Setup and Login use the daemon to create/verify the owner, then SvelteKit issues an HTTP-only, SameSite Lax, thirty-day signed session cookie. `secure: false` supports local HTTP/Tailscale-style deployment and must be documented as a trust assumption.

Onboarding is authenticated, pays for the layout, then independently refetches config, readiness, and Plex auth: eleven daemon calls total. It adds feed, TV/movie targets, Transmission media directories, Plex connection, and readiness checking.

| Onboarding event | Daemon endpoint(s) |
|---|---|
| Add feed | `PUT /api/config/feeds` |
| Save TV target | `PUT /api/config/tv/defaults`, then `PUT /api/config` |
| Save movie target | `PUT /api/config/movies` |
| Test Transmission | `GET /api/setup/transmission/status` |
| Save media directories | `PUT /api/config/transmission/download-dirs` |
| Reapply config | `GET /api/config`, then `PUT /api/config/feeds` |
| Complete Plex connection | start/finalize flow listed above |

Source audit found that the browser’s readiness poll and two network-posture writes lack matching SvelteKit proxies. Fix and integration-test those before November.

## V1 versus product packaging

The current Mac deployment is a source checkout with Bun, separate Transmission, and launchd/environment coordination. A signed drag-and-drop app is a separate product build. Do not let “v1 ships November 1” silently mean both unless scope is explicitly changed.

For v1: fix proxies, reduce safe duplicates, retain ETags, narrow sync invalidation, and document restart/security assumptions. For v2: split giant config into resource-shaped contracts and make installation/process ownership part of the application.

### In plain English

Config is the breaker room, so it checks nearly every utility. Some duplicate checks can be removed, but the config revision stamp must travel with the data or two edits can overwrite each other. Setup is not finished until browser requests actually reach the protected daemon through a safe server-side doorway.

### Key takeaway

Optimize Config with semantic care. ETags, restart requirements, private tokens, and installation state are correctness—not incidental plumbing.
