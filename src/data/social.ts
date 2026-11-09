export const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://de.linkedin.com/in/vedmich',
    icon: 'linkedin',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/vedmichv',
    icon: 'github',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/c/DevOpsKitchenTalks',
    icon: 'youtube',
  },
  {
    name: 'X / Twitter',
    url: 'https://x.com/vedmichv',
    icon: 'twitter',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/ViktorVedmich',
    icon: 'telegram',
  },
] as const;

export type PodcastPlatform = 'apple' | 'spotify' | 'yandex' | 'youtube' | 'podbean' | 'site';

// Where to listen, per show. Every URL was opened and matched to its show on 2026-11-09
// (dk-t.dev for the DKT list; the Podbean site of "AWS на русском" for its list).
// Labels live in i18n (`podcasts.platforms`). Add a platform here only after opening its URL.
// Apple links omit the storefront, so Apple redirects to the visitor's own country.
export const podcastLinks = {
  dkt: [
    { platform: 'apple', url: 'https://podcasts.apple.com/podcast/id1502639464' },
    { platform: 'spotify', url: 'https://open.spotify.com/show/50RwaCGp0x2X6SmtLLPgfc' },
    { platform: 'yandex', url: 'https://music.yandex.ru/album/10151746' },
    { platform: 'youtube', url: 'https://www.youtube.com/@DevOpsKitchenTalks' },
    { platform: 'podbean', url: 'https://devopskitchentalks.podbean.com/' },
    { platform: 'site', url: 'https://dk-t.dev/' },
  ],
  aws: [
    { platform: 'apple', url: 'https://podcasts.apple.com/podcast/id1600771698' },
    { platform: 'spotify', url: 'https://open.spotify.com/show/4kOoih4FvHqyK5mLF3E42J' },
    { platform: 'yandex', url: 'https://music.yandex.ru/album/20088544' },
    { platform: 'youtube', url: 'https://www.youtube.com/playlist?list=PLxtckYH8Cdy_WT5tcCITt_f61Zr2qQJbL' },
    { platform: 'podbean', url: 'https://awsinrussian.podbean.com/' },
  ],
} as const satisfies Record<string, readonly { platform: PodcastPlatform; url: string }[]>;

export const certifications = [
  { name: 'CNCF Kubestronaut', badge: 'kubestronaut' },
  { name: 'CKA', badge: 'cka' },
  { name: 'CKS', badge: 'cks' },
  { name: 'CKAD', badge: 'ckad' },
  { name: 'KCNA', badge: 'kcna' },
  { name: 'KCSA', badge: 'kcsa' },
] as const;

export const skills = [
  'AI Engineering',
  'Distributed Systems',
  'Kubernetes',
  'AWS Cloud',
  'Platform Engineering',
  'API Design',
  'Observability',
  'GenAI / LLM',
  'Terraform',
  'Python',
  'Cost Optimization',
] as const;

// Authors of "Cracking the Kubernetes Interview", as printed on the cover and in BookLink alt text.
export const bookAuthors = {
  en: 'Viktor Vedmich and Alexander Dovnar',
  ru: 'Виктор Ведмич и Александр Довнар',
} as const;
