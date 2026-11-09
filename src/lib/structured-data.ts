import { socialLinks, skills } from '../data/social.ts';
import type { Locale } from '../i18n/utils';

export type JsonLd = Record<string, unknown>;

const PERSON_NAME: Record<Locale, string> = {
  en: 'Viktor Vedmich',
  ru: 'Виктор Ведмич',
};

/** Default author name stored in the blog schema; RU pages show it in Cyrillic. */
const DEFAULT_AUTHOR = 'Viktor Vedmich';

function absolute(site: string | URL, path: string): string {
  return new URL(path, site).href;
}

/** `YYYY-MM-DD` from a content date (parsed as UTC midnight). */
function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function personId(site: string | URL): string {
  return absolute(site, '/#person');
}

/**
 * JSON for an inline `<script type="application/ld+json">`. The less-than sign is
 * escaped so no string value can close the element or open a comment.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function graph(nodes: JsonLd[]): JsonLd {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

function withContext(node: JsonLd): JsonLd {
  return { '@context': 'https://schema.org', ...node };
}

export function personNode(site: string | URL, locale: Locale): JsonLd {
  const other: Locale = locale === 'en' ? 'ru' : 'en';
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: PERSON_NAME[locale],
    alternateName: PERSON_NAME[other],
    url: absolute(site, `/${locale}/`),
    jobTitle: 'Senior Solutions Architect',
    worksFor: {
      '@type': 'Organization',
      name: 'Amazon Web Services',
      url: 'https://aws.amazon.com/',
    },
    sameAs: socialLinks.map((link) => link.url),
    knowsAbout: [...skills],
  };
}

export function websiteNode(site: string | URL, locale: Locale, description: string): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': absolute(site, `/${locale}/#website`),
    url: absolute(site, `/${locale}/`),
    name: PERSON_NAME[locale],
    description,
    inLanguage: locale,
    author: { '@id': personId(site) },
    publisher: { '@id': personId(site) },
  };
}

/** Home page: the person and the website, linked through `@id`. */
export function homePageJsonLd(site: string | URL, locale: Locale, description: string): JsonLd {
  return graph([personNode(site, locale), websiteNode(site, locale, description)]);
}

interface BlogPostingInput {
  site: string | URL;
  locale: Locale;
  url: string;
  title: string;
  description: string;
  date: Date;
  author: string;
  tags: string[];
  /** Absolute or site-relative image path; falls back to the default social card. */
  image?: string;
}

export function blogPostingJsonLd(input: BlogPostingInput): JsonLd {
  const { site, locale, url, title, description, date, author, tags, image } = input;
  const isOwner = author === DEFAULT_AUTHOR;
  return withContext({
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: isoDay(date),
    author: isOwner
      ? { '@type': 'Person', '@id': personId(site), name: PERSON_NAME[locale], url: absolute(site, `/${locale}/`) }
      : { '@type': 'Person', name: author },
    inLanguage: locale,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: [absolute(site, image || '/og-default.png')],
    keywords: tags.join(', '),
  });
}

interface TalkEventInput {
  site: string | URL;
  locale: Locale;
  url: string;
  title: string;
  description: string;
  event: string;
  city: string;
  date: Date;
  video?: string;
}

/**
 * A talk is an Event. Every talk has a date and a city (both required by the
 * content schema), so no talk falls back to a plain CreativeWork. The page
 * language is not copied to the Event: a talk can be delivered in a different
 * language from the page that describes it.
 */
export function talkEventJsonLd(input: TalkEventInput): JsonLd {
  const { site, locale, url, title, description, event, city, date, video } = input;
  return withContext({
    '@type': 'Event',
    name: title,
    description,
    url,
    startDate: isoDay(date),
    location: {
      '@type': 'Place',
      name: city,
      address: { '@type': 'PostalAddress', addressLocality: city },
    },
    superEvent: { '@type': 'Event', name: event },
    performer: { '@type': 'Person', '@id': personId(site), name: PERSON_NAME[locale] },
    ...(video ? { recordedIn: { '@type': 'CreativeWork', name: title, url: video } } : {}),
  });
}
