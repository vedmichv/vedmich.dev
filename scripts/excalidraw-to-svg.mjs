// @ts-check
// Source: Phase 4 (Excalidraw Pipeline) — CONTEXT.md D-02c script contract + D-01e library
//         Phase 04.1 (Hardening) — CONTEXT.md D-02..D-06 (security) + D-07..D-08 (UX) + D-11..D-17 (quality)
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
// D-02 + D-06 (Phase 04.1 SEC-C01 + Q-05 refactor):
// os.tmpdir() dropped from the allowlist — tests now write to repo-local tests/tmp/
// (gitignored). The old $TMPDIR path allowed symlink-pivot attacks per
// reviews/SECURITY-REVIEW.md SEC-C01. ALLOWED_WRITE_ROOTS is a single-source
// allowlist so future additions are a one-line change.
const ALLOWED_WRITE_ROOTS = [REPO_ROOT];

// DIAG-02 hard gate per CONTEXT D-05
const SIZE_BUDGET = 10 * 1024;

// T-04-03 mitigation — reject oversized embedded raster payloads
const FILES_BLOB_BUDGET = 100 * 1024;

// D-04 (Phase 04.1 SEC-H03) — reject files[*].dataURL that is not a raster base64 data URI.
// file://, http(s)://, data:image/svg+xml, data:text/html all bypass the scheme check.
const ALLOWED_DATAURL_PREFIX = /^data:image\/(png|jpeg|gif);base64,/;

// DIAG-02 + Pitfall 1 — preserve injected <desc>, v4 preset-default already keeps <title> + viewBox.
// D-03 (Phase 04.1 SEC-C02) — explicit script + event-handler removal. SVGO v4 preset-default
// does NOT include removeScripts (verified against node_modules/svgo/plugins/). The event-handler
// removal uses removeAttributesBySelector because SVGO v4 has no removeOnEvents plugin.
// Order matters: removeScripts first (deletes whole <script> elements) → then attribute strip
// (ensures a <script onload="…"> is gone before its onload has a chance to be "un-orphaned").
// D-07 (Phase 04.1 UX-01) — strip the leading Excalidraw viewBackgroundColor white rect.
// Narrow selector path[fill="#fff"][d^="M0 0h"] matches only the full-canvas
// `M0 0h<W>v<H>H0z` path Excalidraw emits for viewBackgroundColor:"#ffffff".
// Interior white shapes (label backgrounds, callouts) have `d` starting with
// coordinates like "M100 50..." and survive the selector. The stripped-fill path
// becomes a candidate for preset-default's useless-defs pruning on the multipass
// sweep. Even if it survives without a fill, a fill-less path is invisible on the
// Deep Signal dark prose surface — same visual result as removal.
const SVGO_CONFIG = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: { overrides: { removeDesc: false } },
    },
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
    {
      name: 'removeAttributesBySelector',
      params: {
        selectors: [
          { selector: 'path[fill="#fff"][d^="M0 0h"]', attributes: 'fill' },
        ],
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

// T-04-01 + T-04.1-01 (SEC-C01) — reject paths that escape ALLOWED_WRITE_ROOTS.
// Defense against symlink-bypass: we walk up to the first existing ancestor,
// fs.realpathSync() it (which dereferences any symlinks in the existing portion),
// then reattach the not-yet-created tail. If an attacker plants a symlink that
// points outside REPO_ROOT, realpath resolves it and the allowlist check rejects.
function validatePath(userPath, label) {
  const resolved = path.resolve(userPath);

  let existing = resolved;
  while (!fsSync.existsSync(existing) && path.dirname(existing) !== existing) {
    existing = path.dirname(existing);
  }
  const realExisting = fsSync.realpathSync(existing);
  const tail = path.relative(existing, resolved);
  const real = tail ? path.join(realExisting, tail) : realExisting;

  const allowed = ALLOWED_WRITE_ROOTS.some(
    (root) => real === root || real.startsWith(root + path.sep)
  );
  if (!allowed) {
    throw new Error(
      `path traversal refused — ${label} (${userPath}) → ${real} ` +
        `resolves outside allowed roots: [${ALLOWED_WRITE_ROOTS.join(', ')}]`
    );
  }
  return real;
}

// T-04-03 + T-04.1-03 (SEC-H03) — reject oversized OR wrong-scheme files blobs.
function validateFilesBlob(diagram) {
  const files = diagram.files || {};
  let total = 0;
  for (const [id, f] of Object.entries(files)) {
    if (f && typeof f.dataURL === 'string') {
      if (!ALLOWED_DATAURL_PREFIX.test(f.dataURL)) {
        throw new Error(
          `files[${id}].dataURL must match data:image/(png|jpeg|gif);base64, ` +
            `(got "${f.dataURL.slice(0, 40)}..."). External URLs are refused.`
        );
      }
      total += f.dataURL.length;
    }
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

  // D-05 (Phase 04.1 SEC-H04) — wrapper returned a <parsererror> document (crafted input
  // tripped the internal JSDOM DOMParser). Without this check the pipeline silently writes
  // a 116 B parsererror blob as a .svg and prints "✓" (SUCCESS). Refuse with diagnostic.
  if (
    /^<parsererror[\s>]/.test(svgString) ||
    /<parsererror\s/.test(svgString.slice(0, 200))
  ) {
    throw new Error(
      `wrapper returned a parsererror document — refusing to ship as SVG. ` +
        `Source: ${path.relative(REPO_ROOT, srcPath)}. ` +
        `First 200 chars: ${svgString.slice(0, 200)}`
    );
  }

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

  // DIAG-02 — optimize with SVGO preset-default + removeDesc: false + script/event/white-rect strips
  const { data: optimized } = optimize(svgString, SVGO_CONFIG);

  // D-08 (Phase 04.1 UX-04) — Helvetica fallback chain. System-font Helvetica is
  // not installed on Windows; without an explicit fallback the browser picks a
  // platform default with different metrics that overflow Excalidraw's
  // pre-computed label boxes. The replace handles both the standalone `Helvetica`
  // variant AND the Excalidraw-default `Helvetica, Segoe UI Emoji` variant.
  // Virgil-embedded SVGs (fontFamily=1 in Excalidraw) are unaffected.
  const withFallback = optimized.replace(
    /font-family="Helvetica(, Segoe UI Emoji)?"/g,
    'font-family="Helvetica, Arial, sans-serif"'
  );

  // DIAG-02 hard gate — enforce 10 KB budget
  const bytes = Buffer.byteLength(withFallback, 'utf8');
  if (bytes > SIZE_BUDGET) {
    console.error(
      `SVG is ${bytes} B (${(bytes / 1024).toFixed(1)} KB), exceeds 10 KB budget.`
    );
    console.error(`Simplify the diagram or zoom-to-fit in Excalidraw before re-exporting.`);
    process.exit(1);
  }

  // DIAG-03 — write to canonical destPath (under REPO_ROOT per T-04-01 guard above)
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, withFallback, 'utf8');

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
