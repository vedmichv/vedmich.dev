import { test } from 'node:test';
import assert from 'node:assert/strict';
import { videoPlatform } from '../../src/lib/video.ts';

test('YouTube links are embeddable', () => {
  assert.deepEqual(videoPlatform('https://www.youtube.com/watch?v=abc123&t=4500s'), { name: 'YouTube', embeddable: true });
  assert.deepEqual(videoPlatform('https://youtu.be/abc123'), { name: 'YouTube', embeddable: true });
  assert.deepEqual(videoPlatform('https://m.youtube.com/watch?v=abc123'), { name: 'YouTube', embeddable: true });
});

test('a conference recording is a named link, not an embed', () => {
  assert.deepEqual(videoPlatform('https://www.infoq.com/presentations/valkey-datastore'), { name: 'InfoQ', embeddable: false });
});

test('an unknown host is named by its hostname', () => {
  assert.deepEqual(videoPlatform('https://vimeo.com/123'), { name: 'vimeo.com', embeddable: false });
});
