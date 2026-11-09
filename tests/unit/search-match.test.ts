import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  haystackWords,
  normalizeText,
  parseQuery,
  scoreItem,
  searchItems,
  tokenize,
  withinOneEdit,
  wordQuality,
  type SearchItem,
} from '../../src/data/search-match.ts';

// Fixtures mirror the shape and wording of the real index (src/data/search-index.ts).

const enIndex: SearchItem[] = [
  {
    kind: 'talk',
    title: 'Karpenter in Production: Architecting Cost-Efficient K8s Clusters',
    sub: '2026-03-11 · AWS Community Day Slovakia · Košice',
    url: '/en/speaking/2026-karpenter-production/',
    tags: ['Karpenter', 'Kubernetes', 'EKS', 'Cost Optimization'],
    body: 'How Karpenter changes node provisioning on Amazon EKS and what it takes to run it safely at scale.',
    date: '2026-03-11',
    meta: 'Talk Speaking Košice Кошице',
  },
  {
    kind: 'talk',
    title: 'Mastering Kubernetes Scalability with Karpenter',
    sub: '2025-07-01 · Code Europe · Kraków',
    url: '/en/speaking/2026-karpenter-scalability/',
    tags: ['Karpenter', 'Kubernetes', 'Scalability'],
    body: 'Scaling clusters up and down without waste: NodePools, disruption budgets and consolidation.',
    date: '2025-07-01',
    meta: 'Talk Speaking Kraków Краков',
  },
  {
    kind: 'talk',
    title: 'Model Context Protocol (MCP): A Practical Guide for DevOps Engineers',
    sub: '2025-05-24 · devopsdays Tashkent',
    url: '/en/speaking/2025-devopsdays-tashkent-mcp/',
    tags: ['MCP', 'GenAI', 'DevOps', 'Kubernetes', 'AWS'],
    body: 'Generative AI has outgrown chatbots and has become a tool in the DevOps toolkit. The talk was delivered in Russian.',
    date: '2025-05-24',
    meta: 'Talk Speaking Tashkent Ташкент',
  },
  {
    kind: 'talk',
    title: 'New Era of IaC: Effective Kubernetes Management with cdk8s (BOA310)',
    sub: '2023-11-27 · AWS re:Invent · Las Vegas',
    url: '/en/speaking/2023-reinvent-cdk8s/',
    tags: ['Kubernetes', 'IaC', 'cdk8s', 'AWS'],
    body: 'AWS re:Invent session on using cdk8s to write secure Kubernetes applications. Session code: BOA310.',
    date: '2023-11-27',
    meta: 'Talk Speaking Las Vegas Лас-Вегас',
  },
  {
    kind: 'talk',
    title: 'Latency optimization: From theory to practice',
    sub: '2024-12-05 · AWS re:Invent · Las Vegas',
    url: '/en/speaking/2024-reinvent-latency-optimization/',
    tags: ['Networking', 'Performance'],
    body: 'A re:Invent chalk talk on where latency comes from and how to cut it.',
    date: '2024-12-05',
    meta: 'Talk Speaking Las Vegas Лас-Вегас',
  },
  {
    kind: 'post',
    title: 'Karpenter in production: what a 1,000-cluster migration teaches',
    sub: '2026-03-20',
    url: '/en/blog/2026-03-20-karpenter-right-sizing/',
    tags: ['kubernetes', 'aws', 'karpenter'],
    body: 'Salesforce is moving 1,000+ EKS clusters from Cluster Autoscaler to Karpenter. It is not the savings: the cost line is the modest one.',
    date: '2026-03-20',
    headings: ['Why Karpenter is different', 'Trap 1: a NodePool has no ceiling until you set one'],
    meta: 'Post',
  },
  {
    kind: 'post',
    title: 'Latency vs throughput vs bandwidth: the three numbers everyone confuses',
    sub: '2026-06-11',
    url: '/en/blog/2026-06-11-latency-throughput-bandwidth/',
    tags: ['networking', 'performance', 'aws', 'fundamentals'],
    body: 'Why doubling bandwidth often fixes nothing. A chatty service pays a full round trip on every call.',
    date: '2026-06-11',
    headings: ['The pipe: one analogy for all three numbers', 'How to measure each one'],
    meta: 'Post',
  },
  {
    kind: 'slides',
    title: 'Building an RCA Agent with Amazon Bedrock AgentCore',
    sub: '2026-09-25 · AWS Community Day Central Asia',
    url: '/slides/ai-agents-devops-tashkent/',
    tags: ['AI Agents', 'AWS', 'Bedrock', 'Kubernetes'],
    body: 'From a model to an agent that investigates a Kubernetes incident.',
    date: '2026-09-25',
    meta: 'Slides Tashkent Ташкент',
  },
  {
    kind: 'page',
    title: 'DevOps Kitchen Talks',
    sub: 'Podcasts',
    url: '/en/#podcasts',
    tags: [],
    body: 'Technical deep-dives into DevOps, Kubernetes, and infrastructure. Interviews with industry experts.',
    date: '',
    meta: 'Page',
  },
  {
    kind: 'page',
    title: 'AWS на русском',
    sub: 'Podcasts',
    url: '/en/#podcasts',
    tags: [],
    body: 'AWS services, architectural patterns, AI applications, and IT careers, all in Russian.',
    date: '',
    meta: 'Page',
  },
  {
    kind: 'page',
    title: 'Cracking the Kubernetes Interview',
    sub: 'Book',
    url: '/en/#book',
    tags: [],
    body: 'A comprehensive guide covering Kubernetes concepts, architecture, networking, security, and real-world scenarios.',
    date: '',
    meta: 'Page Viktor Vedmich and Alexander Dovnar Виктор Ведмич и Александр Довнар Amazon',
  },
];

