import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  groupEventsByYear,
  groupTalksByEvent,
  limitEvents,
  newestTalk,
  type GroupableTalk,
} from '../../src/lib/talk-groups.ts';

function talk(id: string, event: string, city: string, date: string, extra: Partial<GroupableTalk['data']> = {}): GroupableTalk {
  return { id, data: { title: `Title ${id}`, event, city, date: new Date(date), ...extra } };
}

const talks = [
  talk('a1', 'Event A', 'Oslo', '2026-10-22'),
  talk('a2', 'Event A', 'Oslo', '2026-10-22', { format: 'workshop' }),
  talk('a3', 'Event A', 'Oslo', '2026-10-21'),
  talk('b', 'Event B', 'Rome', '2026-05-20'),
  talk('c', 'Event C', 'Kyiv', '2025-12-04'),
  talk('d', 'Event D', 'Riga', '2025-03-01'),
  talk('e1', 'Event E', 'Bern', '2024-11-11'),
  talk('e2', 'Event E', 'Bern', '2024-11-11'),
  talk('f', 'Event F', 'Graz', '2023-01-05'),
  talk('g', 'Event G', 'Nice', '2022-08-08'),
];

test('sessions of one event, city and year become one group, newest event first', () => {
  const groups = groupTalksByEvent(talks);
  assert.deepEqual(groups.map((g) => g.event), ['Event A', 'Event B', 'Event C', 'Event D', 'Event E', 'Event F', 'Event G']);
  assert.deepEqual(groups[0].talks.map((t) => t.id), ['a3', 'a1', 'a2'], 'sessions inside an event run in agenda order');
});

test('the same event name in another year is another event', () => {
  const groups = groupTalksByEvent([
    talk('x1', 'Same Event', 'Oslo', '2025-06-01'),
    talk('x2', 'Same Event', 'Oslo', '2026-06-01'),
  ]);
  assert.equal(groups.length, 2);
});

test('the limit counts events, not sessions', () => {
  const groups = limitEvents(groupTalksByEvent(talks), 6);
  assert.equal(groups.length, 6);
  assert.equal(groups.flatMap((g) => g.talks).length, 9, 'six events keep all their sessions: 3 + 1 + 1 + 1 + 2 + 1');
  assert.deepEqual(groups.map((g) => g.event), ['Event A', 'Event B', 'Event C', 'Event D', 'Event E', 'Event F']);
});

test('an event with three sessions uses one slot of the limit', () => {
  const groups = limitEvents(groupTalksByEvent(talks), 1);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].talks.length, 3);
});

test('no limit keeps every event', () => {
  const all = groupTalksByEvent(talks);
  assert.equal(limitEvents(all).length, all.length);
  assert.equal(limitEvents(all, 0).length, all.length);
});

test('years that lose all their events after the limit disappear', () => {
  const years = groupEventsByYear(limitEvents(groupTalksByEvent(talks), 3));
  assert.deepEqual(years.map(([year]) => year), [2026, 2025]);
  assert.deepEqual(years[0][1].map((g) => g.event), ['Event A', 'Event B']);
});

test('the newest talk prefers a regular talk over a workshop on the same day', () => {
  assert.equal(newestTalk(talks)?.id, 'a1');
  assert.equal(newestTalk([]), undefined);
});
