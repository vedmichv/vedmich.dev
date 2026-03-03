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
