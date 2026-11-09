/**
 * Search matcher shared by the build (types) and the browser (SearchPalette).
 *
 * Pure TypeScript with no Astro or DOM imports, so the Node test runner can load it.
 * Keep it erasable-syntax only (no enums, namespaces or parameter properties).
 *
 * Matching rules (all comparisons happen on normalized text):
 * 1. Normalize: lower-case, strip Latin diacritics (Kosice, Krakow), fold the few
 *    Latin letters that do not decompose (l with stroke, o with stroke), map
 *    the Russian yo to ye, drop apostrophes inside words and thousands commas.
 * 2. Tokenize on anything that is not a letter or digit. Compounds joined by
 *    ":", "." or "-" (re:Invent, kube-proxy) also index their joined form, so
 *    "reinvent" finds "re:Invent" and "re:invent" finds it through its two parts.
 * 3. Every query token must match somewhere in the item (AND). A token matches a
 *    word when it is: equal, a prefix of the word, a substring (3+ characters),
 *    a shared stem (both words 6+ letters sharing their first 5 letters, which
 *    covers Russian endings and English plurals), or one typo away (query token
 *    of 6+ characters, one insertion, deletion, substitution or adjacent swap,
 *    compared with the whole word, so "invent" does not match "investigates").
 * 4. Score: the best field for each token wins, fields weigh title 10, tags 6,
 *    sub line and hidden meta 5, H2 headings 5, body 2, multiplied by the match
 *    quality (exact 1.0, prefix 0.9, stem 0.7, substring 0.6, typo 0.5). The mean
 *    over tokens is scaled to 0..100 and an exact phrase in the title adds 20.
 */

export type SearchKind = 'post' | 'talk' | 'slides' | 'page';

export type SearchItem = {
  kind: SearchKind;
  title: string;
  /** Second line of the result row (date, event, section). Also searched. */
  sub: string;
  url: string;
  tags: readonly string[];
  /** Plain-text lead of the page. */
  body: string;
  /** ISO date, the sort key. Empty for section pages. */
  date: string;
  /** H2 headings of a post. */
  headings?: readonly string[];
  /** Searched but never displayed: city, co-authors, kind label, section name. */
  meta?: string;
};

export type ParsedQuery = {
  tokens: string[];
  phrase: string;
};

const FOLD: Record<string, string> = {
  'ß': 'ss',
  'æ': 'ae',
  'œ': 'oe',
  'ø': 'o',
  'ł': 'l',
  'đ': 'd',
  'ð': 'd',
  'þ': 'th',
  'ı': 'i',
};
const FOLD_RE = /[ßæœøłđðþı]/g;

/** Lower-case, strip diacritics, map yo to ye, drop in-word apostrophes and thousands commas. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(FOLD_RE, (c) => FOLD[c] ?? c)
    .normalize('NFD')
    // Only marks that follow a Latin letter are removed, so the Russian short i (U+0439) survives.
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    // The decomposed Russian yo (ie + combining diaeresis) becomes plain ie.
    .replace(/\u0435\u0308/g, '\u0435')
    .normalize('NFC')
    .replace(/(\p{L})['\u2019](?=\p{L})/gu, '$1')
    .replace(/(\d),(?=\d{3}(?!\d))/g, '$1');
}

const SPLIT_RE = /[^\p{L}\p{N}]+/u;
const COMPOUND_RE = /[\p{L}\p{N}]+(?:[:.\-][\p{L}\p{N}]+)+/gu;

/** Query tokens: normalized words, in order, without duplicates. */
export function tokenize(input: string): string[] {
  const words = normalizeText(input).split(SPLIT_RE).filter(Boolean);
  return Array.from(new Set(words));
}

/** Words of a haystack text: tokens plus the joined form of "a:b", "a.b" and "a-b" compounds. */
export function haystackWords(input: string): string[] {
  const text = normalizeText(input);
  const words = text.split(SPLIT_RE).filter(Boolean);
  for (const compound of text.match(COMPOUND_RE) ?? []) {
    words.push(compound.replace(/[:.\-]/g, ''));
  }
  return Array.from(new Set(words));
}

export function parseQuery(query: string): ParsedQuery | null {
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;
  return { tokens, phrase: tokens.join(' ') };
}

const STEM_LENGTH = 5;
const STEM_MIN_WORD = 6;
const TYPO_MIN_TOKEN = 6;
const SUBSTRING_MIN_TOKEN = 3;

function commonPrefixLength(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let i = 0;
  while (i < limit && a.charCodeAt(i) === b.charCodeAt(i)) i++;
  return i;
}

/** True when the two strings differ by at most one insertion, deletion, substitution or adjacent swap. */
export function withinOneEdit(a: string, b: string): boolean {
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  const i = commonPrefixLength(a, b);
  if (i === la && i === lb) return true;
  if (la === lb) {
    if (a.slice(i + 1) === b.slice(i + 1)) return true;
    return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
  }
  return la > lb ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
}

/** Match quality of one query token against one word: 0 (no match) to 1 (equal). */
export function wordQuality(token: string, word: string): number {
  if (word === token) return 1;
  if (word.startsWith(token)) return 0.9;
  let quality = 0;
  if (
    word.length >= STEM_MIN_WORD &&
    token.length >= STEM_MIN_WORD &&
    commonPrefixLength(token, word) >= STEM_LENGTH
  ) {
    quality = 0.7;
  }
  if (quality < 0.6 && token.length >= SUBSTRING_MIN_TOKEN && word.includes(token)) quality = 0.6;
  if (quality < 0.5 && token.length >= TYPO_MIN_TOKEN && withinOneEdit(token, word)) quality = 0.5;
  return quality;
}

const WEIGHT = { title: 10, tags: 6, meta: 5, headings: 5, body: 2 } as const;

type Prepared = {
  titleText: string;
  fields: ReadonlyArray<{ weight: number; words: string[] }>;
};

const prepared = new WeakMap<SearchItem, Prepared>();

function prepare(item: SearchItem): Prepared {
  let entry = prepared.get(item);
  if (!entry) {
    entry = {
      titleText: tokenize(item.title).join(' '),
      fields: [
        { weight: WEIGHT.title, words: haystackWords(item.title) },
        { weight: WEIGHT.tags, words: haystackWords(item.tags.join(' ')) },
        { weight: WEIGHT.meta, words: haystackWords(`${item.sub} ${item.meta ?? ''}`) },
        { weight: WEIGHT.headings, words: haystackWords((item.headings ?? []).join(' ')) },
        { weight: WEIGHT.body, words: haystackWords(item.body) },
      ],
    };
    prepared.set(item, entry);
  }
  return entry;
}

/** 0 when any query token is missing from the item, otherwise a score above 0 (title phrase up to 120). */
export function scoreItem(query: ParsedQuery, item: SearchItem): number {
  const { titleText, fields } = prepare(item);
  let total = 0;
  for (const token of query.tokens) {
    let best = 0;
    for (const field of fields) {
      for (const word of field.words) {
        const quality = wordQuality(token, word);
        if (quality > 0 && quality * field.weight > best) best = quality * field.weight;
      }
    }
    if (best === 0) return 0;
    total += best;
  }
  let score = (total / query.tokens.length) * 10;
  if (titleText.includes(query.phrase)) score += 20;
  return score;
}

/** Ranked results for a free-text query. Ties keep the order of `items`. */
export function searchItems<T extends SearchItem>(query: string, items: readonly T[], limit = 8): T[] {
  const parsed = parseQuery(query);
  if (!parsed) return [];
  return items
    .map((item) => ({ item, score: scoreItem(parsed, item) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
