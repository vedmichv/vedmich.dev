---
phase: 04-excalidraw-pipeline
reviewed: 2026-05-04T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - scripts/excalidraw-to-svg.mjs
  - tests/unit/excalidraw-to-svg.test.ts
  - tests/fixtures/excalidraw/minimal.excalidraw.json
  - tests/fixtures/excalidraw/minimal.meta.json
  - tests/fixtures/excalidraw/oversize.excalidraw.json
  - diagrams-source/README.md
  - diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.excalidraw.json
  - diagrams-source/2026-03-02-mcp-servers-plainly-explained/client-server.meta.json
  - diagrams-source/2026-03-20-karpenter-right-sizing/split-ownership.excalidraw.json
  - diagrams-source/2026-03-20-karpenter-right-sizing/split-ownership.meta.json
  - public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg
  - public/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/split-ownership.svg
  - src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md
  - src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md
  - src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx
  - src/content/blog/ru/2026-03-20-karpenter-right-sizing.mdx
findings:
  blocker: 2
  warning: 7
  info: 5
  total: 14
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-04
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

The Phase 4 excalidraw pipeline lands a working build-time `.excalidraw.json → SVG` script with reasonable STRIDE coverage (path-traversal guard, XML escaping, files-blob cap) and 9 passing integration tests. The full suite (44 tests) is green.

**However, two BLOCKER-level issues undermine the declared threat model:**

1. `validatePath` uses `path.resolve` without following symlinks — a pre-existing symlink in the repo pointing outside the allowed parent defeats T-04-01 entirely. An author running `node scripts/excalidraw-to-svg.mjs ... public/blog-assets/evil -> /etc/passwd` would write through the symlink silently.
2. The `<title>`/`<desc>` injection regex `/<svg([^>]*)>/` is not XML-aware. If the wrapper ever emits an attribute containing `>` (e.g. `data-foo="a>b"`), the regex stops at the first literal `>` and the injected nodes splice into the middle of attribute values, producing invalid SVG. Current wrapper output happens to be safe, but the guarantee rests on undocumented upstream behavior, not on the script.

**Additional notable findings:**
- The usage example in `diagrams-source/README.md` and the script's own "Usage:" line advertise `node scripts/excalidraw-to-svg.mjs ...` runbook commands that are only reachable from repo-root paths. Authors on macOS who drop an output to `/tmp/foo.svg` get rejected because `os.tmpdir()` resolves to `/var/folders/...`, not `/tmp`. This is an undocumented platform gotcha.
- The Karpenter diagram ships without an embedded font (it uses `font-family="Helvetica, Segoe UI Emoji"`), contradicting the runbook's own guidance and producing OS-dependent rendering. The MCP diagram embeds Virgil correctly.
- The script's final stdout path display uses `path.relative(REPO_ROOT, destPath)` which produces `../../../../../../var/folders/...` when the dest is under `os.tmpdir()`. Ugly, not broken, but suggests the code path was never exercised during author testing.
- `TMP_ROOT` scope creep is a security weakening: allowing `os.tmpdir()` as a valid output parent for tests is a testing convenience that expands the trust boundary from REPO_ROOT to `REPO_ROOT ∪ TMP_ROOT` in production. Tests should write under `REPO_ROOT/.tmp-test/` or similar, keeping the script's write scope strictly `REPO_ROOT`.

The content (MDX/MD posts) is solid and bilingual parity holds. The `<img>` tags carry correct `width`/`height`/`alt`/`loading` attributes matching the runbook.

---

## Blocker Issues

### BL-01: validatePath does not follow symlinks — T-04-01 is defeated by a pre-existing symlink under the allowed parent

**File:** `scripts/excalidraw-to-svg.mjs:56-67`

