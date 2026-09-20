---
title: Failure Playbook
description: Diagnose by boundary, preserve evidence, and recover without turning uncertainty into destructive action.
---

The most useful failure playbook begins with symptoms and narrows the boundary. Restarting everything destroys evidence and can create a second problem.

## Page is blank, stale, or says unavailable

1. Determine whether SvelteKit rendered and whether the error is page-specific or global.
2. Check shared daemon/Transmission/Plex indicators.
3. Use the route ledger in this guide to identify the page’s daemon calls.
4. Correlate the web request ID with daemon route logs.
5. Check whether the page preserved last-known-good data or truly has no initial value.

On the Mac after a web restart, inspect `/login` body content for session-secret or write-token errors. HTTP 200 is not proof of a healthy login page.

## Search returns nothing

Distinguish four states:

- provider succeeded with zero results;
- provider timed out/failed;
- TMDB/IMDb crosswalk could not be resolved;
- parsing rejected an invalid provider response.

Try the independent text provider when the structured IMDb-dependent provider fails. Do not write an empty successful response into a cache as if it proved absence unless the contract explicitly says so.

## Torrent says complete, media is missing

Follow the evidence ladder:

1. Transmission wanted files reached completion.
2. Expected files exist and have plausible names/sizes.
3. Download/media directories align with Plex libraries.
4. Plex scanner has run.
5. Plex item carries the expected provider GUID.
6. Pirate Claw’s Plex cache has refreshed since the scan.

Do not immediately re-grab while Plex state is unknown; that creates duplicates.

## Show identity looks wrong

Inspect the current TMDB pin, unverified state, rejected candidates, first-air year, and same-title collisions. Search and pin deliberately. Never “fix” identity by editing historical acquisition rows first.

## Daemon is alive but late

Check event-loop lag, active cycle, cycle durations, overlapping provider/Plex work, and queued web requests. A late timer proves contention; it does not prove Plex is the culprit. Reduce amplification before shortening timeouts or adding retries.

## Safe recovery principles

- Preserve SQLite/config before migration or repair.
- Prefer retries that are idempotent or identity-deduplicated.
- Keep failed attempts separate from successful ledgers.
- Never coerce unavailable external truth into missing.
- On NAS, preserve Transmission/Gluetun topology during web-only releases.
- On remote Mac, never reboot or alter Tailscale as a casual diagnostic step.

### In plain English

Find which handoff broke before restarting the factory. A download receipt, a file on disk, and a Plex shelf entry are three separate checkpoints. Check them in order and keep the paperwork.

### Key takeaway

Recover by boundary and evidence. The dangerous move is turning “I cannot currently observe it” into “it does not exist.”
