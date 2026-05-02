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