const ruIndex: SearchItem[] = [
  {
    kind: 'post',
    title: 'Karpenter в продакшене: чему учит миграция 1000 кластеров',
    sub: '2026-03-20',
    url: '/ru/blog/2026-03-20-karpenter-right-sizing/',
    tags: ['kubernetes', 'aws', 'karpenter'],
    body: 'Salesforce переводит более 1000 кластеров EKS с Cluster Autoscaler на Karpenter. Экономия скромная: строка затрат не главная.',
    date: '2026-03-20',
    headings: ['Чем Karpenter отличается', 'Ловушка 1: у NodePool нет потолка, пока вы его не зададите'],
    meta: 'Пост',
  },
  {
    kind: 'post',
    title: 'Почему я всё ещё пишу манифесты Kubernetes руками',
    sub: '2026-02-10',
    url: '/ru/blog/2026-02-10-why-i-write-kubernetes-manifests-by-hand/',
    tags: ['kubernetes', 'yaml'],
    body: 'Генераторы шаблонов удобны, но ломаются на первом нестандартном ресурсе. Хороший кластер начинается с понятного манифеста.',
    date: '2026-02-10',
    headings: ['Что скрывают шаблоны'],
    meta: 'Пост',
  },
  {
    kind: 'talk',
    title: 'Model Context Protocol (MCP): практическое руководство для DevOps-инженеров',
    sub: '2025-05-24 · devopsdays Tashkent · Ташкент',
    url: '/ru/speaking/2025-devopsdays-tashkent-mcp/',
    tags: ['MCP', 'GenAI', 'DevOps', 'Kubernetes', 'AWS'],
    body: 'Генеративный AI вышел за пределы чат-ботов и стал инструментом DevOps. Доклад прочитан на русском языке.',
    date: '2025-05-24',
    meta: 'Доклад Выступления Ташкент Tashkent',
  },
  {
    kind: 'talk',
    title: 'Масштабирование Kubernetes с Karpenter',
    sub: '2025-07-01 · Code Europe · Краков',
    url: '/ru/speaking/2026-karpenter-scalability/',
    tags: ['Karpenter', 'Kubernetes', 'Scalability'],
    body: 'Как увеличивать и уменьшать кластеры без лишних расходов.',
    date: '2025-07-01',
    meta: 'Доклад Выступления Краков Kraków',
  },
  {
    kind: 'talk',
    title: 'Karpenter в продакшене: архитектура экономичных K8s кластеров',
    sub: '2026-03-11 · AWS Community Day Slovakia · Кошице',
    url: '/ru/speaking/2026-karpenter-production/',
    tags: ['Karpenter', 'Kubernetes', 'EKS'],
    body: 'Как Karpenter меняет выделение узлов на Amazon EKS.',
    date: '2026-03-11',
    meta: 'Доклад Выступления Кошице Košice',
  },
  {
    kind: 'page',
    title: 'DevOps Kitchen Talks',
    sub: 'Подкасты',
    url: '/ru/#podcasts',
    tags: [],
    body: 'Глубокие технические погружения в DevOps, Kubernetes и инфраструктуру. Интервью с экспертами, мок-интервью и практические темы.',
    date: '',
    meta: 'Раздел',
  },
  {
    kind: 'page',
    title: 'AWS на русском',
    sub: 'Подкасты',
    url: '/ru/#podcasts',
    tags: [],
    body: 'Сервисы AWS, архитектурные паттерны, применение AI и IT-карьера. Всё на русском.',
    date: '',
    meta: 'Раздел',
  },
  {
    kind: 'page',
    title: 'Cracking the Kubernetes Interview',
    sub: 'Книга',
    url: '/ru/#book',
    tags: [],
    body: 'Полное руководство по концепциям, архитектуре, сетям, безопасности Kubernetes и реальным сценариям для подготовки к собеседованию.',
    date: '',
    meta: 'Раздел Viktor Vedmich and Alexander Dovnar Виктор Ведмич и Александр Довнар Amazon',
  },
];

