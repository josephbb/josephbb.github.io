import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getSite } from '../lib/site';

function plainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[_*#>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(context: { site?: URL }) {
  const site = getSite();
  const blog = await getCollection('blog');
  const news = await getCollection('news');

  const blogItems = blog.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.date,
    link: `/blog/${post.id}/`,
  }));

  const newsItems = news.map((item) => {
    const body = plainText((item as { body?: string }).body ?? '');
    const title = item.data.title?.trim() || body.slice(0, 110) || `News · ${item.id}`;
    return {
      title,
      description: body || title,
      pubDate: item.data.date,
      link: '/news/',
      // Distinct IDs so news entries don't collapse in readers.
      customData: `<guid isPermaLink="false">news:${item.id}</guid>`,
    };
  });

  const items = [...blogItems, ...newsItems].sort(
    (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf(),
  );

  return rss({
    title: site.short_name,
    description: site.tagline,
    site: context.site!,
    items,
  });
}
