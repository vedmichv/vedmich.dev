import sharp from 'sharp';

// Keep the editable source and raster social card together. Crawlers reliably
// support PNG; SVG is the authoring source, not the og:image URL.
await sharp(new URL('../public/og-default.svg', import.meta.url).pathname)
  .png()
  .toFile(new URL('../public/og-default.png', import.meta.url).pathname);