function titles(query: string, index: SearchItem[], limit = 50): string[] {
  return searchItems(query, index, limit).map((item) => item.title);
}

function assertFinds(query: string, index: SearchItem[], expectedTitle: string): void {
  const found = titles(query, index);
  assert.ok(
    found.includes(expectedTitle),
    `"${query}" should find "${expectedTitle}", got ${JSON.stringify(found)}`,
  );
}

// -- normalization ---------------------------------------------------------

test('normalizeText strips Latin diacritics and folds letters that do not decompose', () => {
  assert.equal(normalizeText('Košice'), 'kosice');
  assert.equal(normalizeText('Kraków'), 'krakow');
  assert.equal(normalizeText('Łódź'), 'lodz');
  assert.equal(normalizeText('Zürich Malmö Ångström'), 'zurich malmo angstrom');
});

test('normalizeText maps yo to ye but keeps the Russian short i', () => {
  assert.equal(normalizeText('Ещё'), 'еще');
  assert.equal(normalizeText('ЁЖ'), 'еж');
  assert.equal(normalizeText('Большой'), 'большой');
  assert.equal(normalizeText('Йогурт'), 'йогурт');
});

test('normalizeText joins in-word apostrophes and thousands separators', () => {
  assert.equal(normalizeText("Karpenter's"), 'karpenters');
  assert.equal(normalizeText('1,000+ clusters'), '1000+ clusters');
  assert.equal(normalizeText('a, b'), 'a, b');
});

test('tokenize splits on punctuation and removes duplicates', () => {
  assert.deepEqual(tokenize('re:Invent, re:Invent!'), ['re', 'invent']);
  assert.deepEqual(tokenize('  --  '), []);
});

test('haystackWords adds the joined form of compounds', () => {
  const words = haystackWords('AWS re:Invent and kube-proxy');
  for (const expected of ['aws', 're', 'invent', 'reinvent', 'kube', 'proxy', 'kubeproxy']) {
    assert.ok(words.includes(expected), `missing ${expected} in ${JSON.stringify(words)}`);
  }
});

// -- word matching ---------------------------------------------------------

test('withinOneEdit accepts one insertion, deletion, substitution or adjacent swap', () => {
  assert.ok(withinOneEdit('kubernetes', 'kubernetes'));
  assert.ok(withinOneEdit('kubernets', 'kubernetes'));
  assert.ok(withinOneEdit('kubernetess', 'kubernetes'));
  assert.ok(withinOneEdit('kubernptes', 'kubernetes'));
  assert.ok(withinOneEdit('kuberentes', 'kubernetes'));
  assert.ok(!withinOneEdit('kubernts', 'kubernetes'));
  assert.ok(!withinOneEdit('kubectl', 'kubernetes'));
  assert.ok(!withinOneEdit('abc', 'abcde'));
});

