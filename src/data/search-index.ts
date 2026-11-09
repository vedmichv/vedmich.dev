import { getCollection } from 'astro:content';
import { getAlternateLocale, t, type Locale } from '../i18n/utils';
import { bookAuthors } from './social';
import { normalizeText, type SearchItem } from './search-match';
import { h2Headings, leadText } from './search-text';

export type { SearchItem, SearchKind } from './search-match';

const POST_LEAD_CHARS = 400;
const TALK_LEAD_CHARS = 300;

/** Drop empty optional fields so the inline JSON stays small. */
function compact(item: SearchItem): SearchItem {
  const out: SearchItem = { ...item };
  if (!out.headings?.length) delete out.headings;
  if (!out.meta) delete out.meta;
  return out;
}

/** "2025-05-24 · devopsdays Tashkent": the city is added only when the event name does not carry it. */
function eventLine(date: string, event: string, city: string | null): string {
  const showCity = city && !normalizeText(event).includes(normalizeText(city));
  return [date, event, showCity ? city : null].filter(Boolean).join(' · ');
}

export async function buildSearchIndex(locale: Locale): Promise<SearchItem[]> {
  const i = t(locale);
  const label = {
    slides: i.search.kind_slides,
    post: i.search.kind_post,
    talk: i.search.kind_talk,
    page: i.search.kind_page,
  };

  // City names are localized (Košice, Кошице): an entry also carries the city of its other-locale twin,
  // so a query in either script finds it. Drafts are filtered out of the twin lookup too.
  const alt = getAlternateLocale(locale);
  const stripLocale = (id: string, from: Locale) => id.slice(from.length + 1);

  const decks = await getCollection('presentations', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });
  const altDecks = await getCollection('presentations', ({ id, data }) => {
    return !data.draft && id.startsWith(`${alt}/`);
  });
  const altDeckCity = new Map(altDecks.map((entry) => [stripLocale(entry.id, alt), entry.data.city]));

  const slideItems: SearchItem[] = decks.map((entry) => {
    const slug = entry.id.replace(new RegExp(`^${locale}/`), '');
    const dateStr = entry.data.date.toISOString().slice(0, 10);
    return compact({
      kind: 'slides',
      title: entry.data.title,
      sub: `${dateStr} · ${entry.data.event}`,
      url: entry.data.slides ?? `/slides/${slug}/`,
      tags: entry.data.tags,
      body: entry.data.description,
      date: dateStr,
      meta: [label.slides, entry.data.city, altDeckCity.get(slug)].filter(Boolean).join(' '),
    });
  });

  const talks = await getCollection('speaking', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });
  const altTalks = await getCollection('speaking', ({ id, data }) => {
    return !data.draft && id.startsWith(`${alt}/`);
  });
  const altTalkCity = new Map(altTalks.map((entry) => [stripLocale(entry.id, alt), entry.data.city]));

  const talkItems: SearchItem[] = talks.map((entry) => {
    const slug = entry.id.replace(new RegExp(`^${locale}/`), '');
    const dateStr = entry.data.date.toISOString().slice(0, 10);
    return compact({
      kind: 'talk',
      title: entry.data.title,
      sub: eventLine(dateStr, entry.data.event, entry.data.city),
      url: `/${locale}/speaking/${slug}/`,
      tags: entry.data.tags,
      body: leadText(entry.body ?? '', TALK_LEAD_CHARS),
      date: dateStr,
      meta: [label.talk, i.speaking.title, entry.data.city, altTalkCity.get(slug)].filter(Boolean).join(' '),
    });
  });

  const blog = await getCollection('blog', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });

  const postItems: SearchItem[] = blog.map((entry) => {
    const idWithoutLocale = entry.id.replace(new RegExp(`^${locale}/`), '');
    const dateStr = entry.data.date.toISOString().slice(0, 10);
    const source = entry.body ?? '';
    const lead = leadText(source, POST_LEAD_CHARS);
    return compact({
      kind: 'post',
      title: entry.data.title,
      sub: dateStr,
      url: `/${locale}/blog/${idWithoutLocale}/`,
      tags: entry.data.tags,
      // The description is written for readers and carries the key terms; the lead adds the body.
      body: `${entry.data.description} ${lead}`.trim(),
      date: dateStr,
      headings: h2Headings(source),
      meta: label.post,
    });
  });

  // Home page sections. Text comes from the same i18n strings the sections render.
  const pageSource: SearchItem[] = [
    {
      kind: 'page',
      title: i.podcasts.dkt_name,
      sub: i.nav.podcasts,
      url: `/${locale}/#podcasts`,
      tags: [],
      body: i.podcasts.dkt_desc,
      date: '',
      meta: label.page,
    },
    {
      kind: 'page',
      title: i.podcasts.aws_name,
      sub: i.nav.podcasts,
      url: `/${locale}/#podcasts`,
      tags: [],
      body: i.podcasts.aws_desc,
      date: '',
      meta: label.page,
    },
    {
      kind: 'page',
      title: i.book.name,
      sub: i.nav.book,
      url: `/${locale}/#book`,
      tags: [],
      body: i.book.desc,
      date: '',
      // Both spellings of the authors, so a Latin query finds the Russian page and the other way round.
      meta: [label.page, bookAuthors.en, bookAuthors.ru, 'Amazon'].join(' '),
    },
  ];
  const pageItems = pageSource.map(compact);

  return [...slideItems, ...talkItems, ...postItems, ...pageItems];
}
