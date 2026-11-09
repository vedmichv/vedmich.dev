import type { Locale } from '../i18n/utils';

/** The slice of a blog collection entry that the feed reads. */
export interface FeedEntry {
  id: string;
  data: {
    title: string;
    description: string;
    date: Date;
    draft: boolean;
  };
}

export interface FeedItem {
  title: string;
  description: string;
  /** Absolute URL with a trailing slash, like the canonical URL of the post. */
  link: string;
  pubDate: Date;
}

/** Localized channel metadata. The descriptions repeat the blog index meta descriptions. */
export const FEED_CHANNEL: Record<Locale, { title: string; description: string; language: string }> = {
  en: {
    title: 'Viktor Vedmich: Blog',
    description:
      'Notes on Kubernetes, cloud architecture and AI agents from Viktor Vedmich, Senior Solutions Architect at AWS.',
    language: 'en',
  },
  ru: {
    title: 'Виктор Ведмич: блог',
    description:
      'Заметки про Kubernetes, облачную архитектуру и AI-агентов. Пишет Виктор Ведмич, Senior Solutions Architect в AWS.',
    language: 'ru',
  },
};

/** Public path of the feed of one locale. */
export function feedPath(locale: Locale): string {
  return `/${locale}/rss.xml`;
}

function slugOf(id: string, locale: Locale): string {
  return id.slice(locale.length + 1);
}

/**
 * Whether a post belongs in the feed of `locale`. Same rule as the blog index and the
 * sitemap: a draft is public but unlisted, and a `__` slug is a test fixture.
 */
export function isFeedPost(entry: FeedEntry, locale: Locale): boolean {
  return (
    entry.id.startsWith(`${locale}/`) &&
    !entry.data.draft &&
    !slugOf(entry.id, locale).startsWith('__')
  );
}

/** Feed posts of one locale, newest first. Equal dates fall back to the slug so the order is stable. */
export function selectFeedPosts<T extends FeedEntry>(entries: readonly T[], locale: Locale): T[] {
  return entries
    .filter((entry) => isFeedPost(entry, locale))
    .sort(
      (a, b) =>
        b.data.date.valueOf() - a.data.date.valueOf() ||
        (a.id < b.id ? 1 : a.id > b.id ? -1 : 0),
    );
}

export function toFeedItems(entries: readonly FeedEntry[], locale: Locale, site: URL | string): FeedItem[] {
  return selectFeedPosts(entries, locale).map((entry) => ({
    title: entry.data.title,
    description: entry.data.description,
    link: new URL(`/${locale}/blog/${slugOf(entry.id, locale)}/`, site).href,
    pubDate: entry.data.date,
  }));
}

/**
 * Options for `@astrojs/rss`. Items carry the description only, never the post body.
 * The package escapes every text value, so titles and descriptions can hold `&`, `<` and quotes.
 */
export function feedOptions(locale: Locale, entries: readonly FeedEntry[], site: URL | string) {
  const channel = FEED_CHANNEL[locale];
  const self = new URL(feedPath(locale), site).href;
  return {
    title: channel.title,
    description: channel.description,
    // The channel link: the blog index of this locale, not the site root.
    site: new URL(`/${locale}/blog/`, site).href,
    items: toFeedItems(entries, locale, site),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    // `language` has no dedicated option; atom:link rel="self" is what feed validators recommend.
    customData: `<language>${channel.language}</language><atom:link href="${self}" rel="self" type="application/rss+xml" />`,
  };
}
