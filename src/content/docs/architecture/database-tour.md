---
title: SQLite Schema Tour
description: The actual families of tables, their logical relationships, and why the database is a set of ledgers rather than one normalized worldview.
---

Pirate Claw’s SQLite file contains at least twenty-two tables. That is not automatically evidence of failure. It reflects distinct workflows: RSS processing, manual acquisition, durable failures, provider caches, Plex synchronization, auth, adoption, and operator intent.

The misleading diagram is one clean ER model with arrows that look like enforced foreign keys. Most important joins are logical: normalized names, slugs, torrent hashes, or qualified provider IDs. SQLite does not guarantee all the relationships the product relies on.

## Table families

```mermaid
flowchart TB
  subgraph RSS[RSS execution and acquisition]
    runs
    feed_items
    feed_item_outcomes
    candidate_state
  end
  subgraph INT[Intent and identity decisions]
    tracked_shows
    tv_tmdb_rejections
  end
  subgraph MAN[Manual and adopted acquisition]
    manual_grabs
    manual_movie_grabs
    manual_grab_failures
    torrent_error_observations
  end
  subgraph META[TMDB and chart caches]
    tmdb_movie_cache
    tmdb_tv_cache
    tmdb_tv_season_cache
    top_movies_cache
  end
  subgraph PLEX[Plex observation and auth]
    plex_movie_cache
    plex_tv_cache
    plex_tv_season_completion
    plex_movie_catalog_cache
    plex_movie_sync_state
    plex_tv_sync_state
    plex_auth_identity
    plex_auth_sessions
  end
  RSS -. logical identity .-> META
  MAN -. IDs and hashes .-> META
  MAN -. observation .-> PLEX
  INT -. show identity .-> META
```

The dashed lines are intentional: application-level joins, not guaranteed parents.

## RSS tables answer process questions

`runs` records execution. `feed_items` records provider sightings. `feed_item_outcomes` records why a sighting did or did not produce work. `candidate_state` tracks the durable lifecycle of an accepted RSS identity.

These shapes assume feed provenance: run, feed, GUID/link, rule, normalized title. A manual grab has none of that. Forcing it into `candidate_state` would require invented feed identities. Separate manual ledgers avoided corrupting the meaning of RSS data.

## Manual ledgers answer operator-choice questions

`manual_grabs` is TV-shaped: show identity, season/episode context, release choice, torrent identity, and adoption provenance. `manual_movie_grabs` is movie-shaped around TMDB identity. Failed submissions live separately because an attempt Transmission rejected must not appear as an acquisition.

Season packs make the TV shape especially useful. One selected torrent can later resolve into multiple episode observations while preserving the original choice.

## Caches answer dated external questions

TMDB tables avoid repeating expensive metadata calls and provide stable enrichment joins. Plex tables store observations and separate sync timestamps. Auth tables support connection lifecycle, not media truth. The movie catalog cache enables ownership reconciliation without turning every render into a live Plex crawl.

## Additive migrations are a v1 strength

Schema code creates missing tables, adds absent columns, and builds indexes. That makes upgrades safer for long-lived installations. The trade is historical irregularity: old rows may lack later fields and docs can drift.

The right November work is a verified schema inventory and migration tests against old fixtures—not a grand normalization project.

## A cleaner v2 vocabulary

V2 could center `MediaIdentity`, `ReleaseCandidate`, `AcquisitionAttempt`, `AcquisitionEvent`, and `LibraryObservation`. It can still use SQLite. The improvement is conceptual cohesion, not a larger database.

### In plain English

The database is a filing cabinet with drawers for different jobs. Some folders refer to the same movie by a TMDB number or torrent hash, but a metal bar does not physically lock every folder together. The application must join them correctly.

### Key takeaway

Separate ledgers preserve honest provenance. Improve their contracts and documentation before trying to merge them.
