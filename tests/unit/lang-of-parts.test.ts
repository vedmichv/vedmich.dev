import { test } from 'node:test';
import assert from 'node:assert/strict';
import { langOfText } from '../../src/i18n/lang-of-parts.ts';

test('English title on a RU page is marked lang="en"', () => {
  assert.equal(langOfText('Building an RCA Agent with Amazon Bedrock AgentCore', 'ru'), 'en');
  assert.equal(langOfText('Cracking the Kubernetes Interview', 'ru'), 'en');
});

test('Russian title on a RU page, even with Latin product names, is not marked', () => {
  assert.equal(langOfText('Kubernetes Gateway API: с нуля до продакшна', 'ru'), undefined);
  assert.equal(langOfText('Prompt Engineering для DevOps', 'ru'), undefined);
});

test('text without letters is never marked', () => {
  assert.equal(langOfText('2026', 'ru'), undefined);
  assert.equal(langOfText('', 'ru'), undefined);
  assert.equal(langOfText('2026', 'en'), undefined);
});

test('Russian text on an EN page is marked lang="ru"', () => {
  assert.equal(langOfText('AWS на русском', 'en'), 'ru');
  assert.equal(langOfText('Deep dive into Karpenter', 'en'), undefined);
});