**Issue:** `validatePath` calls `path.resolve(userPath)` which resolves `..` sequences but does NOT dereference symlinks. If an attacker (or a confused author running a malicious PR) plants a symlink inside the repo or inside `os.tmpdir()` that points outside the allowed parent, the guard accepts the resolved path (e.g. `REPO_ROOT/public/evil.svg`) and the subsequent `fs.writeFile` writes through the symlink to the symlink target (e.g. `/etc/passwd` or `~/.ssh/authorized_keys`).

Example attack chain:
1. PR adds `diagrams-source/attack.excalidraw.json` (innocent) and `diagrams-source/attack.meta.json`.
2. PR also adds `public/blog-assets/attack/diagrams/output.svg` as a symlink to `~/.ssh/authorized_keys`.
3. Author who reviews + runs `node scripts/excalidraw-to-svg.mjs diagrams-source/attack.excalidraw.json public/blog-assets/attack/diagrams/output.svg` overwrites their SSH authorized_keys with SVG content.

The `validatePath` check sees `public/blog-assets/attack/diagrams/output.svg` → resolves to a path under REPO_ROOT → accepted. Symlink traversal is not blocked.

This directly contradicts `04-RESEARCH.md` §Known Threat Patterns line 709: "Path traversal via CLI arg ... Resolve paths with path.resolve() + assert result startsWith(REPO_ROOT)." — the mitigation as-implemented is incomplete. The canonical fix uses `fs.realpathSync()` (which follows symlinks) before the prefix check.

**Fix:**
```javascript
import fsSync from 'node:fs';

function validatePath(userPath, label) {
  const resolved = path.resolve(userPath);
  // Dereference symlinks on any path component that already exists. For
  // paths that don't exist yet (new output files), walk up the parent chain
  // until we hit an existing dir, realpath THAT, then reattach the tail.
  const realParent = realpathOfExistingAncestor(resolved);
  const tail = path.relative(realParent.existing, resolved);
  const real = path.join(realParent.real, tail);
  const allowed =
    real === REPO_ROOT ||
    real.startsWith(REPO_ROOT + path.sep) ||
    real === TMP_ROOT ||
    real.startsWith(TMP_ROOT + path.sep);
  if (!allowed) {
    throw new Error(`path traversal refused — ${label} (${userPath}) resolves outside REPO_ROOT`);
  }
  return real;
}

function realpathOfExistingAncestor(p) {
  let existing = p;
  while (!fsSync.existsSync(existing) && path.dirname(existing) !== existing) {
    existing = path.dirname(existing);
  }
  return { existing, real: fsSync.realpathSync(existing) };
}
```

Also add a regression test that creates a symlink inside a tempdir pointing to `/etc/hosts` (read-only target), passes it as destPath, and asserts the script refuses to write. See `tests/unit/excalidraw-to-svg.test.ts` for the pattern.

---

### BL-02: `<title>`/`<desc>` injection regex is not XML-aware — splice point is undefined for any future wrapper output containing `>` in attribute values

**File:** `scripts/excalidraw-to-svg.mjs:129-132`

**Issue:** The injection uses `svgString.replace(/<svg([^>]*)>/, '<svg$1><title>...</title><desc>...</desc>')`. The character class `[^>]*` stops at the first literal `>` in the document, regardless of whether that `>` is inside an attribute value or terminates the `<svg>` tag.

Demonstrable bug — given synthetic input `<svg data-foo="a>b" xmlns="x">content</svg>`:
- Match capture: ` data-foo="a` (up to first `>`)
- Replacement output: `<svg data-foo="a><title>T</title><desc>D</desc>b" xmlns="x">content</svg>`
- Result: `<title>` and `<desc>` splice INTO an attribute value, producing broken XML.

Current wrapper (`@aldinokemal2104/excalidraw-to-svg@1.1.1`) happens to emit attributes that HTML-encode `>` as `&gt;` (verified empirically on shipped SVGs), so the bug is latent in v1.1.1 output. But the script's correctness depends on undocumented downstream behavior of a third-party library. Any future wrapper version that emits `>` literally in an attribute — or any author who hand-edits `diagrams-source/*.excalidraw.json` to inject a `>`-bearing value that round-trips into an attribute — silently produces broken SVGs. Broken SVGs may render or may not, depending on browser strictness.

