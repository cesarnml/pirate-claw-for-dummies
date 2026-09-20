---
title: Mac Target, NAS Evidence
description: Current M1 route measurements, what the NAS taught operationally, and why the two machines answer different questions.
---

The Synology NAS is where Pirate Claw accumulated real data and scars. The M-series Mac is the customer performance target. Treating them as interchangeable would either excuse a slow product or discard useful evidence from the harder environment.

## What each machine can tell us

| Question | NAS | M-series Mac |
|---|---|---|
| Does state survive weeks of real use? | Strong evidence | Also testable |
| Do recovery/adoption paths meet messy history? | Strong evidence | Less history today |
| What should navigation feel like? | No; hardware is intentionally old | Yes; primary decision basis |
| Can background work cause contention? | Excellent warning signal | Must validate under target load |
| Is deployment safe and repeatable? | NAS runbook evidence | Packaging/runbook evidence |

## A current Mac snapshot

Measurements on the MacBook Air M1, 16 GB, Bun 1.4.0 show two stories: local steady-state reads are generally fast, while cold external/enrichment work and payload size remain the meaningful risks.

| Endpoint | First observed sample | Warm behavior (five samples) | Approx. payload |
|---|---:|---:|---:|
| `/api/health` | 2.1 ms | local/fast | 702 B |
| `/api/config` | 0.9 ms | local/fast | 10 KB |
| `/api/status` | 134 ms | 65–76 ms | 1 KB |
| `/api/candidates` | 11 ms | 8–10 ms | 188 KB |
| `/api/movies` | 7 ms | 5–6 ms | 49 KB |
| `/api/shows` | 50 ms | about 1 ms after snapshot | 122 KB |
| movie calendar | 5.2 s | 8–12 ms after cache | 25 KB |
| TV calendar | 724 ms | about 1–2 ms after cache | 22 KB |
| Transmission session | 8 ms | local/fast | 335 B |

These are observations, not benchmark guarantees. They were not collected across many devices, networks, or cold installs. They are still enough to reject two bad conclusions:

1. “The app is slow because the NAS is old.” The Mac shows most local endpoints can be fast.
2. “The app is fast because warm endpoints are single-digit milliseconds.” The first discovery calls and large hydration payloads remain customer-visible.

## The NAS contention lesson

NAS logs recorded severe event-loop lag, repeatedly in the range of roughly 17–28 seconds, while scheduled work and requests competed. A timer firing late proves the process was not scheduled promptly; it does not identify a culprit by itself.

Evidence supports broad scheduling/memory/I/O contention with request amplification. Plex scans are a plausible contributor, not a proven sole cause. This distinction matters: restarting or blaming one service may hide the architecture pattern that multiple background and page-triggered jobs can overlap.

The response included safer reconciliation cadence, non-overlapping browser pollers, snapshot-backed reads, and caution around bulk Plex work.

## What to measure before launch

For each major route on the Mac:

- cold direct-link time and warm client navigation;
- daemon call count, including inherited layout calls;
- slowest dependency and retry count;
- transferred SvelteKit data and hydration cost on iPad/mobile;
- event-loop lag and memory while Dashboard is idle;
- mutation-to-stable-UI time;
- provider failure and cache-miss behavior;
- hidden-tab traffic (expected to pause).

For each long operation, measure whether the browser owns it and what happens on disconnect.

## Operational deployment boundaries

NAS web releases should preserve configuration and avoid recreating Transmission/Gluetun unless explicitly required. The downloader’s VPN/network namespace is not collateral deployment state.

Mac local development has its own trap: restarting the web process without the exact session secret and API write-token environment can return HTTP 200 while rendering “Session secret not configured” or “Service unavailable.” Smoke tests must inspect content, not status alone.

### In plain English

The NAS is the overloaded old truck that reveals weak suspension. The Mac is the car customers will drive and therefore sets the speed and comfort target. We learn failure physics from one and product feel from the other.

### Key takeaway

Use the NAS for operational truth and the Mac for performance decisions. Always measure cold provider paths and browser payloads, not only warm daemon latency.
