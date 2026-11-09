import { test, expect, type Page } from '@playwright/test';

type JsonLd = Record<string, any>;

/** Parse every JSON-LD script on the page; throws when one is not valid JSON. */
async function readJsonLd(page: Page): Promise<{ raw: string[]; data: JsonLd[] }> {
  const raw = await page.locator('script[type="application/ld+json"]').evaluateAll(
    (nodes) => nodes.map((node) => node.textContent ?? ''),
  );
  return { raw, data: raw.map((text) => JSON.parse(text) as JsonLd) };
}

const post = {
  en: '/en/blog/2026-10-04-rca-agent-bedrock-agentcore/',
  ru: '/ru/blog/2026-10-04-rca-agent-bedrock-agentcore/',
};
const unlisted = '/en/blog/2026-06-22-pod-pending-decode-tree/';

for (const locale of ['en', 'ru'] as const) {
  test(`${locale}: home page has valid Person and WebSite JSON-LD`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const { raw, data } = await readJsonLd(page);
    expect(data).toHaveLength(1);
    expect(raw[0]).not.toContain('<');
    const nodes: JsonLd[] = data[0]['@graph'];
    expect(data[0]['@context']).toBe('https://schema.org');
    expect(nodes.map((node) => node['@type'])).toEqual(['Person', 'WebSite']);
    const [person, website] = nodes;
    expect(person.sameAs).toEqual(expect.arrayContaining([
      'https://github.com/vedmichv',
      'https://www.youtube.com/c/DevOpsKitchenTalks',
    ]));
    expect(person.name).toBe(locale === 'en' ? 'Viktor Vedmich' : 'Виктор Ведмич');
    expect(website.inLanguage).toBe(locale);
    expect(website.url).toBe(`https://vedmich.dev/${locale}/`);
    expect(website.author).toEqual({ '@id': person['@id'] });
  });

  test(`${locale}: post has BlogPosting JSON-LD that matches the page`, async ({ page }) => {
    await page.goto(post[locale]);
    const { raw, data } = await readJsonLd(page);
    expect(data).toHaveLength(1);
    expect(raw[0]).not.toContain('<');
    const [posting] = data;
    expect(posting['@type']).toBe('BlogPosting');
    expect(posting.headline).toBe(await page.locator('h1').innerText());
    expect(posting.description).toBe(await page.locator('meta[name="description"]').getAttribute('content'));
    expect(posting.datePublished).toBe('2026-10-04');
    expect(posting.inLanguage).toBe(locale);
    expect(posting.url).toBe(await page.locator('link[rel="canonical"]').getAttribute('href'));
    expect(posting.author.name).toBe(locale === 'en' ? 'Viktor Vedmich' : 'Виктор Ведмич');
    expect(posting.image[0]).toBe(await page.locator('meta[property="og:image"]').getAttribute('content'));
  });

  test(`${locale}: talk has Event JSON-LD with its date, place and event`, async ({ page }) => {
    await page.goto(`/${locale}/speaking/2024-berlin-sa-agent-bedrock/`);
    const { raw, data } = await readJsonLd(page);
    expect(data).toHaveLength(1);
    expect(raw[0]).not.toContain('<');
    const [event] = data;
    expect(event['@type']).toBe('Event');
    expect(event.startDate).toBe('2024-05-15');
    expect(event.superEvent.name).toBe('AWS Summit Berlin');
    expect(event.location.address.addressLocality).toBe(locale === 'en' ? 'Berlin' : 'Берлин');
    expect(event.url).toBe(await page.locator('link[rel="canonical"]').getAttribute('href'));
    expect(event.recordedIn.url).toContain('youtube.com');
  });
}

test('index pages and unlisted posts carry no JSON-LD', async ({ page }) => {
  for (const path of ['/en/blog/', '/ru/speaking/', unlisted]) {
    await page.goto(path);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  }
});

test('a post links back to the talk it grew out of, outside the prose', async ({ page }) => {
  await page.goto(post.en);
  const block = page.locator('aside[aria-labelledby="post-origins-heading"]');
  await expect(block).toBeVisible();
  await expect(block.getByRole('heading', { name: 'This post grew out of' })).toBeVisible();
  // The same talk was given at more than one event, so match each link by its target.
  await expect(block.locator('a[href="/en/speaking/2026-rca-agent-agentcore/"]'))
    .toHaveText('Building an RCA Agent with Amazon Bedrock AgentCore');
  await expect(block.locator('a[href="/en/speaking/2026-adria-rca-agent-agentcore/"]')).toHaveCount(1);
  await expect(block).toContainText('AWS Community Day Central Asia, 25 September 2026');
  await expect(block.getByRole('link', { name: /^Video/ })).toHaveAttribute('href', /youtube\.com/);
  await expect(block.getByRole('link', { name: /^Slides/ }).first()).toHaveAttribute('href', /slides\/ai-agents-devops-tashkent/);
  // Outside the prose container, so prose screenshots stay unchanged.
  await expect(page.locator('.prose aside')).toHaveCount(0);
  expect((await page.request.get('/en/speaking/2026-rca-agent-agentcore/')).status()).toBe(200);
});