A secondary concern: SVGO's subsequent `optimize()` pass may canonicalize attribute quoting in ways that expose or hide the splice depending on the input, making regressions hard to reproduce.

**Fix:** Parse the SVG as XML and inject `<title>`/`<desc>` as the first child of `<svg>`, then serialize. jsdom is already transitively available via the wrapper; the script can use the wrapper's returned `svgEl` directly:

```javascript
// Instead of outerHTML + regex, use DOM manipulation on svgEl
const titleEl = svgEl.ownerDocument.createElement('title');
titleEl.textContent = meta.title; // textContent handles XML escaping natively
const descEl = svgEl.ownerDocument.createElement('desc');
descEl.textContent = meta.descEn;
svgEl.insertBefore(descEl, svgEl.firstChild);
svgEl.insertBefore(titleEl, svgEl.firstChild);
let svgString = svgEl.outerHTML;
```

If DOM manipulation is not feasible (e.g. worker-thread wrapper returns a stringified element), use `xmlbuilder2` or `@xmldom/xmldom` (MIT, ~50 KB) for a proper parse. Do NOT rely on regex for XML mutation.

**Alternative safer regex** (if DOM is truly unreachable): anchor the match to the document start and require a closing `>` that is NOT inside a quoted attribute:

```javascript
// Match '<svg' followed by any run of attr="quoted">OR>attr='quoted'<OR non-quote-non-> chars, ending at >
const svgOpenRe = /^(\s*<\?xml[^?]*\?>\s*)?<svg(?:\s+(?:[^\s=>]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?\s*)*)\s*>/;
svgString = svgString.replace(svgOpenRe, (m) => `${m}<title>${titleXml}</title><desc>${descXml}</desc>`);
```

Even the "safer regex" is fragile; the DOM path is strongly preferred.

---

## Warnings

### WR-01: `TMP_ROOT` scope creep — test convenience weakens production write scope from REPO_ROOT to `REPO_ROOT ∪ os.tmpdir()`

**File:** `scripts/excalidraw-to-svg.mjs:18-22, 56-67`

**Issue:** The comment on lines 18-21 acknowledges that allowing `os.tmpdir()` exists for Wave-0 contract reasons. But adding `TMP_ROOT` to the guard at lines 60-62 expands the script's trust boundary in production too — any author can now write arbitrary SVGs anywhere under `os.tmpdir()`, including files with existing content that a daemon or another user expects. On multi-user Linux boxes, `/tmp/well-known-pid-file` writes are a privilege-unaware footgun.

The cleanest fix keeps the script strict (REPO_ROOT only) and routes the test into a dedicated subdirectory of REPO_ROOT that's git-ignored:

```javascript
// scripts/excalidraw-to-svg.mjs — drop TMP_ROOT entirely
function validatePath(userPath, label) {
  const resolved = path.resolve(userPath);
  const allowed = resolved === REPO_ROOT || resolved.startsWith(REPO_ROOT + path.sep);
  if (!allowed) {
    throw new Error(`path traversal refused — ${label} (${userPath}) resolves outside REPO_ROOT`);
  }
  return resolved;
}
```

```javascript
// tests/unit/excalidraw-to-svg.test.ts — use repo-local tmp
function tmpDest(label: string): string {
  const dir = path.join(REPO_ROOT, '.tmp-test');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `excal-test-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.svg`);
}
```

And add `.tmp-test/` to `.gitignore`. This keeps production behavior tight, test behavior explicit, and removes the macOS `/tmp` confusion (see WR-02).

---

### WR-02: macOS `/tmp` symlink produces a usability trap — authors cannot write to `/tmp` even though it appears in the runbook

**File:** `diagrams-source/README.md:45-49` (runbook), `scripts/excalidraw-to-svg.mjs:22` (TMP_ROOT derivation)

