// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://joebakcoleman.com',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  // Old al-folio permalinks → Astro routes (static meta-refresh on GitHub Pages).
  redirects: {
    '/blog/': '/writing/',
    '/blog/2023/pcurve/': '/blog/2023-03-10-pcurve/',
    '/blog/2023/Harvard/': '/blog/2023-06-20-harvard/',
    '/blog/2023/harvard/': '/blog/2023-06-20-harvard/',
    '/blog/2023/replication/': '/blog/2023-11-29-replication/',
    '/blog/2024/contrarian/': '/blog/2024-06-05-contrarian/',
    '/blog/2024/protzko/': '/blog/2024-09-24-protzko/',
    '/blog/2024/nosek/': '/blog/2024-11-19-nosek/',
    '/blog/2026/FDR/': '/blog/2026-07-04-fdr/',
    '/blog/2026/fdr/': '/blog/2026-07-04-fdr/',
    '/projects/': '/publications/',
    '/repositories/': '/publications/',
  },
});
