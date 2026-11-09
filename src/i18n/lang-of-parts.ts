// Language of parts (WCAG 3.1.2): a title shown on a page of the other locale
// needs its own lang attribute so screen readers pick the right voice.
//
// Detection is script based, because every title is either English or Russian:
// - on a RU page, text with Latin letters and no Cyrillic is English;
// - on an EN page, any Cyrillic means the text is Russian (for example the
//   podcast name "AWS на русском").
// Russian text that keeps Latin product names ("Prompt Engineering для DevOps")
// is not marked, because it still contains Cyrillic.

export type PartLang = 'en' | 'ru';

const CYRILLIC = /[\u0400-\u04FF]/;
const LATIN = /[A-Za-z]/;

/** The lang to put on an element holding `text`, or undefined when it matches the page locale. */
export function langOfText(text: string, pageLocale: PartLang): PartLang | undefined {
  const cyrillic = CYRILLIC.test(text);
  if (pageLocale === 'ru') return !cyrillic && LATIN.test(text) ? 'en' : undefined;
  return cyrillic ? 'ru' : undefined;
}