**Issue:** On macOS, `os.tmpdir()` returns `/var/folders/jr/xxx/T` while `/tmp` is a symlink to `/private/tmp`. `path.resolve('/tmp/foo.svg')` yields `/tmp/foo.svg` (no symlink resolution). Because `TMP_ROOT = path.resolve(os.tmpdir()) = /var/folders/.../T`, the check `'/tmp/foo.svg'.startsWith('/var/folders/.../T/')` returns false. Running the script empirically:

```
$ node scripts/excalidraw-to-svg.mjs tests/fixtures/excalidraw/minimal.excalidraw.json /tmp/x.svg
[excalidraw-to-svg] FAILED: path traversal refused — destPath (/tmp/x.svg) resolves outside REPO_ROOT
```

The runbook (`diagrams-source/README.md`) doesn't instruct authors to write to `/tmp`, but the error message is confusing (it says "outside REPO_ROOT" even though TMP_ROOT is also allowed). Authors hitting this trap on macOS will waste time debugging.

**Fix:** Either (a) preferred — drop `TMP_ROOT` as WR-01 recommends and tighten the guard to REPO_ROOT only (the script becomes unambiguous), or (b) if TMP_ROOT stays, dereference symlinks in `validatePath` (which would also fix BL-01), so `/tmp/foo.svg` resolves to `/private/tmp/foo.svg` and matches on real-path.

If keeping TMP_ROOT, also improve the error message:
```javascript
throw new Error(
  `path traversal refused — ${label} (${userPath}) → ${resolved} resolves outside REPO_ROOT (${REPO_ROOT}) and TMP_ROOT (${TMP_ROOT})`
);
```

---

### WR-03: stdout path display shows `../../../../../../var/folders/...` for tmp outputs — code path was not exercised during author testing

**File:** `scripts/excalidraw-to-svg.mjs:158`

**Issue:** The success line `console.log(`✓ ${path.relative(REPO_ROOT, destPath)} (${bytes} B)`)` assumes `destPath` lives under `REPO_ROOT`. When `destPath` is under `TMP_ROOT`, `path.relative` emits an ugly prefix like `../../../../../../var/folders/jr/vbvkvd6j65l5xw2k8qnnrm5r0000gn/T/test.svg`. Observed empirically:

```
✓ ../../../../../../var/folders/jr/vbvkvd6j65l5xw2k8qnnrm5r0000gn/T/test-minimal.svg (5087 B)
```

Not broken, but the fact this was not caught indicates the TMP_ROOT code path was added without running the script against a real tmp path. It's a cheap tell that the test-only TMP_ROOT branch wasn't validated end-to-end outside `spawnSync` in the unit test.

**Fix:** Show an absolute path for out-of-repo outputs:
```javascript
const displayPath = destPath.startsWith(REPO_ROOT + path.sep) || destPath === REPO_ROOT
  ? path.relative(REPO_ROOT, destPath)
  : destPath;
console.log(`✓ ${displayPath} (${bytes} B)`);
```

This coupled with WR-01's fix (drop TMP_ROOT entirely) eliminates the issue.

---

### WR-04: Shipped Karpenter diagram uses `Helvetica` instead of Virgil — contradicts runbook, produces OS-dependent rendering

**File:** `public/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/split-ownership.svg:22,32,42,52,62,72` (all `text` elements); source fixture `diagrams-source/2026-03-20-karpenter-right-sizing/split-ownership.excalidraw.json` uses `"fontFamily": 2` (Helvetica)

**Issue:** `diagrams-source/README.md` line 12 advises: "Prefer **Virgil font** (Excalidraw default)". The MCP diagram follows this (all text at `fontFamily: 1` = Virgil, and the resulting SVG embeds a Virgil `@font-face` base64 payload). The Karpenter diagram uses `fontFamily: 2` (Helvetica) across all 6 text elements. The resulting SVG has zero `@font-face` declarations — it relies entirely on the user's OS to resolve `font-family="Helvetica, Segoe UI Emoji"`.

