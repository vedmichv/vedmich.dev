import { test } from 'node:test';
import assert from 'node:assert/strict';
import { platformOf } from '../../src/lib/platform.ts';

test('YouTube links are embeddable', () => {
  assert.deepEqual(platformOf('https://www.youtube.com/watch?v=abc123&t=4500s'), { name: 'YouTube', embeddable: true });
  assert.deepEqual(platformOf('https://youtu.be/abc123'), { name: 'YouTube', embeddable: true });
  assert.deepEqual(platformOf('https://m.youtube.com/watch?v=abc123'), { name: 'YouTube', embeddable: true });
});

test('a conference recording is a named link, not an embed', () => {
  assert.deepEqual(platformOf('https://www.infoq.com/presentations/valkey-datastore'), { name: 'InfoQ', embeddable: false });
});

test('an unknown host is named by its hostname', () => {
  assert.deepEqual(platformOf('https://vimeo.com/123'), { name: 'vimeo.com', embeddable: false });
});
