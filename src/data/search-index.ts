import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/utils';
import { presentations } from './social';

export type SearchItem = {
  kind: 'slides' | 'post';
  title: string;
  sub: string;
  url: string;
  tags: readonly string[];
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
  const slideItems: SearchItem[] = presentations.map((p) => {
    const override = (p as any).locale_urls?.[locale] as string | undefined;
    const url = override ?? `https://s.vedmich.dev/${p.slug}`;
    return {
      kind: 'slides',
      title: p.title,
      sub: `${p.date} · ${p.event}`,
      url,
      tags: p.tags,
      body: p.description,
      date: p.date,
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