Consequences:
1. On macOS/iOS: Helvetica renders.
2. On Windows: Helvetica is not installed → browser falls back to Arial (metrics differ, text may overflow element bounds).
3. On Linux without Helvetica: falls back to generic sans-serif (DejaVu Sans, etc.) — visual inconsistency.

This is not a bug in the pipeline — the pipeline honored what the author drew — but it undermines the purpose of font embedding for consistent diagram rendering across devices. Also: the diagram's value comes from hand-sketched aesthetic; Helvetica makes it look like a generic corporate block diagram.

The runbook warns about this at line 98 ("Virgil-only text keeps the budget") but frames it as a budget concern. The rendering-consistency dimension is missing from the runbook.

**Fix (content):** Re-export the Karpenter diagram in Excalidraw with all text converted to Virgil (default), and re-run the pipeline. Expected byte count: the embedded font is ~5-6 KB; the Karpenter SVG is currently 7,338 B so there's enough headroom under the 10 KB budget for most subsets, but verify empirically.

**Fix (runbook):** Add to `diagrams-source/README.md` Gotchas:
> **System fonts are not embedded.** The wrapper only embeds Excalidraw-native fonts (Virgil, Cascadia, etc.). If you pick `Helvetica` or another system font in the Excalidraw font dropdown, the exported SVG references the font by name only — rendering then depends on the viewer's OS. For visual consistency, stick to Excalidraw-native fonts.

---

### WR-05: Script loads entire source file into memory before any size sanity check — large-file authoring mistakes produce cryptic OOM instead of clean errors

**File:** `scripts/excalidraw-to-svg.mjs:116, 108`

**Issue:** `fs.readFile(srcPath, 'utf8')` on line 116 and line 108 (for meta) loads the full file into memory. `validateFilesBlob` checks embedded raster blob size AFTER the JSON is parsed (line 119) — by which point both files are already buffered. If an author accidentally passes a multi-GB file (e.g. a wrong path pointing at a video or a `.excalidraw.json` that someone pasted 500,000 shapes into), Node buffers the whole thing and then JSON.parse double-buffers it into an object graph.

The files-blob cap is 100 KB, but the overall `.excalidraw.json` has no cap. A 10 MB all-text Excalidraw file (tens of thousands of text elements with long strings) sails through the files-blob check because `diagram.files` is empty, but then the wrapper call at line 122 fights through 10 MB of elements.

**Fix:** Check `fs.stat(srcPath).size` before reading, refuse > e.g. 1 MB:

```javascript
const MAX_SOURCE_BYTES = 1 * 1024 * 1024; // 1 MB cap on .excalidraw.json
const srcStat = await fs.stat(srcPath);
if (srcStat.size > MAX_SOURCE_BYTES) {
  throw new Error(
    `source file is ${srcStat.size} B, exceeds ${MAX_SOURCE_BYTES} B cap — split into multiple diagrams or remove unused elements`
  );
}
```

Priority is low (authors have write access to the repo, this is DoS protection against author mistakes rather than attackers), but the guard is ~3 lines and closes a class of confusing-to-debug failures.

---

### WR-06: No extension check on `srcPath` — passing a non-`.excalidraw.json` file produces cryptic JSON.parse error instead of clear diagnostic

**File:** `scripts/excalidraw-to-svg.mjs:95-101`

**Issue:** `metaPath` is derived via `srcPath.replace(/\.excalidraw\.json$/, '.meta.json')`. If `srcPath` does NOT end with `.excalidraw.json` (e.g. author passes `foo.svg` or `diagram.json`), the replace yields the unchanged `srcPath`. Both `existsSync(srcPath)` and `existsSync(metaPath)` then check the same file. If that file exists but isn't JSON (e.g. an accidental `.svg`), `JSON.parse` at line 108 throws SyntaxError with no indication that the author passed the wrong file type.

