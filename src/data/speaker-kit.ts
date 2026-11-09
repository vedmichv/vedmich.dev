/**
 * Speaker kit: bios for conference programs and websites, in both languages, plus the
 * photo files. Both languages show on both locale pages (an organizer may need either),
 * so the texts live here and not in the per-locale UI strings.
 *
 * Every fact comes from the approved About bio and from facts already printed on the site:
 * role and employer (hero), "in the industry since 2009" and "at AWS since 2021" (About),
 * Kubestronaut and the book with Alexander Dovnar published by Packt (About, Book), the two
 * podcasts (Podcasts), AWS re:Invent and AWS Summit talks and the delivered topics (Speaking).
 * Lengths are whitespace-separated tokens: 50 and 100 words, checked by tests/smoke/invite.spec.ts.
 */
export const speakerBios = {
  en: {
    short:
      'Viktor Vedmich is a Senior Solutions Architect and AI Engineer, in the industry since 2009. Since 2021 he has worked at AWS, designing architecture for enterprise customers: hybrid cloud, Kubernetes, and GenAI and agentic platforms. He is a CNCF Kubestronaut and co-author, with Alexander Dovnar, of “Cracking the Kubernetes Interview”.',
    long:
      'Viktor Vedmich is a Senior Solutions Architect and AI Engineer, in the industry since 2009. Since 2021 he has worked at AWS, designing architecture for enterprise customers: hybrid cloud, Kubernetes, and GenAI and agentic platforms. He is a CNCF Kubestronaut and co-author, with Alexander Dovnar, of “Cracking the Kubernetes Interview”. Viktor also hosts two podcasts, DevOps Kitchen Talks and AWS на русском. He speaks at conferences in English and Russian, including AWS re:Invent and AWS Summits. Topics include AI agents for incidents, MCP and AI coding assistants for engineers, Kubernetes in production, AI maturity, and a platform for enterprise AI.',
  },
  ru: {
    short:
      'Виктор Ведмич: Senior Solutions Architect и AI Engineer, в индустрии с 2009 года. С 2021 года работает в AWS и проектирует архитектуру для крупных клиентов: hybrid cloud, Kubernetes, GenAI и агентные платформы. CNCF Kubestronaut. Вместе с Александром Довнаром написал книгу «Cracking the Kubernetes Interview». Выступает на английском и русском языках.',
    long:
      'Виктор Ведмич: Senior Solutions Architect и AI Engineer, в индустрии с 2009 года. С 2021 года работает в AWS и проектирует архитектуру для крупных клиентов: hybrid cloud, Kubernetes, GenAI и агентные платформы. CNCF Kubestronaut. Вместе с Александром Довнаром написал книгу «Cracking the Kubernetes Interview». Книгу издал Packt. Ведёт два подкаста, DevOps Kitchen Talks и AWS на русском. Выступает на английском и русском, в том числе на AWS re:Invent и AWS Summit. Темы докладов: AI-агенты для инцидентов, MCP и AI-ассистенты для кода, Kubernetes в продакшене: Karpenter, Gateway API, GenAI на Amazon EKS, зрелость AI и платформа для AI в крупных компаниях.',
  },
} as const;

/** Photo files in /public/images: web sizes for the About section, the original for download. */
export const speakerPhoto = {
  width: 640,
  height: 960,
  src640: '/images/viktor-vedmich-640.webp',
  src1280: '/images/viktor-vedmich-1280.webp',
  download: '/images/viktor-vedmich-speaker.jpg',
} as const;
