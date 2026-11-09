import type { Locale } from '../i18n/utils';

/** Search results show about 60 characters of a title and about 155 of a description. */
export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

const SITE_NAME: Record<Locale, string> = {
  en: 'Viktor Vedmich',
  ru: 'Виктор Ведмич',
};

/**
 * Append the site name to a page title only when the result still fits the title
 * limit. A long title is more useful to a reader than a clipped title with a brand.
 */
export function pageTitle(title: string, locale: Locale): string {
  const branded = `${title} · ${SITE_NAME[locale]}`;
  return branded.length <= TITLE_LIMIT ? branded : title;
}

/** Day-month-year with a month name: "5 October 2026" / "5 октября 2026". */
export function formatDate(date: Date, locale: Locale): string {
  const text = date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  // ru-RU appends a year marker ("2026 г."); the rest of the site drops it.
  return locale === 'ru' ? text.replace(/\s*г\.?$/, '') : text;
}

/** Strip Markdown syntax so a body can be used as meta description text. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Meta description from a Markdown body: whole sentences when they fit the limit,
 * otherwise a cut at a word boundary with an ellipsis. Never longer than `limit`.
 */
export function summarize(
  markdown: string | undefined,
  fallback: string,
  limit: number = DESCRIPTION_LIMIT,
): string {
  const plain = toPlainText(markdown ?? '');
  if (!plain) return fallback;
  if (plain.length <= limit) return plain;

  // Longest run of complete sentences that fits. Require most of the room so a
  // short first sentence does not become a thin description.
  let sentenceEnd = 0;
  for (const match of plain.matchAll(/[.!?](?=\s|$)/g)) {
    const end = match.index + 1;
    if (end > limit) break;
    sentenceEnd = end;
  }
  if (sentenceEnd >= limit * 0.7) return plain.slice(0, sentenceEnd);

  const room = limit - 1;
  const cut = plain.lastIndexOf(' ', room);
  const head = plain.slice(0, cut > 0 ? cut : room).replace(/[\s,;:(\-]+$/, '');
  return `${head}…`;
}
