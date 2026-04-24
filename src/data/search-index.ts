import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/utils';

export type SearchItem = {
  kind: 'slides' | 'post';
  title: string;
  sub: string;
  url: string;
  tags: string[];
  body: string;
  date: string;
};

export function fuzzyScore(q: string, item: SearchItem): number {
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const hay = `${item.title} ${item.body} ${item.tags.join(' ')} ${item.kind}`.toLowerCase();
  if (item.title.toLowerCase().includes(needle)) return 100 - item.title.length * 0.1;
  if (hay.includes(needle)) return 60;
  const tokens = needle.split(/\s+/).filter(Boolean);
  if (tokens.every((t) => hay.includes(t))) return 30;
  return 0;
}

export async function buildSearchIndex(locale: Locale): Promise<SearchItem[]> {
  const decks = await getCollection('presentations', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });

  const slideItems: SearchItem[] = decks.map((entry) => {
    const slug = entry.id.replace(new RegExp(`^${locale}/`), '');
    const dateStr = entry.data.date.toISOString().slice(0, 10);
    return {
      kind: 'slides',
      title: entry.data.title,
      sub: `${dateStr} · ${entry.data.event}`,
      url: `https://s.vedmich.dev/${slug}`,
      tags: entry.data.tags,
      body: entry.data.description,
      date: dateStr,
    };
  });

  const blog = await getCollection('blog', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });

  const postItems: SearchItem[] = blog.map((entry) => {
    const idWithoutLocale = entry.id.replace(new RegExp(`^${locale}/`), '');
    const dateStr = entry.data.date.toISOString().slice(0, 10);
    return {
      kind: 'post',
      title: entry.data.title,
      sub: dateStr,
      url: `/${locale}/blog/${idWithoutLocale}`,
      tags: entry.data.tags ?? [],
      body: entry.data.description,
      date: dateStr,
    };
  });

  return [...slideItems, ...postItems];
}
