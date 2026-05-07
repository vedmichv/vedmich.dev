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
const PARSERERROR_SRC = path.join(FIXTURE_DIR, 'parsererror-trigger.excalidraw.json');
// Phase 04.1 D-02 (SEC-C01) — tests write to repo-local tests/tmp/ (gitignored) instead of $TMPDIR.
const TESTS_TMP = path.join(REPO_ROOT, 'tests', 'tmp');

function tmpDest(label: string): string {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  return path.join(TESTS_TMP, `excal-test-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.svg`);
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
  // Phase 04.1 D-02: orphan src must live under ALLOWED_WRITE_ROOTS (tests/tmp/), not $TMPDIR —
  // otherwise validatePath rejects before the meta-existence gate is reached.
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const orphanSrc = path.join(TESTS_TMP, `orphan-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
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

// --- Phase 04.1 Security hardening (T-04.1-01..T-04.1-04) ---------------------

test('Security :: rejects-symlink-escape — destPath symlink that resolves outside REPO_ROOT is refused (SEC-C01)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  // Sentinel lives OUTSIDE any allowed write root — under os.tmpdir().
  const victim = path.join(os.tmpdir(), `victim-${Date.now()}-${Math.floor(Math.random() * 1e6)}.txt`);
  fs.writeFileSync(victim, 'SENTINEL_DO_NOT_OVERWRITE');
  const linkInRepo = path.join(TESTS_TMP, `link-${Date.now()}-${Math.floor(Math.random() * 1e6)}.svg`);
  fs.symlinkSync(victim, linkInRepo);
  try {
    const result = run([MINIMAL_SRC, linkInRepo]);
    assert.notEqual(result.status, 0, 'script must refuse symlink writes that escape allowed roots');
    assert.equal(
      fs.readFileSync(victim, 'utf8'),
      'SENTINEL_DO_NOT_OVERWRITE',
      'victim file outside ALLOWED_WRITE_ROOTS must remain untouched'
    );
    assert.match(
      result.stderr || '',
      /traversal|allowed roots|ALLOWED_WRITE_ROOTS/i,
      'error must mention traversal or allowed-roots rejection'
    );
  } finally {
    if (fs.existsSync(linkInRepo)) fs.unlinkSync(linkInRepo);
    if (fs.existsSync(victim)) fs.unlinkSync(victim);
  }
});

test('Security :: strips-script-tags — SVGO_CONFIG deletes <script>, onload, onclick (SEC-C02)', async () => {
  // Direct-SVGO unit test: import optimize(), feed a synthetic malicious SVG,
  // assert plugin pipeline matching scripts/excalidraw-to-svg.mjs Task-2 edit strips the payload.
  // Rationale: the real pipeline goes through the wrapper which escapes element.text content,
  // so a full-pipeline test cannot directly prove SVGO strips what the wrapper let through.
  // This test pins the SVGO layer itself — the defense-in-depth that T-04-02 claimed and now delivers.
  const { optimize } = await import('svgo');
  const SVGO_CONFIG_MIRROR = {
    multipass: true,
    plugins: [
      { name: 'preset-default', params: { overrides: { removeDesc: false } } },
      'removeScripts',
      {
        name: 'removeAttributesBySelector',
        params: {
          selectors: [
            { selector: '[onload]',      attributes: 'onload' },
            { selector: '[onclick]',     attributes: 'onclick' },
            { selector: '[onmouseover]', attributes: 'onmouseover' },
            { selector: '[onerror]',     attributes: 'onerror' },
            { selector: '[onfocus]',     attributes: 'onfocus' },
          ],
        },
      },
    ],
  } as const;
  const malicious =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    '<script>alert(1)</script>' +
    '<g onload="alert(1)"><rect onclick="x()" x="0" y="0" width="10" height="10"/></g>' +
    '<circle cx="50" cy="50" r="10" onmouseover="y()"/>' +
    '</svg>';
  const { data: optimized } = optimize(malicious, SVGO_CONFIG_MIRROR);
  assert.ok(!optimized.includes('<script'), 'SVGO removeScripts must delete <script> elements');
  assert.ok(!optimized.includes('onload='), 'SVGO removeAttributesBySelector must delete onload');
  assert.ok(!optimized.includes('onclick='), 'SVGO removeAttributesBySelector must delete onclick');
  assert.ok(!optimized.includes('onmouseover='), 'SVGO removeAttributesBySelector must delete onmouseover');
  assert.ok(optimized.includes('<svg'), 'legitimate <svg> root must survive');
});

test('Security :: rejects-dataURL-file-scheme — files.dataURL with file:// is refused (SEC-H03)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `ssrf-file-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.writeFileSync(srcPath, JSON.stringify({
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
    elements: [{
      id: 'r1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
      fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1,
      opacity: 100, groupIds: [], frameId: null, roundness: { type: 3 },
      seed: 1, version: 1, versionNonce: 1, updated: 1700000000000,
      isDeleted: false, boundElements: [], link: null, locked: false,
    }],
    appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
    files: { f1: { id: 'f1', mimeType: 'image/png', dataURL: 'file:///etc/hosts' } },
  }));
  fs.writeFileSync(metaPath, JSON.stringify({ title: 'x', descEn: 'y' }));
  const dest = tmpDest('ssrf-file');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0, 'script must refuse file:// scheme in files.dataURL');
    assert.match(
      result.stderr || '',
      /dataURL|data:image|External URLs/i,
      'error must mention refused scheme'
    );
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Security :: rejects-dataURL-http-scheme — files.dataURL with http:// is refused (SEC-H03)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `ssrf-http-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.writeFileSync(srcPath, JSON.stringify({
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
    elements: [{
      id: 'r1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
      fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1,
      opacity: 100, groupIds: [], frameId: null, roundness: { type: 3 },
      seed: 1, version: 1, versionNonce: 1, updated: 1700000000000,
      isDeleted: false, boundElements: [], link: null, locked: false,
    }],
    appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
    files: { f1: { id: 'f1', mimeType: 'image/gif', dataURL: 'http://evil.com/pixel.gif?u=leak' } },
  }));
  fs.writeFileSync(metaPath, JSON.stringify({ title: 'x', descEn: 'y' }));
  const dest = tmpDest('ssrf-http');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0, 'script must refuse http:// scheme in files.dataURL');
    assert.match(result.stderr || '', /dataURL|data:image|External URLs/i);
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Security :: rejects-dataURL-https-scheme — files.dataURL with https:// is refused (SEC-H03)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `ssrf-https-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.writeFileSync(srcPath, JSON.stringify({
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
    elements: [{
      id: 'r1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
      fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1,
      opacity: 100, groupIds: [], frameId: null, roundness: { type: 3 },
      seed: 1, version: 1, versionNonce: 1, updated: 1700000000000,
      isDeleted: false, boundElements: [], link: null, locked: false,
    }],
    appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
    files: { f1: { id: 'f1', mimeType: 'image/png', dataURL: 'https://attacker.example.com/track.gif' } },
  }));
  fs.writeFileSync(metaPath, JSON.stringify({ title: 'x', descEn: 'y' }));
  const dest = tmpDest('ssrf-https');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0, 'script must refuse https:// scheme in files.dataURL');
    assert.match(result.stderr || '', /dataURL|data:image|External URLs/i);
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Security :: rejects-dataURL-svg-mime — files.dataURL with data:image/svg+xml is refused (SEC-H03)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `ssrf-svg-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.writeFileSync(srcPath, JSON.stringify({
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
    elements: [{
      id: 'r1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
      fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1,
      opacity: 100, groupIds: [], frameId: null, roundness: { type: 3 },
      seed: 1, version: 1, versionNonce: 1, updated: 1700000000000,
      isDeleted: false, boundElements: [], link: null, locked: false,
    }],
    appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
    files: { f1: { id: 'f1', mimeType: 'image/svg+xml', dataURL: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' } },
  }));
  fs.writeFileSync(metaPath, JSON.stringify({ title: 'x', descEn: 'y' }));
  const dest = tmpDest('ssrf-svg');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0, 'script must refuse data:image/svg+xml scheme (SVG-in-SVG = XSS risk)');
    assert.match(result.stderr || '', /dataURL|data:image|External URLs/i);
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Security :: accepts-dataURL-png-base64 — positive case for valid raster scheme (SEC-H03 positive)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `ssrf-ok-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  // 70-byte valid 1x1 PNG
  const validPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=';
  fs.writeFileSync(srcPath, JSON.stringify({
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
    elements: [{
      id: 'r1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
      fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1,
      opacity: 100, groupIds: [], frameId: null, roundness: { type: 3 },
      seed: 1, version: 1, versionNonce: 1, updated: 1700000000000,
      isDeleted: false, boundElements: [], link: null, locked: false,
    }],
    appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
    files: { f1: { id: 'f1', mimeType: 'image/png', dataURL: validPng } },
  }));
  fs.writeFileSync(metaPath, JSON.stringify({ title: 'x', descEn: 'y' }));
  const dest = tmpDest('ssrf-ok');
  try {
    const result = run([srcPath, dest]);
    assert.equal(result.status, 0, `valid base64 PNG must be accepted. stderr: ${result.stderr}`);
    assert.ok(fs.existsSync(dest), 'output SVG must exist');
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Integrity :: rejects-parsererror — wrapper parsererror output is refused (SEC-H04)', () => {
  // Uses the parsererror-trigger.excalidraw.json fixture (from 04.1-01 Task 1).
  const metaPath = PARSERERROR_SRC.replace(/\.excalidraw\.json$/, '.meta.json');
  const dest = tmpDest('parsererror');
  try {
    const result = run([PARSERERROR_SRC, dest]);
    assert.notEqual(result.status, 0, 'script must refuse parsererror document as SVG');
    assert.match(
      result.stderr || '',
      /parsererror/i,
      'error must mention parsererror'
    );
    assert.ok(!fs.existsSync(dest), 'no .svg file must be written when parsererror detected');
  } finally {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
  // Sanity: ensure the meta sidecar still exists after the run (no cleanup side-effect)
  assert.ok(fs.existsSync(metaPath), 'parsererror-trigger.meta.json must not be deleted by the test');
});
