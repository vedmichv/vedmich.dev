import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createStageRegistry,
  pushStage,
  popStage,
  currentRegistry,
} from '../../src/components/visuals/_vv-registry.ts';

test('createStageRegistry returns empty maps + unique uid', () => {
  const r = createStageRegistry();
  assert.equal(r.nodes.size, 0);
  assert.equal(r.wires.size, 0);
  assert.ok(r.uid.length >= 6, `uid '${r.uid}' too short`);
  const r2 = createStageRegistry();
  assert.notEqual(r.uid, r2.uid, 'uids must be unique');
});

test('registerNode stores record + getNode retrieves', () => {
  const r = createStageRegistry();
  r.registerNode({ id: 'api', x: 360, y: 330, w: 220, h: 160 });
  const got = r.getNode('api');
  assert.equal(got?.x, 360);
  assert.equal(got?.w, 220);
  assert.equal(r.getNode('missing'), undefined);
});

test('registerWire stores record + getWire retrieves', () => {
  const r = createStageRegistry();
  r.registerWire({ id: 'kubectl-api', from: 'kubectl', to: 'api', dashed: false });
  const got = r.getWire('kubectl-api');
  assert.equal(got?.from, 'kubectl');
  assert.equal(r.getWire('missing'), undefined);
});

test('pushStage+currentRegistry happy path', () => {
  const r = createStageRegistry();
  pushStage(r);
  try {
    const active = currentRegistry();
    assert.equal(active.uid, r.uid);
  } finally {
    popStage();
  }
});

test('currentRegistry throws when no stage is active', () => {
  // Make sure no stage is active (guard against prior test leaving state)
  try { popStage(); } catch { /* already popped */ }
  assert.throws(() => currentRegistry(), /must be inside a <VvStage>/);
});

test('nested pushStage throws per Pitfall D', () => {
  const a = createStageRegistry();
  const b = createStageRegistry();
  pushStage(a);
  try {
    assert.throws(() => pushStage(b), /nested or concurrent/);
  } finally {
    popStage();
  }
});

test('sequential stage lifecycles work without leakage', () => {
  for (let i = 0; i < 3; i++) {
    const r = createStageRegistry();
    pushStage(r);
    r.registerNode({ id: 'x', x: i, y: 0, w: 10, h: 10 });
    assert.equal(currentRegistry().getNode('x')?.x, i);
    popStage();
  }
  // After the loop, no stage is active
  assert.throws(() => currentRegistry(), /must be inside a <VvStage>/);
});

test('registerPacket stores record + getPacket retrieves', () => {
  const r = createStageRegistry();
  r.registerPacket({
    id: 'pkt-1', wire: 'kubectl-api',
    duration: '1.4s', delay: '1.2s',
    r: 10, glow: true, tone: 'teal', loop: true, gap: '4s',
  });
  const got = r.getPacket('pkt-1');
  assert.equal(got?.wire, 'kubectl-api');
  assert.equal(got?.duration, '1.4s');
  assert.equal(got?.glow, true);
  assert.equal(r.getPacket('missing'), undefined);
});

test('NodeRecord carries label/tone/animation/delay/iconHtml', () => {
  const r = createStageRegistry();
  r.registerNode({
    id: 'api', x: 360, y: 330, w: 220, h: 160,
    label: 'API server', tone: 'teal', animation: 'pop', delay: 300,
    iconHtml: '<svg viewBox="0 0 24 24"/>',
  });
  const got = r.getNode('api');
  assert.equal(got?.label, 'API server');
  assert.equal(got?.tone, 'teal');
  assert.equal(got?.animation, 'pop');
  assert.equal(got?.delay, 300);
  assert.equal(got?.iconHtml, '<svg viewBox="0 0 24 24"/>');
});

test('packets map starts empty + is isolated across stage lifecycles', () => {
  const r1 = createStageRegistry();
  assert.equal(r1.packets.size, 0);
  r1.registerPacket({
    id: 'p', path: 'M 0 0 L 10 10', duration: '1s', delay: '0s',
    r: 10, glow: true, tone: 'teal', loop: false, gap: '0s',
  });
  assert.equal(r1.packets.size, 1);
  const r2 = createStageRegistry();
  assert.equal(r2.packets.size, 0);
});