test('the Russian post renders the back-link in Russian with day-month-year dates', async ({ page }) => {
  await page.goto(post.ru);
  const block = page.locator('aside[aria-labelledby="post-origins-heading"]');
  await expect(block.getByRole('heading', { name: 'Эта статья выросла из' })).toBeVisible();
  await expect(block).toContainText('25 сентября 2026');
  await expect(block.getByRole('link', { name: /^Видео/ })).toBeVisible();
  await expect(block.getByRole('link', { name: /^Слайды/ }).first()).toBeVisible();
  await expect(block.locator('a[href="/ru/speaking/2026-rca-agent-agentcore/"]'))
    .toHaveText('Building an RCA Agent with Amazon Bedrock AgentCore');
});

test('a deck-only article links to its slides, and a post without a talk shows no block', async ({ page }) => {
  await page.goto('/en/blog/2026-06-06-kubernetes-gateway-api-zero-to-hero/');
  const block = page.locator('aside[aria-labelledby="post-origins-heading"]');
  await expect(block.getByRole('link', { name: /^Slides/ })).toHaveAttribute('href', '/slides/k8s-gateway-api/');
  await page.goto('/en/blog/hello-world/');
  await expect(page.locator('aside[aria-labelledby="post-origins-heading"]')).toHaveCount(0);
});

test('talks of the same event and year link to each other', async ({ page }) => {
  await page.goto('/en/speaking/2024-reinvent-latency-optimization/');
  const block = page.locator('aside[aria-labelledby="sibling-talks-heading"]');
  await expect(block.getByRole('heading', { name: 'Also at AWS re:Invent 2024' })).toBeVisible();
  await expect(block.getByRole('link')).toHaveCount(1);
  await expect(block.getByRole('link')).toHaveAttribute('href', '/en/speaking/2024-reinvent-ml-containers/');
  await expect(block).toContainText('4 December 2024');
  await page.goto('/ru/speaking/2024-reinvent-latency-optimization/');
  await expect(page.locator('aside[aria-labelledby="sibling-talks-heading"]'))
    .toContainText('Другие доклады на AWS re:Invent 2024');
  // A talk that is alone at its event has no block.
  await page.goto('/en/speaking/2023-reinvent-cdk8s/');
  await expect(page.locator('aside[aria-labelledby="sibling-talks-heading"]')).toHaveCount(0);
});

test('every listed page keeps titles, descriptions and hreflang within the contract', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  expect(urls.length).toBeGreaterThan(40);
  expect(urls).not.toContain('/');
  // Translated pages list their counterpart in the sitemap.
  expect(sitemap).toContain('<xhtml:link rel="alternate" hreflang="ru" href="https://vedmich.dev/ru/blog/"/>');

  const problems: string[] = [];
  for (const path of urls) {
    await page.goto(path);
    const title = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    const meta = [title, description, ...(await page.locator('meta[property^="og:"], meta[name^="twitter:"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('content') ?? '')))];
    if (meta.some((text) => /[–—]/.test(text))) problems.push(`${path}: dash in meta text`);
    if (/ · (Viktor Vedmich|Виктор Ведмич)$/.test(title) && title.length > 60) problems.push(`${path}: title ${title.length}`);
    if (path.includes('/speaking/') && !path.endsWith('/speaking/') && description.length > 155) {
      problems.push(`${path}: description ${description.length}`);
    }
    const xDefault = await page.locator('link[hreflang="x-default"]').getAttribute('href');
    const english = await page.locator('link[hreflang="en"]').getAttribute('href');
    if (xDefault !== english) problems.push(`${path}: x-default ${xDefault} is not the English URL ${english}`);
    const bare = await page.locator('a[href^="/en/"], a[href^="/ru/"]').evaluateAll(
      (anchors) => anchors.map((a) => a.getAttribute('href') ?? '').filter((href) => !href.endsWith('/') && !href.includes('#')),
    );
    if (bare.length) problems.push(`${path}: links without trailing slash ${bare.join(', ')}`);
  }
  expect(problems).toEqual([]);
});
