---
title: What Is Fact, Inference, or Advice?
description: How this guide separates source evidence, runtime measurement, operator claims, interpretation, and redesign recommendations.
---

Architecture writing becomes untrustworthy when it presents every sentence with the same certainty. This guide uses several kinds of evidence, and they are not interchangeable.

## Evidence labels

| Label | Meaning | Example |
|---|---|---|
| **Source fact** | Directly visible in current code/schema/config | The layout starts eight reads with `Promise.allSettled`. |
| **Runtime observation** | Measured on a named machine at a named time | A cold movie-calendar sample took about 5.2 seconds on the M1 Mac. |
| **Persisted-data observation** | Count/query against current SQLite or Plex data | Plex added 589 movie records in the measured window. |
| **Operator assertion** | Known from the owner, not independently provable from one system | All new Plex media in the period came through Pirate Claw. |
| **Inference** | Best explanation joining facts; may have alternatives | Cache miss/provider enrichment explains the cold calendar gap. |
| **Recommendation** | A proposed design or product decision | Use a Hono strangler migration in v2. |

When the distinction matters, the prose names it. “Plex proves 1,472 playable additions” is a data observation. “Pirate Claw acquired all of them” relies on the operator assertion plus supporting history. “This validates a $99 price” would be an inference and a weak one without customer evidence.

## Important vocabulary

**Candidate** — a normalized release Pirate Claw evaluated, particularly in the RSS path.

**Release** — one downloadable artifact or torrent, not the abstract movie/show.

**Media identity** — the movie, show, season, or episode independent of release; usually anchored to TMDB in v1.

**Ledger** — durable history of intent, attempt, result, or adoption. It should not be mistaken for live external state.

**Cache** — a dated local copy of provider/library information.

**Reconciliation** — revisiting known work to observe its later state.

**Adoption** — recognizing relevant work or files that lack the expected Pirate Claw history.

**Ownership** — present-library evidence, usually from Plex; not copyright language and not acquisition provenance.

**Invalidation** — telling SvelteKit that loaded data may be stale and should rerun. A key targets load functions that declared the key; it does not patch one field magically.

**Cold path** — work when cache/snapshot/provider state is not already warm.

**Warm path** — work served from prepared local state. Useful, but not a substitute for measuring cold behavior.

## The machines in this guide

The NAS is operational evidence: it has real history, constrained hardware, real failures, and a meaningful Plex library. It is not the target performance profile.

The MacBook Air M1 with 16 GB is closer to the intended M-series Mac mini customer. Performance judgments are based there unless explicitly labeled NAS. Even then, one developer Mac is not a benchmark lab; numbers are directional measurements of current behavior.

## The date matters

This guide describes v1 as of September 19, 2026. Provider licenses, API behavior, pricing, and code can change. External claims link to current official sources where practical. Runtime values should be refreshed before a launch decision.

## Reading diagrams honestly

Mermaid arrows describe conceptual flow unless a chapter explicitly says they are database constraints. Dashed database relationships are logical joins. State diagrams simplify implementation states to teach the lifecycle; source remains authoritative for exact enums.

### In plain English

Some statements come from opening the machine, some from timing it, some from the owner’s experience, and some are my professional judgment. This page tells you which kind you are reading so a plausible story does not masquerade as proof.

### Key takeaway

Good architecture advice shows its evidence and uncertainty. Treat source, measurements, operator knowledge, and recommendations as different layers.
