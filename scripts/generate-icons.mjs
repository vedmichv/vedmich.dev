// @ts-check
// Source: Phase 11 (Logo + favicon refresh) — CONTEXT.md D-09 & D-10
// One-shot asset pipeline. Re-runnable via `node scripts/generate-icons.mjs`.
// Output is committed to public/ + .design-handoff/; NOT run on every build.

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const HANDOFF_DIR = path.join(
  REPO_ROOT,
  '.design-handoff',
  'deep-signal-design-system',
  'project',
  'assets'
);
const SKILL_ASSETS = path.join(
  os.homedir(),
  '.claude',
  'skills',
  'viktor-vedmich-design',
  'assets'
);

// Canonical upstream source files (md5-authoritative per 11-PATTERNS.md)
const SRC_FAVICON_SVG = path.join(SKILL_ASSETS, 'vv-favicon.svg');
const SRC_LOGO_PRIMARY = path.join(SKILL_ASSETS, 'vv-logo-primary.svg');
const SRC_LOGO_INVERSE = path.join(SKILL_ASSETS, 'vv-logo-inverse.svg');
const SRC_LOGO_HERO = path.join(SKILL_ASSETS, 'vv-logo-hero.png');

// D-05 webmanifest content (verbatim)
const WEBMANIFEST = {
  name: 'Viktor Vedmich',
  short_name: 'vedmich.dev',
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: '#14B8A6',
  background_color: '#0F172A',
  display: 'browser',
  start_url: '/',
};

async function copyFile(src, dest) {
  await fs.copyFile(src, dest);
  console.log(`  copy  ${path.relative(REPO_ROOT, dest)}`);
}

async function writeBuffer(buf, dest) {
  await fs.writeFile(dest, buf);
  console.log(`  write ${path.relative(REPO_ROOT, dest)}  (${buf.length} B)`);
}

async function renderPng(srcPath, size) {
  return sharp(srcPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  console.log('[generate-icons] Phase 11 asset pipeline\n');

  // D-13 — Copy 3 canonical SVGs to public/ (REQ-007 acceptance)
  console.log('D-13: canonical SVGs -> public/');
  await copyFile(SRC_FAVICON_SVG, path.join(PUBLIC_DIR, 'vv-favicon.svg'));
  await copyFile(SRC_LOGO_PRIMARY, path.join(PUBLIC_DIR, 'vv-logo-primary.svg'));
  await copyFile(SRC_LOGO_INVERSE, path.join(PUBLIC_DIR, 'vv-logo-inverse.svg'));

  // D-01 — Optimised hero 64x64, <=10 KB
  console.log('\nD-01: hero PNG 64x64 (optimised) -> public/');
  const heroBuf = await renderPng(SRC_LOGO_HERO, 64);
  if (heroBuf.length > 10 * 1024) {
    throw new Error(
      `vv-logo-hero.png is ${heroBuf.length} B, exceeds 10 KB budget`
    );
  }
  await writeBuffer(heroBuf, path.join(PUBLIC_DIR, 'vv-logo-hero.png'));

  // D-04 — Apple / Android raster icons from favicon SVG
  console.log('\nD-04: platform rasters -> public/');
  const apple180 = await renderPng(SRC_FAVICON_SVG, 180);
  await writeBuffer(apple180, path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  const android192 = await renderPng(SRC_FAVICON_SVG, 192);
  await writeBuffer(
    android192,
    path.join(PUBLIC_DIR, 'android-chrome-192x192.png')
  );
  const android512 = await renderPng(SRC_FAVICON_SVG, 512);
  await writeBuffer(
    android512,
    path.join(PUBLIC_DIR, 'android-chrome-512x512.png')
  );

  // D-03 + D-10 — Regenerate favicon.ico multi-size (16/32/48)
  console.log('\nD-03 + D-10: favicon.ico (multi-size 16/32/48) -> public/');
  const ico16 = await renderPng(SRC_FAVICON_SVG, 16);
  const ico32 = await renderPng(SRC_FAVICON_SVG, 32);
  const ico48 = await renderPng(SRC_FAVICON_SVG, 48);
  const icoBuf = await pngToIco([ico16, ico32, ico48]);
  await writeBuffer(icoBuf, path.join(PUBLIC_DIR, 'favicon.ico'));

  // D-05 — site.webmanifest (pretty-printed JSON, trailing newline)
  console.log('\nD-05: site.webmanifest -> public/');
  const manifestJson = JSON.stringify(WEBMANIFEST, null, 2) + '\n';
  await fs.writeFile(
    path.join(PUBLIC_DIR, 'site.webmanifest'),
    manifestJson,
    'utf8'
  );
  console.log(`  write public/site.webmanifest  (${manifestJson.length} B)`);

  // D-07 — Mirror new derivatives to .design-handoff/ bundle
  // Hero is renamed vv-logo-hero-64.png to preserve 1.87 MB canonical beside it.
  console.log('\nD-07: mirror new derivatives -> .design-handoff/');
  await copyFile(
    path.join(PUBLIC_DIR, 'vv-logo-hero.png'),
    path.join(HANDOFF_DIR, 'vv-logo-hero-64.png')
  );
  await copyFile(
    path.join(PUBLIC_DIR, 'favicon.ico'),
    path.join(HANDOFF_DIR, 'favicon.ico')
  );
  await copyFile(
    path.join(PUBLIC_DIR, 'apple-touch-icon.png'),
    path.join(HANDOFF_DIR, 'apple-touch-icon.png')
  );
  await copyFile(
    path.join(PUBLIC_DIR, 'android-chrome-192x192.png'),
    path.join(HANDOFF_DIR, 'android-chrome-192x192.png')
  );
  await copyFile(
    path.join(PUBLIC_DIR, 'android-chrome-512x512.png'),
    path.join(HANDOFF_DIR, 'android-chrome-512x512.png')
  );
  await copyFile(
    path.join(PUBLIC_DIR, 'site.webmanifest'),
    path.join(HANDOFF_DIR, 'site.webmanifest')
  );

  console.log('\n[generate-icons] done.');
}

main().catch((err) => {
  console.error('[generate-icons] FAILED:', err);
  process.exit(1);
});
