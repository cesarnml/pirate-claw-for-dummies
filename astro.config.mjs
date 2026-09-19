// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import rehypeTts from './src/plugins/rehype-tts.mjs';
import { sidebar } from './src/sidebar.mjs';

export default defineConfig({
  site: 'https://pirate-claw-for-dummies.vercel.app',
  markdown: {
    rehypePlugins: [rehypeTts],
  },
  integrations: [
    mermaid({ theme: 'neutral', autoTheme: true, enableLog: false }),
    starlight({
      title: 'Pirate Claw for Dummies',
      description: 'A narrated, plain-English field guide to Pirate Claw v1: its daemon, web UI, data, providers, and future Mac product.',
      favicon: '/favicon.svg',
      lastUpdated: true,
      components: {
        PageTitle: './src/components/PageTitle.astro',
      },
      customCss: [
        '@fontsource-variable/inter/wght.css',
        '@fontsource-variable/newsreader/wght.css',
        '@fontsource-variable/jetbrains-mono/wght.css',
        './src/styles/theme.css',
        './src/styles/custom.css',
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      sidebar,
    }),
  ],
});
