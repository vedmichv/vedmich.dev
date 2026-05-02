import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeEdgePoints, type Rect } from '../../src/components/visuals/_vv-geom.ts';

test('horizontal wire between equal rects meets at facing edges', () => {
  const from: Rect = { cx: 100, cy: 100, w: 200, h: 100 };
  const to:   Rect = { cx: 400, cy: 100, w: 200, h: 100 };
  const { a, b } = computeEdgePoints(from, to);
  assert.equal(a.x, 200);
  assert.equal(a.y, 100);
  assert.equal(b.x, 300);
  assert.equal(b.y, 100);
});

test('vertical wire between equal rects meets at top/bottom edges', () => {
  const from: Rect = { cx: 100, cy: 100, w: 200, h: 100 };
  const to:   Rect = { cx: 100, cy: 400, w: 200, h: 100 };
  const { a, b } = computeEdgePoints(from, to);
  assert.equal(a.x, 100);
  assert.equal(a.y, 150); // bottom edge of from (cy + h/2)
  assert.equal(b.x, 100);
  assert.equal(b.y, 350); // top edge of to (cy - h/2)
});

test('diagonal wire between UNEQUAL rects ends on respective borders', () => {
  // from: 200×100 at center (100,100) → right edge x=200, top/bottom y=50..150
  // to:   300×200 at center (600,400) → left edge x=450, top/bottom y=300..500
  const from: Rect = { cx: 100, cy: 100, w: 200, h: 100 };
  const to:   Rect = { cx: 600, cy: 400, w: 300, h: 200 };
  const { a, b } = computeEdgePoints(from, to);
  // a is on from's border: either x == 0 or x == 200 (vertical edges) or y == 50 or y == 150 (horizontal edges)
  const onFromBorder =
    Math.abs(a.x - 0) < 1e-6 || Math.abs(a.x - 200) < 1e-6 ||
    Math.abs(a.y - 50) < 1e-6 || Math.abs(a.y - 150) < 1e-6;
  assert.ok(onFromBorder, `point a ${JSON.stringify(a)} not on from rect border`);
  const onToBorder =
    Math.abs(b.x - 450) < 1e-6 || Math.abs(b.x - 750) < 1e-6 ||
    Math.abs(b.y - 300) < 1e-6 || Math.abs(b.y - 500) < 1e-6;
  assert.ok(onToBorder, `point b ${JSON.stringify(b)} not on to rect border`);
});

test('degenerate zero-distance rects return centers without throwing', () => {
  const from: Rect = { cx: 100, cy: 100, w: 200, h: 100 };
  const to:   Rect = { cx: 100, cy: 100, w: 200, h: 100 };
  const { a, b } = computeEdgePoints(from, to);
  assert.equal(a.x, 100);
  assert.equal(a.y, 100);
  assert.equal(b.x, 100);
  assert.equal(b.y, 100);
});

test('PodLifecycle horizontal wire (kubectl → api) produces 280,410 → 360,410', () => {
  // PodLifecycleAnimation.astro line 77: kubectl(60,330) to api(360,330), nodes 220×160.
  // Centers: (60+110, 330+80)=(170,410) and (360+110, 330+80)=(470,410). Equal widths → edges at x=280 (left of api) and x=280 from kubectl? No — from exits right edge x=170+110=280, to enters left edge x=470-110=360. Same y=410.
  const from: Rect = { cx: 170, cy: 410, w: 220, h: 160 };
  const to:   Rect = { cx: 470, cy: 410, w: 220, h: 160 };
  const { a, b } = computeEdgePoints(from, to);
  assert.equal(a.x, 280);
  assert.equal(a.y, 410);
  assert.equal(b.x, 360);
  assert.equal(b.y, 410);
});
