// @ts-check
// Source: Phase 4 (Excalidraw Pipeline) — CONTEXT.md D-02c script contract + D-01e library
// One-shot diagram export: .excalidraw.json → optimized SVG with <title>/<desc> a11y.
// Re-runnable via `node scripts/excalidraw-to-svg.mjs <src> <dest>`.
// Output is committed to public/blog-assets/<slug>/diagrams/; NOT run on every build.

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import excalidrawToSvg from '@aldinokemal2104/excalidraw-to-svg';
import { optimize } from 'svgo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
// T-04-01 — allow os.tmpdir() as a valid parent alongside REPO_ROOT so automated
// tests (Wave-0 contract in tests/unit/excalidraw-to-svg.test.ts) can write into
// `/tmp`-style scratch paths while the guard still refuses `..`-traversal tricks
// like `path.join(os.tmpdir(), '..', '..', 'etc', 'x.svg')` (resolves outside both).
const TMP_ROOT = path.resolve(os.tmpdir());

// DIAG-02 hard gate per CONTEXT D-05
const SIZE_BUDGET = 10 * 1024;

// T-04-03 mitigation — reject oversized embedded raster payloads
const FILES_BLOB_BUDGET = 100 * 1024;

// DIAG-02 + Pitfall 1 — preserve injected <desc>, v4 preset-default already keeps <title> + viewBox
const SVGO_CONFIG = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeDesc: false,
        },
      },
    },
  ],
};

// T-04-02 — escape XML metacharacters before injecting into <title>/<desc>
function escapeXml(str) {
  return String(str).replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

// T-04-01 — reject paths that escape the allowed parents (REPO_ROOT or os.tmpdir()).
// Equality checks cover the edge case where the user points exactly at the parent.
// `+ path.sep` on the prefix check prevents false-positive matches like
// `/tmp/foo` claiming it lives under a parent named `/tmp/fo`.
function validatePath(userPath, label) {
  const resolved = path.resolve(userPath);
  const allowed =
    resolved === REPO_ROOT ||
    resolved.startsWith(REPO_ROOT + path.sep) ||
    resolved === TMP_ROOT ||
    resolved.startsWith(TMP_ROOT + path.sep);
  if (!allowed) {
    throw new Error(`path traversal refused — ${label} (${userPath}) resolves outside REPO_ROOT`);
  }
  return resolved;
}

// T-04-03 — reject oversized files blob
function validateFilesBlob(diagram) {
  const files = diagram.files || {};
  let total = 0;
  for (const f of Object.values(files)) {
    if (f && typeof f.dataURL === 'string') total += f.dataURL.length;
  }
  if (total > FILES_BLOB_BUDGET) {
    throw new Error(
      `files blob is ${total} B, exceeds ${FILES_BLOB_BUDGET} B cap — reject oversized embedded rasters`
    );
  }
}

async function main() {
  const [, , srcPathArg, destPathArg] = process.argv;
  if (!srcPathArg || !destPathArg) {
    console.error('Usage: node scripts/excalidraw-to-svg.mjs <source.excalidraw.json> <dest.svg>');
    process.exit(1);
  }

  // T-04-01 — validate both paths resolve under REPO_ROOT
  const srcPath = validatePath(srcPathArg, 'srcPath');
  const destPath = validatePath(destPathArg, 'destPath');

  // DIAG-01 — input file must exist
  if (!fsSync.existsSync(srcPath)) {
    throw new Error(`input file not found: ${srcPath}`);
  }

  // D-02d — meta sidecar is required
  const metaPath = srcPath.replace(/\.excalidraw\.json$/, '.meta.json');
  if (!fsSync.existsSync(metaPath)) {
    throw new Error(
      `meta sidecar required: ${path.relative(REPO_ROOT, metaPath)} not found. ` +
        `Author a meta.json with { title, descEn, descRu? }.`
    );
  }

  const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
  if (!meta.title || !meta.descEn) {
    throw new Error(
      `meta missing required keys: ${path.relative(REPO_ROOT, metaPath)} must have title + descEn`
    );
  }

  // DIAG-01 — parse source JSON
  const diagram = JSON.parse(await fs.readFile(srcPath, 'utf8'));

  // T-04-03 — validate files blob
  validateFilesBlob(diagram);

  // Call wrapper (jsdom in worker thread, auto-embeds fonts)
  const svgEl = await excalidrawToSvg(diagram);
  let svgString = svgEl.outerHTML;

  // DIAG-03 + Pitfall 5 — inject <title> + <desc> PRE-SVGO
  // T-04-02 — escape meta strings before injection
  const titleXml = escapeXml(meta.title);
  const descXml = escapeXml(meta.descEn);
  svgString = svgString.replace(
    /<svg([^>]*)>/,
    `<svg$1><title>${titleXml}</title><desc>${descXml}</desc>`
  );

  // D-03d — parse viewBox → explicit numeric width/height (for stdout print)
  const viewBoxMatch = svgString.match(
    /viewBox="(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/
  );
  const intrinsicWidth = viewBoxMatch ? Math.round(parseFloat(viewBoxMatch[3])) : null;
  const intrinsicHeight = viewBoxMatch ? Math.round(parseFloat(viewBoxMatch[4])) : null;

  // DIAG-02 — optimize with SVGO preset-default + removeDesc: false
  const { data: optimized } = optimize(svgString, SVGO_CONFIG);

  // DIAG-02 hard gate — enforce 10 KB budget
  const bytes = Buffer.byteLength(optimized, 'utf8');
  if (bytes > SIZE_BUDGET) {
    console.error(
      `SVG is ${bytes} B (${(bytes / 1024).toFixed(1)} KB), exceeds 10 KB budget.`
    );
    console.error(`Simplify the diagram or zoom-to-fit in Excalidraw before re-exporting.`);
    process.exit(1);
  }

  // DIAG-03 — write to canonical destPath (under REPO_ROOT per T-04-01 guard above)
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, optimized, 'utf8');

  console.log(`✓ ${path.relative(REPO_ROOT, destPath)} (${bytes} B)`);
  if (intrinsicWidth && intrinsicHeight) {
    console.log(`  intrinsic: ${intrinsicWidth}x${intrinsicHeight}`);
  }
  console.log(`  title: ${meta.title}`);
  console.log(`  desc: ${meta.descEn}`);
}

main()
  .then(() => {
    // The wrapper instantiates a module-level JSDOM() at import-time and keeps
    // a worker_threads.Worker alive (with unref()) for subsequent calls. Under
    // `spawnSync` with piped stdio, the parent JSDOM's timers hold the event
    // loop open indefinitely. Explicit success exit keeps this a one-shot CLI.
    process.exit(0);
  })
  .catch((err) => {
    console.error('[excalidraw-to-svg] FAILED:', err.message);
    process.exit(1);
  });