test('wordQuality ranks equal above prefix above stem above substring above typo', () => {
  const exact = wordQuality('cluster', 'cluster');
  const prefix = wordQuality('clust', 'cluster');
  const stem = wordQuality('clusters', 'cluster');
  const substring = wordQuality('luster', 'cluster');
  const typo = wordQuality('clusder', 'cluster');
  assert.ok(exact > prefix && prefix > stem && stem > substring && substring > typo && typo > 0);
});

test('wordQuality tolerates one typo only for tokens of 6 or more characters', () => {
  assert.ok(wordQuality('kubernets', 'kubernetes') > 0);
  assert.ok(wordQuality('karpentr', 'karpenter') > 0);
  assert.equal(wordQuality('podz', 'pods'), 0);
  assert.equal(wordQuality('agnet', 'agent'), 0);
  assert.equal(wordQuality('xyz', 'abc'), 0);
});

test('wordQuality matches Russian word forms by a 5-letter stem', () => {
  assert.ok(wordQuality('кластеры', 'кластер') > 0);
  assert.ok(wordQuality('кластер', 'кластеров') > 0);
  assert.ok(wordQuality('подкаст', 'подкасты') > 0);
  assert.ok(wordQuality('ташкент', 'ташкенте') > 0);
  assert.equal(wordQuality('сервисы', 'сервер'), 0);
});

test('wordQuality only prefix-matches very short tokens', () => {
  assert.ok(wordQuality('re', 're') > 0);
  assert.ok(wordQuality('ai', 'ai') > 0);
  assert.equal(wordQuality('ai', 'maintain'), 0);
  assert.equal(wordQuality('ku', 'tokubet'), 0);
});

// -- English queries -------------------------------------------------------

test('English: talks are found by city, event and tag', () => {
  assertFinds('tashkent', enIndex, 'Model Context Protocol (MCP): A Practical Guide for DevOps Engineers');
  assertFinds('Tashkent', enIndex, 'Building an RCA Agent with Amazon Bedrock AgentCore');
  assertFinds('re:Invent', enIndex, 'New Era of IaC: Effective Kubernetes Management with cdk8s (BOA310)');
  assertFinds('re:Invent', enIndex, 'Latency optimization: From theory to practice');
  assertFinds('reinvent', enIndex, 'Latency optimization: From theory to practice');
  assertFinds('re invent', enIndex, 'Latency optimization: From theory to practice');
  assertFinds('cdk8s', enIndex, 'New Era of IaC: Effective Kubernetes Management with cdk8s (BOA310)');
  assertFinds('las vegas', enIndex, 'Latency optimization: From theory to practice');
});

test('English: the re:Invent and cdk8s queries do not drag in unrelated items', () => {
  const reinvent = titles('re:Invent', enIndex);
  assert.ok(!reinvent.includes('Mastering Kubernetes Scalability with Karpenter'));
  assert.ok(!reinvent.includes('Cracking the Kubernetes Interview'));
  assert.ok(!reinvent.includes('Building an RCA Agent with Amazon Bedrock AgentCore'));
  assert.equal(wordQuality('invent', 'investigates'), 0);
  assert.equal(titles('cdk8s', enIndex).length, 1);
});

test('English: podcast, book and speaking reach the page and talk items', () => {
  const podcast = searchItems('podcast', enIndex);
  assert.deepEqual(
    podcast.map((item) => item.title),
    ['DevOps Kitchen Talks', 'AWS на русском'],
  );
  assert.ok(podcast.every((item) => item.kind === 'page' && item.url === '/en/#podcasts'));
  assert.deepEqual(titles('book', enIndex), ['Cracking the Kubernetes Interview']);
  assert.equal(searchItems('book', enIndex)[0].url, '/en/#book');
  assert.equal(searchItems('speaking', enIndex).filter((item) => item.kind === 'talk').length, 5);
});

test('English: co-author names are searchable on the book item', () => {
  assert.deepEqual(titles('Dovnar', enIndex), ['Cracking the Kubernetes Interview']);
  assert.deepEqual(titles('dovnar', enIndex), ['Cracking the Kubernetes Interview']);
  assert.deepEqual(titles('Vedmich', enIndex), ['Cracking the Kubernetes Interview']);
});

