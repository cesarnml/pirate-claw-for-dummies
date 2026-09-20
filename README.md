# Pirate Claw for Dummies

A narrated, evidence-oriented field guide to Pirate Claw v1: the local daemon,
web UI, SQLite state, Transmission, Plex, RSS and metadata providers.

## Development

```sh
npm install
npm run build
npm run narrate
npm run build
npm run dev
```

Narration is generated from built HTML, so spoken sentences and visible sentence
highlights stay aligned. Generated MP3 and timing files live in `public/audio/`.
Synthesis uses two workers by default; set `KOKORO_WORKERS=1` on a constrained
machine.
