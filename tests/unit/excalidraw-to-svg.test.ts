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
const WHITE_RECT_PLUS_SRC = path.join(FIXTURE_DIR, 'white-rect-plus-shape.excalidraw.json');
const MALFORMED_SOURCE_SRC = path.join(FIXTURE_DIR, 'malformed-source.excalidraw.json');
const MALFORMED_META_SIBLING = path.join(FIXTURE_DIR, 'malformed-meta.meta.json');
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

// --- Phase 04.1 UX pipeline fixes (D-07 + D-08) --------------------------------

test('UX-01 :: strips-leading-white-rect — SVGO narrow selector removes path[fill="#fff"][d^="M0 0h"] (D-07)', () => {
  const dest = tmpDest('white-strip');
  try {
    const result = run([WHITE_RECT_PLUS_SRC, dest]);
    assert.equal(result.status, 0, `pipeline failed: ${result.stderr}`);
    const svg = fs.readFileSync(dest, 'utf8');
    // The leading M0 0h... path must NOT retain its fill="#fff" attribute.
    // Either (a) the path was fully pruned by SVGO multipass, or (b) it survives
    // without fill. Either outcome → no bright slab on Deep Signal dark prose.
    assert.ok(
      !/<path[^>]*fill="#fff"[^>]*d="M0 0h/.test(svg),
      'leading full-canvas white rect must be stripped by D-07 narrow selector. ' +
        'Got SVG: ' + svg.slice(0, 500)
    );
    assert.ok(
      !/<path[^>]*d="M0 0h[^>]*fill="#fff"/.test(svg),
      'leading full-canvas white rect must be stripped regardless of attribute order'
    );
  } finally {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('UX-01 :: preserves-interior-white-shapes — narrow selector does not over-match (D-07)', () => {
  const dest = tmpDest('white-preserve');
  try {
    const result = run([WHITE_RECT_PLUS_SRC, dest]);
    assert.equal(result.status, 0, `pipeline failed: ${result.stderr}`);
    const svg = fs.readFileSync(dest, 'utf8');
    // The interior white rectangle at x=120, y=50 must still render.
    // Excalidraw emits interior rectangles via a <path> or <g transform="translate(120 50)">.
    // Stronger assertion: there must be at least TWO <g or <path elements in the output
    // (one for rect-visible at 10,10 and one for rect-interior-white at 120,50).
    assert.ok(
      svg.length > 500,
      'interior white rectangle must survive — output is suspiciously small, narrow selector over-matched'
    );
    const shapeElements = (svg.match(/<(path|g|rect)\b/g) || []).length;
    assert.ok(
      shapeElements >= 2,
      `expected >= 2 path/g/rect elements in output (the 2 non-canvas shapes), got ${shapeElements}. SVG: ${svg.slice(0, 500)}`
    );
  } finally {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('UX-04 :: helvetica-fallback-chain — post-SVGO replace applies Windows-safe font fallback (D-08)', () => {
  // Build a source JSON with a text element using Helvetica (fontFamily=2).
  // The wrapper emits font-family="Helvetica, Segoe UI Emoji" by default for fontFamily=2.
  // After D-08 post-SVGO replace, every such occurrence must become
  // font-family="Helvetica, Arial, sans-serif".
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `helvetica-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.writeFileSync(srcPath, JSON.stringify({
    type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
    elements: [
      {
        id: 'rect-anchor',
        type: 'rectangle', x: 10, y: 10, width: 100, height: 40,
        angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
        fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid',
        roughness: 1, opacity: 100, groupIds: [], frameId: null,
        roundness: { type: 3 }, seed: 501,
        version: 1, versionNonce: 5001, updated: 1700000000000,
        isDeleted: false, boundElements: [], link: null, locked: false,
      },
      {
        id: 'text-helvetica',
        type: 'text', x: 20, y: 20, width: 80, height: 20,
        angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
        fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid',
        roughness: 1, opacity: 100, groupIds: [], frameId: null,
        roundness: null, seed: 502,
        version: 1, versionNonce: 5002, updated: 1700000000000,
        isDeleted: false, boundElements: [], link: null, locked: false,
        text: 'Helvetica', fontSize: 16, fontFamily: 2,
        textAlign: 'left', verticalAlign: 'top', baseline: 18,
        containerId: null, originalText: 'Helvetica', lineHeight: 1.25, autoResize: true,
      },
    ],
    appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
    files: {},
  }));
  fs.writeFileSync(metaPath, JSON.stringify({ title: 'Helvetica test', descEn: 'D-08 fallback verification' }));
  const dest = tmpDest('helvetica');
  try {
    const result = run([srcPath, dest]);
    assert.equal(result.status, 0, `pipeline failed: ${result.stderr}`);
    const svg = fs.readFileSync(dest, 'utf8');
    assert.match(
      svg,
      /font-family="Helvetica, Arial, sans-serif"/,
      'every Helvetica font-family must be replaced with the full fallback chain per D-08'
    );
    // Negative assertion: standalone Helvetica (without the Arial fallback) must not appear.
    assert.ok(
      !/font-family="Helvetica"(?!, Arial)/.test(svg),
      'no standalone font-family="Helvetica" — must always include the fallback chain'
    );
    assert.ok(
      !/font-family="Helvetica, Segoe UI Emoji"/.test(svg),
      'the Excalidraw-default `Helvetica, Segoe UI Emoji` variant must also be replaced'
    );
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

// --- Phase 04.1 Code quality + test coverage (D-11..D-17) ---------------------

test('Quality :: malformed-json-source — pipeline rejects syntactically-broken source with file-aware error (D-11)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  // Copy malformed-source fixture + a valid meta sibling to a temp path.
  const srcPath = path.join(TESTS_TMP, `mjs-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.copyFileSync(MALFORMED_SOURCE_SRC, srcPath);
  fs.copyFileSync(path.join(FIXTURE_DIR, 'minimal.meta.json'), metaPath);
  const dest = tmpDest('malformed-src');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0, 'script must refuse malformed source JSON');
    assert.match(result.stderr || '', /failed to parse JSON/i, 'error must mention parse failure');
    assert.match(result.stderr || '', /\.excalidraw\.json/i, 'error must name the offending file extension');
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Quality :: malformed-json-meta — pipeline rejects syntactically-broken meta with file-aware error (D-11)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `mjm-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  // Valid source, malformed meta.
  fs.copyFileSync(MINIMAL_SRC, srcPath);
  fs.copyFileSync(MALFORMED_META_SIBLING, metaPath);
  const dest = tmpDest('malformed-meta');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0, 'script must refuse malformed meta JSON');
    assert.match(result.stderr || '', /failed to parse JSON/i);
    assert.match(result.stderr || '', /\.meta\.json/i, 'error must name the meta file extension');
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Quality :: rejects-empty-string-title (D-12)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `empty-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.copyFileSync(MINIMAL_SRC, srcPath);
  fs.writeFileSync(metaPath, JSON.stringify({ title: '', descEn: 'y' }));
  const dest = tmpDest('empty-title');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr || '', /meta\.title.*non-empty string/i);
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Quality :: rejects-whitespace-title (D-12)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `ws-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.copyFileSync(MINIMAL_SRC, srcPath);
  fs.writeFileSync(metaPath, JSON.stringify({ title: '   ', descEn: 'y' }));
  const dest = tmpDest('ws-title');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr || '', /meta\.title.*non-empty string/i);
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Quality :: rejects-object-title — catches the {en: "..."} author mistake (D-12)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `obj-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.copyFileSync(MINIMAL_SRC, srcPath);
  fs.writeFileSync(metaPath, JSON.stringify({ title: { en: 'x' }, descEn: 'y' }));
  const dest = tmpDest('obj-title');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr || '', /meta\.title.*non-empty string/i);
    // Error should quote the bad value via JSON.stringify so author sees the shape.
    assert.match(result.stderr || '', /"en":"x"/);
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Quality :: oversize-files-blob — 110 KB base64 dataURL rejected on size (D-13)', () => {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `oversize-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  const bigBase64 = 'A'.repeat(110 * 1024); // 110 KB payload, > 100 KB cap
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
    files: { f1: { id: 'f1', mimeType: 'image/png', dataURL: `data:image/png;base64,${bigBase64}` } },
  }));
  fs.writeFileSync(metaPath, JSON.stringify({ title: 'oversize', descEn: 'test' }));
  const dest = tmpDest('oversize-files');
  try {
    const result = run([srcPath, dest]);
    assert.notEqual(result.status, 0, 'script must refuse files blob > 100 KB');
    assert.match(
      result.stderr || '',
      /files blob.*exceeds|100.*cap|102400/i,
      'error must mention blob/cap/size'
    );
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});

test('Idempotency :: byte-stable-on-rerun — two runs on minimal fixture produce identical SVG bytes (D-14)', () => {
  // This test holds only for deterministic-seed fixtures. Real-world diagrams
  // re-exported from Excalidraw UI will NOT be byte-stable — see
  // diagrams-source/README.md §Determinism caveat.
  const destA = tmpDest('idem-a');
  const destB = tmpDest('idem-b');
  try {
    const resA = run([MINIMAL_SRC, destA]);
    const resB = run([MINIMAL_SRC, destB]);
    assert.equal(resA.status, 0, `run A failed: ${resA.stderr}`);
    assert.equal(resB.status, 0, `run B failed: ${resB.stderr}`);
    const a = fs.readFileSync(destA);
    const b = fs.readFileSync(destB);
    assert.ok(
      a.equals(b),
      'two runs on minimal.excalidraw.json must produce byte-identical output ' +
        '(hardcoded seeds 1-5 make the rough.js jitter deterministic)'
    );
  } finally {
    if (fs.existsSync(destA)) fs.unlinkSync(destA);
    if (fs.existsSync(destB)) fs.unlinkSync(destB);
  }
});

// D-15 (Q-12) — parametric Unicode coverage. Each codepoint gets its own test
// so a failure points at the specific character class. CODEPOINTS ENCODED VIA
// \u{...} / \u.... ESCAPE SEQUENCES ONLY — never raw invisible bytes in this file.
// This keeps the file diff-reviewable (RTL / ZWJ / combining marks would otherwise
// render invisible in a text editor) and trips zero injection-scanner heuristics.
// Per 04.1-CONTEXT.md §D-15: "never paste raw invisible bytes into the fixture or the test".

function runUnicodeTest(label: string, codepointSeq: string, testName: string) {
  fs.mkdirSync(TESTS_TMP, { recursive: true });
  const srcPath = path.join(TESTS_TMP, `u-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.excalidraw.json`);
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.copyFileSync(MINIMAL_SRC, srcPath);
  fs.writeFileSync(metaPath, JSON.stringify({
    title: `Unicode pinning test ${codepointSeq}`,
    descEn: `Codepoint under test: ${codepointSeq} (${testName})`,
  }));
  const dest = tmpDest(`u-${label}`);
  try {
    const result = run([srcPath, dest]);
    assert.equal(result.status, 0, `pipeline failed on ${testName}: ${result.stderr}`);
    const svg = fs.readFileSync(dest, 'utf8');
    assert.ok(
      svg.includes(codepointSeq),
      `${testName} must survive escapeXml + SVGO round-trip into <title>/<desc>`
    );
  } finally {
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
}

test('escapeXml :: emoji rocket U+1F680 passes through unchanged (D-15)', () => {
  // U+1F680 ROCKET (supplementary plane, 4-byte UTF-8, surrogate pair in UTF-16)
  runUnicodeTest('emoji', '\u{1F680}', 'U+1F680 rocket emoji');
});

test('escapeXml :: RTL mark U+200F passes through unchanged (D-15)', () => {
  // U+200F RIGHT-TO-LEFT MARK (format control, invisible — escape form only!)
  runUnicodeTest('rtl', '\u200F', 'U+200F right-to-left mark');
});

test('escapeXml :: zero-width joiner U+200D passes through unchanged (D-15)', () => {
  // U+200D ZERO WIDTH JOINER (format control, invisible — escape form only!)
  runUnicodeTest('zwj', '\u200D', 'U+200D zero-width joiner');
});

test('escapeXml :: combining acute U+0301 passes through unchanged (D-15)', () => {
  // U+0301 COMBINING ACUTE ACCENT, appended to LATIN SMALL LETTER E (U+0065)
  // to form the canonical decomposition of 'é'. Escape form keeps the combining
  // mark reviewable; composed form 'é' would render as one glyph but be ambiguous
  // between U+00E9 (precomposed) and U+0065+U+0301 (decomposed).
  runUnicodeTest('acute', 'e\u0301', 'U+0065+U+0301 e + combining acute');
});

test('escapeXml :: CJK ideographs U+4E2D U+6587 pass through unchanged (D-15)', () => {
  // U+4E2D + U+6587 = "Chinese language" (the two CJK ideographs for zhong+wen). Escape form keeps the bytes
  // consistent across editors that may normalize or re-encode CJK regions.
  runUnicodeTest('cjk', '\u4E2D\u6587', 'U+4E2D U+6587 CJK ideographs');
});

test('Quality :: quiet-flag-suppresses-stdout (D-17)', () => {
  const dest = tmpDest('quiet');
  try {
    const result = run([MINIMAL_SRC, dest, '--quiet']);
    assert.equal(result.status, 0, `pipeline failed: ${result.stderr}`);
    // Quiet mode — no success lines. Accept empty OR newline-only stdout.
    assert.ok(
      (result.stdout || '').trim().length === 0,
      `--quiet must suppress success stdout. Got: ${JSON.stringify(result.stdout)}`
    );
    assert.ok(fs.existsSync(dest), 'output SVG must still be written');
  } finally {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
});