test('English: body text is searchable and ranks below titles and tags', () => {
  const cost = titles('cost', enIndex);
  assert.equal(cost[0], 'Karpenter in Production: Architecting Cost-Efficient K8s Clusters');
  assert.ok(cost.includes('Karpenter in production: what a 1,000-cluster migration teaches'));
  assert.ok(cost.indexOf('Karpenter in production: what a 1,000-cluster migration teaches') > 0);
  assertFinds('salesforce', enIndex, 'Karpenter in production: what a 1,000-cluster migration teaches');
  assertFinds('round trip', enIndex, 'Latency vs throughput vs bandwidth: the three numbers everyone confuses');
});

test('English: H2 headings are searchable', () => {
  assertFinds('nodepool ceiling', enIndex, 'Karpenter in production: what a 1,000-cluster migration teaches');
  assertFinds('measure', enIndex, 'Latency vs throughput vs bandwidth: the three numbers everyone confuses');
});

test('English: one typo is tolerated for words of 6 or more characters', () => {
  assertFinds('kubernets', enIndex, 'Cracking the Kubernetes Interview');
  assertFinds('kuberentes', enIndex, 'Cracking the Kubernetes Interview');
  assertFinds('karpentr', enIndex, 'Karpenter in production: what a 1,000-cluster migration teaches');
  assertFinds('bandwith', enIndex, 'Latency vs throughput vs bandwidth: the three numbers everyone confuses');
  assert.deepEqual(titles('kubectl', enIndex), []);
});

test('English: diacritics and case do not matter', () => {
  const expected = 'Karpenter in Production: Architecting Cost-Efficient K8s Clusters';
  assertFinds('Košice', enIndex, expected);
  assertFinds('kosice', enIndex, expected);
  assertFinds('KOSICE', enIndex, expected);
  assertFinds('krakow', enIndex, 'Mastering Kubernetes Scalability with Karpenter');
  assertFinds('Kraków', enIndex, 'Mastering Kubernetes Scalability with Karpenter');
});

test('English: the kind label is searchable', () => {
  assert.deepEqual(
    new Set(searchItems('slides', enIndex).map((item) => item.kind)),
    new Set(['slides']),
  );
  assert.ok(searchItems('talk', enIndex).some((item) => item.kind === 'talk'));
});

test('English: title hits rank above body hits and an exact title phrase ranks first', () => {
  const results = searchItems('latency', enIndex);
  assert.ok(results.length >= 2);
  assert.ok(/latency/i.test(results[0].title));
  const phrase = searchItems('latency vs throughput', enIndex);
  assert.equal(phrase[0].title, 'Latency vs throughput vs bandwidth: the three numbers everyone confuses');
  const mcp = searchItems('mcp', enIndex);
  assert.equal(mcp[0].title, 'Model Context Protocol (MCP): A Practical Guide for DevOps Engineers');
});

test('English: all tokens must match (AND), so an extra unrelated word removes the item', () => {
  assert.ok(titles('karpenter cost', enIndex).length >= 1);
  assert.deepEqual(titles('karpenter blockchain', enIndex), []);
  assert.deepEqual(titles('latency throughput bandwidth', enIndex).length, 1);
});

// -- Russian queries -------------------------------------------------------

test('Russian: word forms match through the stem (кластеры finds кластер and кластеров)', () => {
  assertFinds('кластеры', ruIndex, 'Почему я всё ещё пишу манифесты Kubernetes руками');
  assertFinds('кластеры', ruIndex, 'Karpenter в продакшене: чему учит миграция 1000 кластеров');
  assertFinds('кластер', ruIndex, 'Karpenter в продакшене: чему учит миграция 1000 кластеров');
  assertFinds('кластер', ruIndex, 'Karpenter в продакшене: архитектура экономичных K8s кластеров');
});

