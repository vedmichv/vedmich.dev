import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Rect } from '../../src/components/visuals/_vv-geom.ts';
import { computeWirePath } from '../../src/components/visuals/_vv-path.ts';

const from: Rect = { cx: 170, cy: 410, w: 220, h: 160 };
const to:   Rect = { cx: 470, cy: 410, w: 220, h: 160 };

test('straight line — no curve, no via', () => {
  const d = computeWirePath(from, to, {});
  assert.equal(d, 'M 280 410 L 360 410');
});

test('bezier — curve > 0 produces a "Q" command', () => {
  const d = computeWirePath(from, to, { curve: 0.2 });
  assert.match(d, /^M 280 410 Q -?\d+(\.\d+)? -?\d+(\.\d+)? 360 410$/);
});

test('polyline — via waypoints produce L commands, no Q', () => {
  const d = computeWirePath(from, to, { via: [[400, 200]] });
  assert.equal(d, 'M 280 410 L 400 200 L 360 410');
  assert.ok(!d.includes('Q'));
});

test('via DOMINATES curve — polyline wins when both are set', () => {
  const d = computeWirePath(from, to, { curve: 0.5, via: [[400, 200]] });
  assert.ok(d.includes('L 400 200'));
  assert.ok(!d.includes('Q'));
});

test('multi-waypoint polyline interpolates through all points', () => {
  const d = computeWirePath(from, to, { via: [[300, 300], [350, 250]] });
  assert.equal(d, 'M 280 410 L 300 300 L 350 250 L 360 410');
});
