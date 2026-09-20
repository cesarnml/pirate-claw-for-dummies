---
title: Movies Archive
description: The two-ledger projection, client-side infinite rendering, deletion behavior, and what “Your Haul” intentionally excludes.
---

The Movies route is not a Plex library browser. It is a completed-acquisition archive: movies Pirate Claw can attribute to its automatic or manual paths.

## One endpoint, two ledgers

`GET /api/movies` projects completed RSS movie candidates together with completed `manual_movie_grabs`, then enriches them with TMDB and Plex observations.

Important projection rules include:

- filesystem- and Plex-adopted movies are excluded because Pirate Claw did not acquire them;
- RSS rows without a safe TMDB cache match are dropped rather than title-deduplicated recklessly;
- when both ledgers represent the same TMDB movie, the manual record wins;
- deleted dispositions no longer count as owned, while a later active re-grab can count again.

That is business meaning, not query cleanup.

## What the card fields actually come from

| Card field | Likely source |
|---|---|
| Title, poster, description, language, rating | TMDB cache join |
| Resolution, codec | Captured release/provider data or filename parsing |
| Completion date | Acquisition/reconciliation ledger |
| Present in Plex | Plex observation/cache |
| Source/provenance | RSS versus manual acquisition ledger |

This explains uneven historical cards without requiring one broken path. An old row can have solid completion evidence but no overview snapshot. A provider result can have no parseable codec. Moving forward, canonical identity plus consistent enrichment is the important guarantee.

## “Infinite scroll” is a rendering window

The page fetches the complete archive. Intersection-based scrolling reveals twenty more cards at a time in the DOM; it does not request server pages. Preserving `visibleCount` during deletion fixed the disruptive jump that occurred after the rendered window collapsed.

That solution handles current archive scale and protects UX. It does not reduce transfer size or server projection cost. True server pagination is a v2 option if Mac measurements show the archive becoming materially heavy.

## Deletion and invalidation

Deleting posts to the SvelteKit action, which calls `DELETE /api/movies/:tmdbId`. After success the page currently calls `invalidateAll()`. Because the page has no named dependency key, deletion reloads shared layout state along with the movie archive.

A safe v1 improvement is to declare `app:movies` and invalidate only it. Optimistic local removal could make the interaction even smoother, but the server should remain authoritative about whether deletion also removed/untracked underlying acquisition state.

## What not to change before ship

Do not merge the RSS and manual ledgers just to simplify this route. Do not title-match unmatched RSS rows. Do not redefine the archive as “everything in Plex” without an explicit product decision. Those changes affect provenance and user trust.

### In plain English

This page is Pirate Claw’s trophy shelf, not a census of the whole Plex house. It combines trophies won through two acquisition paths and borrows the labels and artwork from TMDB.

### Key takeaway

The Movies page is a meaningful projection over different histories. Preserve that meaning; optimize its refresh and pagination independently.
