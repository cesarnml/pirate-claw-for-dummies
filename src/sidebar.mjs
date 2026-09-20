/** One source of truth for reading order, narration auto-advance, and navigation. */
export const sidebar = [
  { label: 'Orientation', items: [
    { label: 'Read the system before the code', slug: 'start-here/the-big-picture' },
    { label: 'What is fact, inference, or advice?', slug: 'start-here/evidence-and-vocabulary' },
    { label: 'A request from tap to library', slug: 'start-here/walking-tour' },
  ]},
  { label: 'The engine room', items: [
    { label: 'Processes and boundaries', slug: 'architecture/process-map' },
    { label: 'The daemon and its clocks', slug: 'architecture/daemon-and-workers' },
    { label: 'RSS intake and candidate policy', slug: 'architecture/rss-and-policy' },
    { label: 'Manual acquisition paths', slug: 'architecture/manual-acquisition' },
    { label: 'Reconciliation and adoption', slug: 'architecture/reconciliation-and-adoption' },
    { label: 'Transmission is an actuator', slug: 'architecture/transmission' },
    { label: 'Plex is the ownership witness', slug: 'architecture/plex' },
    { label: 'TMDB and release providers', slug: 'architecture/metadata-and-providers' },
  ]},
  { label: 'Memory and identity', items: [
    { label: 'Who owns each fact?', slug: 'architecture/data-and-truth' },
    { label: 'SQLite schema tour', slug: 'architecture/database-tour' },
    { label: 'Identity is the hard problem', slug: 'architecture/identity-and-matching' },
    { label: 'Caches, freshness, and fallbacks', slug: 'architecture/caches-and-freshness' },
  ]},
  { label: 'The web application', items: [
    { label: 'Web-to-daemon contract', slug: 'architecture/typed-daemon-boundary' },
    { label: 'Layout and global background work', slug: 'routes/layout' },
    { label: 'Dashboard', slug: 'routes/dashboard' },
    { label: 'Movies archive', slug: 'routes/movies' },
    { label: 'Movie discovery', slug: 'routes/movie-discovery' },
    { label: 'Shows library', slug: 'routes/shows' },
    { label: 'Show detail and episode grabs', slug: 'routes/show-detail' },
    { label: 'TV discovery', slug: 'routes/tv-discovery' },
    { label: 'Configuration and onboarding', slug: 'routes/configuration' },
    { label: 'Events and update cascades', slug: 'architecture/event-cascades' },
  ]},
  { label: 'Operating v1', items: [
    { label: 'Mac target, NAS evidence', slug: 'operations/mac-and-nas' },
    { label: 'Observability and debug logs', slug: 'operations/observability-and-debugging' },
    { label: 'Failure playbook', slug: 'operations/failure-playbook' },
    { label: 'What must ship by November 1', slug: 'strategy/v1-ship-line' },
  ]},
  { label: 'Product and v2', items: [
    { label: 'Providers, licenses, and lock-in', slug: 'reference/providers-and-licensing' },
    { label: 'The Mac app path', slug: 'strategy/mac-product' },
    { label: 'Value and pricing', slug: 'strategy/value-and-pricing' },
    { label: 'If we started fresh', slug: 'strategy/rebuild-and-roadmap' },
    { label: 'The v2 system design tutorial', slug: 'strategy/v2-system-design' },
  ]},
];

export const readingOrder = [
  { label: 'Pirate Claw for Dummies', slug: 'index', section: 'Orientation' },
  ...sidebar.flatMap((group) => group.items.map((item) => ({ ...item, section: group.label }))),
];
