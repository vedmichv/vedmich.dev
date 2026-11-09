import type { Locale } from '../i18n/utils';

/** The slice of a talk or deck collection entry that cross-linking reads. */
export interface LinkableEntry {
  id: string;
  data: {
    title: string;
    event: string;
    city: string | null;
    date: Date;
    video?: string;
    slides?: string;
    post?: string;
    draft: boolean;
  };
}

/** One "this post grew out of" line, normalized from a talk or a deck. */
export interface PostOrigin {
  title: string;
  /** Event name; null for a deck that is not tied to a real event. */
  event: string | null;
  date: Date;
  /** Talk page; null for a deck, which has no page of its own on this site. */
  href: string | null;
  video?: string;
  slides?: string;
}

function slugOf(id: string): string {
  return id.replace(/^(en|ru)\//, '');
}

/**
 * Talks and decks of one locale whose `post` equals the given post URL.
 * A deck for the same event and date as a matched talk is folded into that
 * talk as its slides link instead of becoming a duplicate line.
 */
export function findPostOrigins(
  postUrl: string,
  locale: Locale,
  talks: LinkableEntry[],
  decks: LinkableEntry[],
): PostOrigin[] {
  const inLocale = (entry: LinkableEntry) => entry.id.startsWith(`${locale}/`) && !entry.data.draft;

  const origins: PostOrigin[] = talks
    .filter((talk) => inLocale(talk) && talk.data.post === postUrl)
    .map((talk) => ({
      title: talk.data.title,
      event: talk.data.event,
      date: talk.data.date,
      href: `/${locale}/speaking/${slugOf(talk.id)}/`,
      video: talk.data.video,
      slides: talk.data.slides,
    }));

  for (const deck of decks.filter((d) => inLocale(d) && d.data.post === postUrl)) {
    const deckUrl = deck.data.slides ?? `/slides/${slugOf(deck.id)}/`;
    const sameTalk = origins.find(
      (origin) =>
        origin.href !== null &&
        origin.event === deck.data.event &&
        origin.date.getTime() === deck.data.date.getTime(),
    );
    if (sameTalk) {
      sameTalk.slides ??= deckUrl;
      sameTalk.video ??= deck.data.video;
      continue;
    }
    origins.push({
      title: deck.data.title,
      // A deck without a city carries a descriptive label ("Concept deck"), not an event.
      event: deck.data.city ? deck.data.event : null,
      date: deck.data.date,
      href: null,
      video: deck.data.video,
      slides: deckUrl,
    });
  }

  return origins.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Other talks of the same locale, event and year as `current`, newest first. */
export function findSiblingTalks(current: LinkableEntry, talks: LinkableEntry[]): LinkableEntry[] {
  const locale = current.id.slice(0, 2);
  const year = current.data.date.getUTCFullYear();
  return talks
    .filter(
      (talk) =>
        talk.id !== current.id &&
        talk.id.startsWith(`${locale}/`) &&
        !talk.data.draft &&
        talk.data.event === current.data.event &&
        talk.data.date.getUTCFullYear() === year,
    )
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title));
}
