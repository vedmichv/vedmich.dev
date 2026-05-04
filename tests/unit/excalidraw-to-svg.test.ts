import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

// Integration tests for scripts/excalidraw-to-svg.mjs (Phase 4 — DIAG-01/02/03).
//
// These tests black-box-invoke the script via spawnSync and assert on its
// exit code + stdout/stderr + the written SVG file. Tests deliberately fail
// on PLAN 01 HEAD — the script does not exist yet. PLAN 02 turns them green.
//
// Run via: `npm run test:unit`
//
// When to add tests: any new DIAG-0X behavior. When to update fixtures:
// only if Excalidraw schema bumps (currently v2).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'excalidraw-to-svg.mjs');
const FIXTURE_DIR = path.join(REPO_ROOT, 'tests', 'fixtures', 'excalidraw');
const MINIMAL_SRC = path.join(FIXTURE_DIR, 'minimal.excalidraw.json');
const OVERSIZE_SRC = path.join(FIXTURE_DIR, 'oversize.excalidraw.json');

function tmpDest(label: string): string {
  return path.join(os.tmpdir(), `excal-test-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.svg`);
}

function run(args: string[]) {
  return spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' });
}

// --- DIAG-01 -----------------------------------------------------------------

test('DIAG-01 :: exports-valid-svg — script produces well-formed SVG from minimal fixture', () => {
  const dest = tmpDest('valid');
  const result = run([MINIMAL_SRC, dest]);
  assert.equal(result.status, 0, `script failed (status=${result.status}) stderr: ${result.stderr}`);
  const svg = fs.readFileSync(dest, 'utf8');
  assert.match(svg, /^<svg[\s\S]*<\/svg>\s*$/, 'output must be a well-formed <svg>...</svg> document');
  fs.unlinkSync(dest);
});

test('DIAG-01 :: errors-on-missing-meta — script exits 1 when meta sidecar is absent', () => {
  // Point at a fixture path whose sibling .meta.json does not exist.
  const orphanSrc = path.join(os.tmpdir(), `orphan-${Date.now()}.excalidraw.json`);
  fs.copyFileSync(MINIMAL_SRC, orphanSrc);
  // Deliberately do NOT create orphan.meta.json.
  const dest = tmpDest('orphan');
  const result = run([orphanSrc, dest]);
  assert.notEqual(result.status, 0, 'script must exit non-zero when meta sidecar missing');
  assert.match(result.stderr || result.stdout || '', /meta/i, 'error message must mention meta');
  fs.unlinkSync(orphanSrc);
});

test('DIAG-01 :: errors-on-missing-input — script exits 1 when source file does not exist', () => {
  const bogusSrc = path.join(FIXTURE_DIR, 'does-not-exist.excalidraw.json');
  const dest = tmpDest('bogus');
  const result = run([bogusSrc, dest]);
  assert.notEqual(result.status, 0, 'script must exit non-zero when input missing');
});

// --- DIAG-02 -----------------------------------------------------------------

test('DIAG-02 :: under-10kb-budget — minimal fixture produces SVG ≤ 10 KB post-SVGO', () => {
  const dest = tmpDest('budget');
  const result = run([MINIMAL_SRC, dest]);
  assert.equal(result.status, 0, `script failed: ${result.stderr}`);
  const bytes = fs.statSync(dest).size;
  assert.ok(bytes <= 10 * 1024, `output is ${bytes} B, exceeds 10 KB budget (DIAG-02)`);
  fs.unlinkSync(dest);
});

test('DIAG-02 :: exits-on-oversize — script rejects SVG > 10 KB with non-zero exit', () => {
  // oversize fixture has no meta sidecar; copy minimal.meta.json as 'oversize.meta.json'.
  const oversizeMeta = OVERSIZE_SRC.replace(/\.excalidraw\.json$/, '.meta.json');
  const minimalMeta = MINIMAL_SRC.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.copyFileSync(minimalMeta, oversizeMeta);
  try {
    const dest = tmpDest('oversize');
    const result = run([OVERSIZE_SRC, dest]);
    assert.notEqual(result.status, 0, 'script must exit non-zero when SVG exceeds 10 KB');
    assert.match(result.stderr || '', /10\s*KB|budget|exceeds/i, 'error must mention budget/exceeds/10 KB');
  } finally {
    if (fs.existsSync(oversizeMeta)) fs.unlinkSync(oversizeMeta);
  }
});

// --- DIAG-03 -----------------------------------------------------------------

test('DIAG-03 :: preserves-title — output SVG contains injected <title> from meta', () => {
  const dest = tmpDest('title');
  const result = run([MINIMAL_SRC, dest]);
  assert.equal(result.status, 0, `script failed: ${result.stderr}`);
  const svg = fs.readFileSync(dest, 'utf8');
  assert.match(svg, /<title[^>]*>Test diagram<\/title>/, '<title> must contain meta.title verbatim');
  fs.unlinkSync(dest);
});

test('DIAG-03 :: preserves-desc — output SVG contains injected <desc> (removeDesc: false)', () => {
  const dest = tmpDest('desc');
  const result = run([MINIMAL_SRC, dest]);
  assert.equal(result.status, 0, `script failed: ${result.stderr}`);
  const svg = fs.readFileSync(dest, 'utf8');
  assert.match(svg, /<desc[^>]*>Five-element minimal fixture for pipeline smoke test<\/desc>/,
    '<desc> must contain meta.descEn — SVGO removeDesc override must be applied');
  fs.unlinkSync(dest);
});

test('DIAG-03 :: writes-to-canonical-path — script writes exactly to destPath argument', () => {
  const dest = tmpDest('canonical');
  const result = run([MINIMAL_SRC, dest]);
  assert.equal(result.status, 0);
  assert.ok(fs.existsSync(dest), 'output file must exist at exact destPath arg');
  fs.unlinkSync(dest);
});

// --- Security boundary (T-04-01) -------------------------------------------

test('Security :: rejects-path-traversal — destPath escaping REPO_ROOT is refused', () => {
  const dest = path.join(os.tmpdir(), '..', '..', 'etc', 'excal-traversal-test.svg');
  const result = run([MINIMAL_SRC, dest]);
  assert.notEqual(result.status, 0, 'script must reject destPath that resolves outside REPO_ROOT');
  // Clean up in case the script did write (future regression safety)
  if (fs.existsSync(dest)) fs.unlinkSync(dest);
});