Observed behavior for `srcPath = /repo/foo.svg`:
1. `validatePath` — passes (if foo.svg is under REPO_ROOT)
2. `existsSync(srcPath)` — passes
3. `metaPath = srcPath.replace(...) = /repo/foo.svg` (no match)
4. `existsSync(metaPath)` — passes (same file)
5. `JSON.parse(readFile(metaPath, 'utf8'))` — throws `SyntaxError: Unexpected token '<'` (from SVG content)

The error message doesn't tell the author they passed `.svg` as `srcPath`. Diagnosis requires reading the script.

**Fix:** Assert the extension up front:
```javascript
if (!srcPathArg.endsWith('.excalidraw.json')) {
  throw new Error(
    `srcPath must end with .excalidraw.json — got ${srcPathArg}`
  );
}
```

And tighten destPath too (should end with `.svg`):
```javascript
if (!destPathArg.endsWith('.svg')) {
  throw new Error(
    `destPath must end with .svg — got ${destPathArg}`
  );
}
```

---

### WR-07: Test leaves `oversize.meta.json` orphan in `tests/fixtures/excalidraw/` if test process is killed between `copyFileSync` and `finally`

**File:** `tests/unit/excalidraw-to-svg.test.ts:76-89`

**Issue:** The `DIAG-02 :: exits-on-oversize` test copies `minimal.meta.json` to `oversize.meta.json` at line 80, then runs the script, and cleans up in `finally` at lines 86-88. If the test process is interrupted (Ctrl+C, OOM, parent spawnSync timeout), the `finally` clause may not run, leaving `oversize.meta.json` on disk. Subsequent commits can unintentionally include it (it's not in .gitignore), and future runs of the oversize test hit a pre-existing meta file rather than creating one cleanly.

Observed in isolation: after `npm run test:unit` completed cleanly, no orphan was left, but there is no guard against interrupted runs.

**Fix:** Either:
1. Add `oversize.meta.json` to the fixtures directory permanently (it's tiny) and remove the copy/finally dance. This also removes a test-side race.
2. OR use `node:test`'s `t.after()` hook for more reliable cleanup semantics than `try/finally`.
3. OR write the meta file to a tmp location and point the script's metaPath there — but the script's `metaPath` derivation is fixed to `${srcPath}.meta.json`, so this would require a script change.

Option (1) is cleanest:
```javascript
// tests/fixtures/excalidraw/oversize.meta.json — commit this file permanently
{"title":"Oversize test","descEn":"Deliberately chunky fixture to trip the 10 KB budget check"}
```

Then remove lines 79-82 and the `finally` cleanup. Test becomes:
```javascript
test('DIAG-02 :: exits-on-oversize — script rejects SVG > 10 KB with non-zero exit', () => {
  const dest = tmpDest('oversize');
  const result = run([OVERSIZE_SRC, dest]);
  assert.notEqual(result.status, 0, 'script must exit non-zero when SVG exceeds 10 KB');
  assert.match(result.stderr || '', /10\s*KB|budget|exceeds/i);
});
```

---

## Info

### IN-01: `console.log`/`console.error` are the entire observability surface — no quiet flag for CI integration

**File:** `scripts/excalidraw-to-svg.mjs:86, 148-150, 158-163, 175`

**Issue:** The script prints to stdout on success (4 lines) and stderr on failure. There's no `--quiet` flag, no machine-readable output option, no `--json` result. The runbook frames this as a CLI tool but the logging isn't customizable. If a future CI step wants to batch-rebuild diagrams, the log noise is 4 lines per diagram × N diagrams.

This matches the existing `scripts/generate-icons.mjs` pattern per D-02c, so it's consistent. Mentioned only for future reference.

**Fix:** Not needed for v1. If/when CI integration lands, accept `--quiet` or `--json` flags.

---

### IN-02: Usage line printed to stderr but exits with code 1 — conventional usage docs go to stdout and exit 0

**File:** `scripts/excalidraw-to-svg.mjs:86-88`

**Issue:** `console.error('Usage: ...'); process.exit(1)` when args are missing. Conventionally, running `script --help` or `script` with missing required args prints usage to stdout (or via a pager) and exits 0 for help, exits 2 for missing-args (BSD convention). The current behavior is a minor CLI-convention violation.

**Fix:**
```javascript
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node scripts/excalidraw-to-svg.mjs <source.excalidraw.json> <dest.svg>');
  process.exit(0);
}
if (!srcPathArg || !destPathArg) {
  console.error('Usage: node scripts/excalidraw-to-svg.mjs <source.excalidraw.json> <dest.svg>');
  process.exit(2);  // BSD: 2 for missing args
}
```

Low priority.

---

### IN-03: Uses `fsSync.existsSync` in an async function — TOCTOU is not exploitable here but style is inconsistent

**File:** `scripts/excalidraw-to-svg.mjs:95, 101`

**Issue:** The script is `async`, uses `fs.readFile` etc. from `node:fs/promises`, but reaches into `node:fs` sync for `existsSync`. Style-wise, prefer `fs.stat` in try/catch for async flow consistency. The TOCTOU (time-of-check-to-time-of-use) is not exploitable because this is a single-author CLI, but the style mix makes reading harder.

**Fix:** (style-only, low priority)
```javascript
async function exists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}
// ...
if (!(await exists(srcPath))) { throw new Error(`input file not found: ${srcPath}`); }
```

---

### IN-04: `descRu` is captured in meta.json files but unused by the script — silent data drop

**File:** `scripts/excalidraw-to-svg.mjs:128` (only reads `descEn`), `diagrams-source/*/meta.json` (all three author `descRu`), `diagrams-source/README.md:35-36` (acknowledges the gap)

**Issue:** All three authored `meta.json` files provide `descRu` for Russian screen-reader coverage. The script only uses `descEn` (line 128). The runbook explicitly calls this out at line 36: "The script currently injects only descEn into the SVG `<desc>`; descRu is reserved for a future enhancement." — so this is a known gap, not a bug.

But: the RU blog post has an RU `alt=""` attribute on the `<img>` (line 22 of both mcp posts and line 57 of karpenter RU), which does carry the Russian description. So a11y for the RU locale is covered via `alt`, not `<desc>`. The `<desc>` shows English to RU readers if their screen reader falls through to the SVG's own `<desc>` (rare but possible on some setups).

Low priority — functional parity via `alt` is sufficient. The `<desc xml:lang="en">` + `<desc xml:lang="ru">` bilingual pair would be the proper fix but it's minor.

**Fix (when convenient):**
```javascript
const descEnXml = escapeXml(meta.descEn);
const descRuXml = meta.descRu ? `<desc xml:lang="ru">${escapeXml(meta.descRu)}</desc>` : '';
svgString = svgString.replace(
  /<svg([^>]*)>/,
  `<svg$1><title>${titleXml}</title><desc xml:lang="en">${descEnXml}</desc>${descRuXml}`
);
```

(But also depends on BL-02 fix — use DOM, not regex.)

---

### IN-05: Factual claim about MCP in blog post — "Anthropic donated it to the Linux Foundation in December 2025"

**File:** `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md:71`, `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md:71`

**Issue:** The EN and RU posts state: "Anthropic donated it to the Linux Foundation in December 2025. AWS, OpenAI, and Anthropic are co-founders of the governing body." This is a specific, time-bound factual claim. If it's accurate, fine. If not, it's an embarrassing error on a post that will persist at a canonical URL.

This is out of scope for code review (I have no way to verify the claim) but flagging for the author to double-check against public sources (Linux Foundation press releases, Anthropic's blog) before shipping. Getting this wrong is the kind of durable authority-loss that a single Google hit can inflict.

**Fix:** Verify the claim or soften to "Anthropic open-sourced the MCP spec in late 2024, and stewardship has since broadened with AWS and OpenAI participating." if exact attribution cannot be confirmed.

---

_Reviewed: 2026-05-04_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
