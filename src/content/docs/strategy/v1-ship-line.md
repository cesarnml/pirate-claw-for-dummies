---
title: What Must Ship by November 1
description: A disciplined v1 line that protects proven behavior and keeps attractive v2 rewrites from becoming launch regressions.
---

The purpose of a ship line is not to stop caring about architecture. It is to put architectural care where it reduces customer risk now.

## Define the release first

The current source/NAS application and a commercial drag-and-drop Mac DMG are different readiness levels. November 1 must name one. This guide assumes v1 means the working local/self-hosted application stabilized for its supported environment, while consumer Mac packaging continues as a dedicated product track.

If the date instead means a paid DMG, scope must explicitly include supervision, bundled/external Transmission decisions, signing, notarization, upgrades, onboarding, reset, diagnostics, licensing, and clean-machine testing. Those cannot be implied.

## Pre-ship correctness

- Add and integration-test the missing SvelteKit proxies for readiness, trusted origin, and network posture.
- Verify every acquisition path with expected provenance: RSS movie, three manual movie discovery surfaces, RSS TV, track-and-replay, episode grab, season pack, Transmission adoption, filesystem adoption.
- Exercise a cold profile with no TMDB key and document the exact reduced experience.
- Preserve `unknown` versus `missing` through Plex outages.
- Test login/setup body content after web restart, not status only.
- Test old-database migrations and backup/restore.

## Pre-ship performance and UX

- Capture route call count, cold/warm latency, payload bytes, and stable-paint time on the M-series Mac.
- Narrow the known broad invalidations: movie delete, Shows bulk refresh, dashboard failure actions, post-grab movie discovery, and Config sync completion.
- Reuse duplicate layout reads in Config/Onboarding where ETag/auth semantics remain intact.
- Verify mobile/iPad splash, app icon, scrolling, deep links, and no position jump after movie deletion.

## Pre-ship supportability

- Document logs, data, config, backup, and recovery locations.
- Add structured job counters and skipped-cycle reasons.
- Create and test a redaction procedure before requesting diagnostics from a customer.
- Publish dependency/attribution notices and resolve commercial metadata terms.
- Keep NAS deployment boundaries explicit: preserve config and downloader/VPN topology.

## Freeze until v2

- TMDB replacement or provider-neutral identity migration.
- Ledger unification.
- Full Hono/router rewrite.
- Event sourcing rewrite.
- WebSocket conversion.
- Generic multi-media-server support.
- Automated Plex library creation via unverified interfaces.

These may be valuable. They do not reduce November risk enough to justify their blast radius.

## Exit criteria

V1 is ready when a clean supported installation can complete one movie and one season/episode workflow; restart without losing auth/config/history; show actionable failures; recover from provider/Plex/Transmission unavailability; update the UI without disruptive broad reloads; and produce diagnostics that support can interpret safely.

### In plain English

Finish the house’s wiring, labels, smoke alarms, and front door before redesigning the floor plan. Be explicit about whether November delivers the house itself or also a turnkey real-estate business.

### Key takeaway

Ship correctness, recovery, performance evidence, and supportability. Freeze identity, data-model, and framework migrations until the product has crossed the line.
