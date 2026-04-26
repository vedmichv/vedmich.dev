import en from './en.json';
import ru from './ru.json';

const translations = { en, ru } as const;

export type Locale = keyof typeof translations;
export const locales: Locale[] = ['en', 'ru'];
export const defaultLocale: Locale = 'en';

export function t(locale: Locale) {
  return translations[locale];
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang === 'ru') return 'ru';
  return 'en';
}

export function getLocalizedPath(path: string, locale: Locale): string {
  return `/${locale}${path}`;
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ru' : 'en';
}

// Rewrite the current pathname's locale prefix to `target`.
// Keeps the rest of the path intact so the language switcher stays on
// the same page — e.g. /en/blog/karpenter/ + target=ru → /ru/blog/karpenter/.
// Falls back to /{target}/ if the path has no locale prefix.
export function getLocaleSwitchPath(currentPath: string, target: Locale): string {
  const match = currentPath.match(/^\/(en|ru)(\/.*)?$/);
  if (!match) return `/${target}/`;
  const rest = match[2] ?? '/';
  return `/${target}${rest}`;
}