test('Russian: city, podcast and book queries find the talks and sections', () => {
  assertFinds('ташкент', ruIndex, 'Model Context Protocol (MCP): практическое руководство для DevOps-инженеров');
  assertFinds('Ташкенте', ruIndex, 'Model Context Protocol (MCP): практическое руководство для DevOps-инженеров');
  assertFinds('подкаст', ruIndex, 'DevOps Kitchen Talks');
  assertFinds('подкаст', ruIndex, 'AWS на русском');
  assertFinds('подкасты', ruIndex, 'AWS на русском');
  assert.deepEqual(titles('книга', ruIndex), ['Cracking the Kubernetes Interview']);
  assert.equal(searchItems('книга', ruIndex)[0].url, '/ru/#book');
  assert.equal(searchItems('подкаст', ruIndex)[0].url, '/ru/#podcasts');
});

test('Russian: yo is equal to ye', () => {
  assertFinds('еще', ruIndex, 'Почему я всё ещё пишу манифесты Kubernetes руками');
  assertFinds('ещё', ruIndex, 'Почему я всё ещё пишу манифесты Kubernetes руками');
  assertFinds('все', ruIndex, 'Почему я всё ещё пишу манифесты Kubernetes руками');
});

test('Russian: Latin and Cyrillic city names find the same entry', () => {
  assertFinds('Kosice', ruIndex, 'Karpenter в продакшене: архитектура экономичных K8s кластеров');
  assertFinds('кошице', ruIndex, 'Karpenter в продакшене: архитектура экономичных K8s кластеров');
  assertFinds('краков', ruIndex, 'Масштабирование Kubernetes с Karpenter');
  assertFinds('Krakow', ruIndex, 'Масштабирование Kubernetes с Karpenter');
});

test('Russian: authors of the book are found in both scripts', () => {
  assert.deepEqual(titles('Довнар', ruIndex), ['Cracking the Kubernetes Interview']);
  assert.deepEqual(titles('Dovnar', ruIndex), ['Cracking the Kubernetes Interview']);
});

test('Russian: a typo in a long word is tolerated', () => {
  assertFinds('манифсты', ruIndex, 'Почему я всё ещё пишу манифесты Kubernetes руками');
  assertFinds('маниферты', ruIndex, 'Почему я всё ещё пишу манифесты Kubernetes руками');
  assertFinds('kubernets', ruIndex, 'Cracking the Kubernetes Interview');
});

// -- negative cases --------------------------------------------------------

test('unrelated queries match nothing', () => {
  for (const query of ['blockchain', 'xyzzy', 'zzzz', 'qwertyuiop', 'terraformer', 'nonexistent-<script>']) {
    assert.deepEqual(titles(query, enIndex), [], `"${query}" should not match in EN`);
  }
  for (const query of ['футбол', 'бейсбол', 'ывапролдж']) {
    assert.deepEqual(titles(query, ruIndex), [], `"${query}" should not match in RU`);
  }
});

test('empty, blank and punctuation-only queries match nothing', () => {
  for (const query of ['', '   ', '---', '::', '<>']) {
    assert.deepEqual(titles(query, enIndex), [], `"${query}" should match nothing`);
    assert.equal(parseQuery(query), null);
  }
});

test('no sensible query matches every item', () => {
  for (const query of ['karpenter', 'kubernetes', 'aws', 'tashkent', 'latency', 'podcast', 'book', 'mcp', 'cost']) {
    const count = searchItems(query, enIndex, Infinity).length;
    assert.ok(count > 0 && count < enIndex.length, `"${query}" matched ${count} of ${enIndex.length}`);
  }
  for (const query of ['кластеры', 'ташкент', 'подкаст', 'книга', 'karpenter']) {
    const count = searchItems(query, ruIndex, Infinity).length;
    assert.ok(count > 0 && count < ruIndex.length, `"${query}" matched ${count} of ${ruIndex.length}`);
  }
});

test('searchItems honours the limit and keeps input order for equal scores', () => {
  assert.equal(searchItems('kubernetes', enIndex, 3).length, 3);
  const karpenter = searchItems('karpenter', enIndex);
  const scores = karpenter.map((item) => scoreItem(parseQuery('karpenter')!, item));
  for (let i = 1; i < scores.length; i++) assert.ok(scores[i - 1] >= scores[i]);
  const equal = karpenter.filter((_, i) => scores[i] === scores[0]);
  const original = enIndex.filter((item) => equal.includes(item));
  assert.deepEqual(equal, original);
});
