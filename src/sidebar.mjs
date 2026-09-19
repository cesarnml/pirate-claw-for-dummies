/** One source of truth for reading order, narration auto-advance, and navigation. */
export const sidebar = [
  {
    label: 'Start here',
    items: [
      { label: 'The big picture', slug: 'start-here/the-big-picture' },
      { label: 'Evidence and vocabulary', slug: 'start-here/evidence-and-vocabulary' },
    ],
  },
  {
    label: 'How v1 works',
    items: [
      { label: 'Daemon and background work', slug: 'architecture/daemon-and-workers' },
      { label: 'Data, caches, and truth', slug: 'architecture/data-and-truth' },
      { label: 'Acquisition pipeline', slug: 'architecture/acquisition-pipeline' },
      { label: 'Routes, requests, and idle work', slug: 'architecture/route-atlas' },
      { label: 'Events and update cascades', slug: 'architecture/event-cascades' },
      { label: 'Typed daemon boundary and Hono', slug: 'architecture/typed-daemon-boundary' },
    ],
  },
  {
    label: 'Operating and evolving it',
    items: [
      { label: 'Mac target, NAS evidence', slug: 'operations/mac-and-nas' },
      { label: 'Observability and debug logs', slug: 'operations/observability-and-debugging' },
      { label: 'Providers, TMDB, Plex, and licensing', slug: 'reference/providers-and-licensing' },
      { label: 'If we started fresh', slug: 'strategy/rebuild-and-roadmap' },
      { label: 'Value and pricing experiment', slug: 'strategy/value-and-pricing' },
    ],
  },
];

export const readingOrder = [
  { label: 'Pirate Claw for Dummies', slug: 'index', section: 'Start here' },
  ...sidebar.flatMap((group) => group.items.map((item) => ({ ...item, section: group.label }))),
];
