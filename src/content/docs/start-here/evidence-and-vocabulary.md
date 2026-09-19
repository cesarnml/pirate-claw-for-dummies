---
title: Evidence and Vocabulary
description: The words Pirate Claw uses, and how to keep observations separate from plans.
---

This guide is an **as-built v1 field guide**, captured while the release is
being prepared for November 1, 2026. A documentation claim is either code
structure, a host snapshot, or a design opinion. They are not interchangeable.

## Evidence snapshot

On the Mac capture, the daemon health endpoint returned successfully and the
active cycle was idle. The Mac checkout was at `bbde5aa`. On the NAS capture,
SQLite contained 291 RSS candidate-state rows, 1,249 TV manual/adopted rows,
4,076 movie manual/adopted rows, 108 tracked shows, and 157 cached TV metadata
rows. Those counts are a dated operational sample, not product limits or
benchmark numbers.

## Vocabulary

| Term | Technical meaning | Plain English |
| --- | --- | --- |
| Candidate | A release Pirate Claw considered | A possible download |
| Manual grab | A human-picked release recorded in a dedicated ledger | “I chose this one” |
| Reconcile | Compare local records with live systems | Check whether reality changed |
| Adopt | Recognize a file or torrent that exists already | “Oh, that belongs to this show/movie” |
| In library | Plex confirms presence | Plex can see it |
| Unknown | A check could not prove either answer | Do not mistake this for missing |

## In plain English

“Missing” and “unknown” are very different. Missing means a successful check
did not find the title. Unknown means Pirate Claw could not perform a reliable
check. Good software does not turn uncertainty into a red failure badge.

## Key takeaway

The guide can be opinionated about v2, but it should never rewrite the facts of
v1 to make the story cleaner.
