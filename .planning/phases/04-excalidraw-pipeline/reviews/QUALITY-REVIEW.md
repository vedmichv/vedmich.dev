---
reviewer: code-quality (non-security) sweep
phase: 04-excalidraw-pipeline
scope: scripts/excalidraw-to-svg.mjs + tests/unit/excalidraw-to-svg.test.ts + fixtures
date: 2026-05-04
files_reviewed: 5
prior_findings_deduped_against: 04-REVIEW.md (BL-01/02, WR-01..07, IN-01..05)
---

# Phase 4: Code Quality Review (Non-Security)

Skips already-flagged items in `04-REVIEW.md` (BL-01 symlink realpath, BL-02 injection regex, WR-01 TMP_ROOT scope, WR-02 macOS /tmp, WR-03 path.relative ugliness, WR-04 Helvetica, WR-05 1MB source cap, WR-06 extension check, WR-07 oversize.meta orphan, IN-01..05). New angles on those topics are called out where relevant (e.g., Q-08 extends WR-07, Q-13 extends IN-02).

## HIGH

### Q-01 :: Non-deterministic output from Excalidraw `seed`/`versionNonce`/`updated` fields → idempotency is NOT guaranteed

**File:** `scripts/excalidraw-to-svg.mjs` (entire pipeline) + `tests/fixtures/excalidraw/minimal.excalidraw.json:11,12,13 etc.`

**Issue:** The script makes **no** idempotency claim in comments, but the committed outputs in `public/blog-assets/*/diagrams/*.svg` imply authors expect stable bytes across reruns. Excalidraw's rough.js-based renderer uses the element's `seed` field to drive a pseudo-random number generator for the "hand-drawn" jitter on stroke geometry — same seed, same jitter. `versionNonce` and `updated` fields also round-trip through the wrapper. The minimal fixture is deterministic (all seeds hardcoded 1-5) so PLAN-02's SVG (5087 B) is reproducible.

But: **anything an author exports fresh from Excalidraw regenerates `seed` randomly** (Excalidraw UI assigns new seeds on every edit session, not just element creation). Re-running `node scripts/excalidraw-to-svg.mjs split-ownership.excalidraw.json ...` after editing the diagram silently produces a different SVG byte-for-byte even if the visual is identical. This is noisy in `git diff` and defeats the "re-runnable" promise in the header comment on line 4.

No test asserts byte-stability on repeat invocation with the same input.

**Fix (test):**
```diff
+test('Idempotency :: byte-stable-on-rerun — two runs on same fixture produce identical SVG bytes', () => {
+  const destA = tmpDest('idem-a');
+  const destB = tmpDest('idem-b');
+  assert.equal(run([MINIMAL_SRC, destA]).status, 0);
+  assert.equal(run([MINIMAL_SRC, destB]).status, 0);
+  const a = fs.readFileSync(destA);
+  const b = fs.readFileSync(destB);
+  assert.ok(a.equals(b), 'two runs on the same input must produce byte-identical output');
+  fs.unlinkSync(destA);
+  fs.unlinkSync(destB);
+});
```

**Fix (runbook):** add to `diagrams-source/README.md`:
> **Determinism caveat.** The SVG's rough-edge jitter is driven by each element's `seed` field in the source JSON. Excalidraw assigns fresh seeds when you open an existing diagram and make edits. To keep `git diff` on SVG outputs minimal, either (a) commit the `.excalidraw.json` first, then run the pipeline, and never hand-touch seeds, or (b) if you re-export from Excalidraw, expect the SVG to change visually-equivalently but byte-differently.

**Severity rationale:** HIGH because the script's own header (line 4) claims "Re-runnable via `node scripts/excalidraw-to-svg.mjs <src> <dest>`" with the expectation that it's a deterministic pipeline. The failure mode is subtle git-diff noise across all future diagram edits, and nothing in the codebase surfaces it.

---

### Q-02 :: `JSON.parse` crashes with default SyntaxError for malformed input — no test, no actionable error

**File:** `scripts/excalidraw-to-svg.mjs:108, 116`

**Issue:** Both meta and source files are parsed with bare `JSON.parse`. If either file contains a trailing comma, a BOM, unquoted keys, or is truncated mid-write (author's editor crashed), the error surfaced to the user is node's default `SyntaxError: Unexpected token ... in JSON at position N`. The `[excalidraw-to-svg] FAILED:` prefix in the catch handler attaches at line 175, but the message doesn't say **which** file failed to parse.

The error becomes guesswork when both files exist:
```
[excalidraw-to-svg] FAILED: Unexpected token '}' in JSON at position 124
```
— is this the meta or the source? User has to open both and eyeball.

**Fix:**
```diff
-const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
+const meta = parseJsonOrThrow(await fs.readFile(metaPath, 'utf8'), metaPath);
...
-const diagram = JSON.parse(await fs.readFile(srcPath, 'utf8'));
+const diagram = parseJsonOrThrow(await fs.readFile(srcPath, 'utf8'), srcPath);

+function parseJsonOrThrow(text, pathForErr) {
+  try {
+    return JSON.parse(text);
+  } catch (err) {
+    throw new Error(
+      `failed to parse JSON in ${path.relative(REPO_ROOT, pathForErr)}: ${err.message}`
+    );
+  }
+}
```

**Missing test:**
```diff
+test('DIAG-01 :: errors-on-malformed-json — script exits with file-aware message on invalid JSON', () => {
+  const badSrc = path.join(os.tmpdir(), `bad-${Date.now()}.excalidraw.json`);
+  const badMeta = badSrc.replace(/\.excalidraw\.json$/, '.meta.json');
+  fs.writeFileSync(badSrc, '{"elements": [] // trailing comment breaks JSON');
+  fs.writeFileSync(badMeta, JSON.stringify({title:'T', descEn:'D'}));
+  const dest = tmpDest('malformed');
+  const result = run([badSrc, dest]);
+  assert.notEqual(result.status, 0);
+  assert.match(result.stderr, /bad-.*\.excalidraw\.json/, 'error must name the bad file');
+  fs.unlinkSync(badSrc);
+  fs.unlinkSync(badMeta);
+});
```

**Severity:** HIGH because this is the most common author error (fat-fingered JSON) and current UX is actively unhelpful.

---

## MEDIUM

### Q-03 :: Empty `elements: []` produces output with missing/zero viewBox — no test, silent failure shape

**File:** `scripts/excalidraw-to-svg.mjs:122, 135-139`

**Issue:** The wrapper, when given a diagram with `elements: []`, emits an SVG with `viewBox="0 0 0 0"` (or omits it entirely, depending on the upstream path). Line 135's regex `/viewBox="(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/` will:
- Match `"0 0 0 0"` successfully → `intrinsicWidth = 0`, `intrinsicHeight = 0`
- Then the `if (intrinsicWidth && intrinsicHeight)` guard at line 159 **short-circuits** (0 is falsy), so the stdout silently omits the intrinsic line.

The resulting SVG is valid-but-useless (zero-size). The author sees:
```
✓ public/blog-assets/foo/diagrams/empty.svg (520 B)
  title: Empty
  desc: Empty diagram
```
— no indication the diagram rendered nothing. Blog post `<img>` with `width=0 height=0` collapses to invisibility.

No test covers this path.

**Fix:**
```diff
 const { data: optimized } = optimize(svgString, SVGO_CONFIG);
+
+if (!diagram.elements || diagram.elements.length === 0) {
+  throw new Error(
+    `source has no elements — ${path.relative(REPO_ROOT, srcPath)} must contain at least one shape`
+  );
+}
```

Place this **after** `JSON.parse` (line 116) and **before** the wrapper call. Or, equivalently, treat a zero viewBox as a hard error:
```diff
+if (!viewBoxMatch || intrinsicWidth === 0 || intrinsicHeight === 0) {
+  throw new Error('wrapper produced zero-size output — diagram has no visible elements');
+}
```

**Missing test:**
```diff
+test('DIAG-01 :: errors-on-empty-elements — script rejects diagram with elements: []', () => {
+  const emptySrc = path.join(os.tmpdir(), `empty-${Date.now()}.excalidraw.json`);
+  const emptyMeta = emptySrc.replace(/\.excalidraw\.json$/, '.meta.json');
+  fs.writeFileSync(emptySrc, JSON.stringify({
+    type:'excalidraw', version:2, source:'https://excalidraw.com',
+    elements:[], appState:{}, files:{}
+  }));
+  fs.writeFileSync(emptyMeta, JSON.stringify({title:'T', descEn:'D'}));
+  const result = run([emptySrc, tmpDest('empty')]);
+  assert.notEqual(result.status, 0, 'empty diagram must be rejected');
+  fs.unlinkSync(emptySrc); fs.unlinkSync(emptyMeta);
+});
```

---

### Q-04 :: Meta validation is too loose — `null`, empty string, whitespace-only, wrong type all pass

**File:** `scripts/excalidraw-to-svg.mjs:109-113`

**Issue:** The check `if (!meta.title || !meta.descEn)` catches missing and empty-string, but:
- `{"title": "   ", "descEn": "   "}` passes (truthy non-empty strings of whitespace).
- `{"title": 123, "descEn": true}` passes (truthy non-string values) — then `escapeXml(123)` coerces to `"123"`, not obviously wrong but undocumented behavior.
- `{"title": null, "descEn": null}` — caught (null is falsy).
- `{"title": ["array"], "descEn": {"obj":true}}` passes — then `escapeXml(["array"])` coerces to `"array"` via `String()`, and `escapeXml({obj:true})` produces `"[object Object]"` (!).

The third bug — a meta that stringifies to `[object Object]` — is a silent accessibility regression that passes the test suite. Authors who misformat meta (e.g., nested `{"title": {"en": "..."}}`) produce SVGs with literal `<title>[object Object]</title>`.

No test covers this.

**Fix:**
```diff
-if (!meta.title || !meta.descEn) {
-  throw new Error(
-    `meta missing required keys: ${path.relative(REPO_ROOT, metaPath)} must have title + descEn`
-  );
-}
+for (const key of ['title', 'descEn']) {
+  const v = meta[key];
+  if (typeof v !== 'string' || v.trim().length === 0) {
+    throw new Error(
+      `meta.${key} in ${path.relative(REPO_ROOT, metaPath)} must be a non-empty string (got: ${JSON.stringify(v)})`
+    );
+  }
+}
+if (meta.descRu !== undefined && (typeof meta.descRu !== 'string' || meta.descRu.trim().length === 0)) {
+  throw new Error(`meta.descRu in ${path.relative(REPO_ROOT, metaPath)} must be a non-empty string if present`);
+}
```

**Missing tests:**
```diff
+test('DIAG-01 :: errors-on-whitespace-meta — script rejects title/desc that are whitespace-only', ...);
+test('DIAG-01 :: errors-on-non-string-meta — script rejects numeric/array/object title', ...);
```

---

### Q-05 :: `validatePath` hardcodes two roots — should accept a whitelist array

**File:** `scripts/excalidraw-to-svg.mjs:17-22, 56-67`

**Issue:** The script has two allowed-parent constants (`REPO_ROOT`, `TMP_ROOT`) and inlines a 4-condition OR in the guard. This scaled OK for 2 parents but:
1. Adding a third root (e.g., a future `DIAGRAMS_SOURCE_ROOT` for strict read-only ingestion, or an explicit CI scratch dir) requires surgery at three places: new constant, new `||` branch in `allowed`, updated error message.
2. The error message `resolves outside REPO_ROOT` is misleading once TMP_ROOT is allowed — this is already flagged in 04-REVIEW.md WR-02 but the root cause is the anti-pattern of hardcoded roots, not the message.
3. Tests have no way to override the allow-list for bespoke scenarios (e.g., testing write to a mounted volume) without editing the script.

**Fix (refactor for extensibility):**
```diff
-const REPO_ROOT = path.resolve(__dirname, '..');
-const TMP_ROOT = path.resolve(os.tmpdir());
+const ALLOWED_WRITE_ROOTS = [
+  path.resolve(__dirname, '..'),  // REPO_ROOT
+  path.resolve(os.tmpdir()),      // TMP_ROOT — test-only scratch
+];
+const REPO_ROOT = ALLOWED_WRITE_ROOTS[0]; // named ref for stdout path display

 function validatePath(userPath, label) {
   const resolved = path.resolve(userPath);
-  const allowed =
-    resolved === REPO_ROOT ||
-    resolved.startsWith(REPO_ROOT + path.sep) ||
-    resolved === TMP_ROOT ||
-    resolved.startsWith(TMP_ROOT + path.sep);
+  const allowed = ALLOWED_WRITE_ROOTS.some(
+    (root) => resolved === root || resolved.startsWith(root + path.sep)
+  );
   if (!allowed) {
     throw new Error(
-      `path traversal refused — ${label} (${userPath}) resolves outside REPO_ROOT`
+      `path traversal refused — ${label} (${userPath}) → ${resolved} is outside allowed roots: ${ALLOWED_WRITE_ROOTS.join(', ')}`
     );
   }
   return resolved;
 }
```

Also fixes the error-message issue from WR-02 as a side effect, by listing the actual roots.

---

### Q-06 :: `viewBox` regex rejects negative and decimal-only (no integer part) values — real-world Excalidraw diagrams sometimes emit these

**File:** `scripts/excalidraw-to-svg.mjs:135-137`

**Issue:** The regex `/(\d+(?:\.\d+)?)/` requires at least one digit BEFORE the optional decimal. It rejects:
- Negative values: `-50` (Excalidraw emits these when a diagram's topmost element has a negative y — user dragged an element above the canvas origin then saved)
- Leading-decimal values: `.5` (rare but SVG-spec-legal)
- Scientific notation: `5e1` (SVG-spec-legal)

For a diagram with `viewBox="-10 -10 500 260"`, the regex fails to match → `intrinsicWidth = null, intrinsicHeight = null` → stdout silently omits the intrinsic line AND the SVG still writes successfully. The blog post `<img>` author then has no way to know the natural dimensions and picks wrong `width`/`height`, causing layout shift.

SVG spec for viewBox: `min-x min-y width height`, all `<number>` (signed, decimal, exponent-allowed).

**Fix:**
```diff
 const viewBoxMatch = svgString.match(
-  /viewBox="(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/
+  /viewBox="(-?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+(-?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+(-?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+(-?\d*\.?\d+(?:[eE][-+]?\d+)?)"/
 );
-const intrinsicWidth = viewBoxMatch ? Math.round(parseFloat(viewBoxMatch[3])) : null;
-const intrinsicHeight = viewBoxMatch ? Math.round(parseFloat(viewBoxMatch[4])) : null;
+// viewBox[3] is width, [4] is height — both must be positive per SVG spec; warn on malformed
+const intrinsicWidth = viewBoxMatch ? Math.round(Math.abs(parseFloat(viewBoxMatch[3]))) : null;
+const intrinsicHeight = viewBoxMatch ? Math.round(Math.abs(parseFloat(viewBoxMatch[4]))) : null;
+if (!viewBoxMatch) {
+  console.error(`[excalidraw-to-svg] WARN: could not parse viewBox from output`);
+}
```

**Missing test:** fixture with `viewBox="-10 -10 500.5 260.3"` → assert stdout still prints `intrinsic: 500x260`.

---

### Q-07 :: No test for concurrent invocation — two parallel runs to the same destPath race

**File:** `scripts/excalidraw-to-svg.mjs:155-156`

**Issue:** `mkdir(destDir, recursive:true)` + `writeFile(destPath)`. If CI runs two parallel invocations targeting the same dest (unlikely but possible during large `for-loop` regenerations with `&`), the mkdir is idempotent but the writeFile races. Last writer wins; the author sees no error. Both exit 0.

Worse: the stdout from each process interleaves, so the author can't tell from logs what landed.

This is a rare scenario, flagged because it's one of the missing test categories the prompt asked about.

**Fix (defensive, optional):** Use `writeFile` with `{ flag: 'wx' }` to refuse-if-exists, then a `--force` flag for the common case:
```diff
-await fs.writeFile(destPath, optimized, 'utf8');
+const force = process.argv.includes('--force');
+try {
+  await fs.writeFile(destPath, optimized, 'utf8', { flag: force ? 'w' : 'wx' });
+} catch (err) {
+  if (err.code === 'EEXIST') {
+    throw new Error(`destination exists: ${path.relative(REPO_ROOT, destPath)} — pass --force to overwrite`);
+  }
+  throw err;
+}
```

This also accidentally catches the "oops I pointed at the wrong dest" class of errors. Test:
```diff
+test('DIAG-03 :: refuses-overwrite-without-force — second run to same dest fails without --force', ...);
+test('DIAG-03 :: force-overwrites — --force replaces existing dest', ...);
+test('DIAG-03 :: overwrites-when-rerun — default behavior still overwrites (or: add --force flag)', ...);
```

**Severity caveat:** arguable — current behavior (silent overwrite) matches `generate-icons.mjs` convention, so this is stylistic unless the team wants stronger guardrails.

---

### Q-08 :: `oversize.excalidraw.json` (162,682 bytes, 1 giant `freedraw` element) is a blunt instrument — no test for the 100 KB files-blob cap

**File:** `tests/fixtures/excalidraw/oversize.excalidraw.json`, `scripts/excalidraw-to-svg.mjs:69-81`

**Issue:** The oversize fixture is 162 KB of a single `freedraw` element with dense points. It exercises the DIAG-02 10 KB post-SVGO budget — good. But the script also implements `validateFilesBlob` (T-04-03, line 69-81) that caps embedded raster `dataURL`s at 100 KB. **No fixture tests this branch.** The 100 KB cap is untested:
- No fixture with `files: {}` containing a dataURL > 100 KB → no regression test if someone tweaks `FILES_BLOB_BUDGET`.
- No fixture with `files: {}` containing a dataURL just under 100 KB → no confirmation the boundary is inclusive vs. exclusive.
- No fixture with multiple small files summing to > 100 KB → no confirmation the "total" accumulator works (the `for...of Object.values(files)` loop).

This extends 04-REVIEW.md WR-07 (`oversize.meta.json` orphan) with a second angle: the oversize fixture doesn't actually test everything it was labeled for.

**Fix:** Add two fixtures + tests:

```json
// tests/fixtures/excalidraw/oversize-files-blob.excalidraw.json
{
  "type":"excalidraw","version":2,"source":"https://excalidraw.com",
  "elements":[ /* one rect so the diagram isn't empty */ ],
  "appState":{},
  "files":{"image-1":{"id":"image-1","dataURL":"data:image/png;base64,<~200 KB of base64>"}}
}
```
+
```diff
+test('T-04-03 :: rejects-oversized-files-blob — script exits when total dataURL exceeds 100 KB', () => {
+  const result = run([OVERSIZE_FILES_BLOB_SRC, tmpDest('filesblob')]);
+  assert.notEqual(result.status, 0);
+  assert.match(result.stderr, /files blob.*exceeds/i);
+});
```

And a companion test with files-blob at 99 KB asserting it still passes (boundary).

---

### Q-09 :: Test fixtures race on filename — if two tests with the same `label` happen to resolve within 1 ms, they collide

**File:** `tests/unit/excalidraw-to-svg.test.ts:27-29`

**Issue:**
```ts
function tmpDest(label: string): string {
  return path.join(os.tmpdir(), `excal-test-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.svg`);
}
```

`Date.now()` has millisecond resolution; `Math.random() * 1e6` has ~20-bit entropy. Birthday paradox for 1e6 slots: ~1180 draws before 50% collision chance. The test suite uses ~10 unique labels so collision is practically impossible today, but:
- If the suite grows to dozens of tests with the same label string (currently each uses a distinct label), collisions go from "never" to "once per ~1000 runs."
- On a slow CI runner where multiple tests run in parallel (Node 22 `--test-concurrency`), same-label tests could collide if they fire within the same millisecond.

Node 20+ ships `crypto.randomUUID()` which is free entropy. Simpler fix.

**Fix:**
```diff
+import { randomUUID } from 'node:crypto';
 function tmpDest(label: string): string {
-  return path.join(os.tmpdir(), `excal-test-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.svg`);
+  return path.join(os.tmpdir(), `excal-test-${label}-${randomUUID()}.svg`);
 }
```

---

### Q-10 :: Test file deletes dest on success but NOT on failure — leaves files behind when assertions fail

**File:** `tests/unit/excalidraw-to-svg.test.ts` (all 9 tests)

**Issue:** Pattern across all success-path tests:
```ts
assert.equal(result.status, 0);  // <-- if this throws, the fs.unlinkSync below never runs
...
fs.unlinkSync(dest);
```

On assertion failure, the dest file stays in `/var/folders/.../T/` forever (until OS cleanup). Cumulatively these orphan MBs of SVG and JSON across months of iteration. Also: on macOS the tmpdir has a 3-day auto-clean but on Linux CI runners with persistent caches this could fill disk.

**Fix (use `t.after` for reliable cleanup):**
```diff
-test('DIAG-01 :: exports-valid-svg — ...', () => {
+test('DIAG-01 :: exports-valid-svg — ...', (t) => {
   const dest = tmpDest('valid');
+  t.after(() => { if (fs.existsSync(dest)) fs.unlinkSync(dest); });
   const result = run([MINIMAL_SRC, dest]);
   assert.equal(result.status, 0);
   const svg = fs.readFileSync(dest, 'utf8');
   assert.match(svg, /^<svg[\s\S]*<\/svg>\s*$/);
-  fs.unlinkSync(dest);
 });
```

Apply to all 9 tests. Also closes the WR-07 variant for the oversize test.

---

## LOW

### Q-11 :: `@aldinokemal2104/excalidraw-to-svg@1.1.1` is the latest version AND has only one maintainer with no org backing — supply-chain risk to document

**File:** `package.json:24`

**Issue:** Checked npm registry — 1.1.1 (2026-04-08) is indeed the latest of 11 versions, and the only one shipped by author `aldinokemal2104` → `aldino@groupmap.com` (single-maintainer npm package). The pinning to `1.1.1` (exact, no `^`) is good hygiene. But:

1. **Bus factor 1.** The package is a one-person project, most recently released ~1 month ago. If the author abandons it, upstream Excalidraw schema bumps (v3 some day) won't be absorbed. The script imports the wrapper at runtime only — it doesn't inline the wrapper's logic. A fork + vendoring would be the contingency plan.
2. **Zero test-fixture for wrapper-upgrade path.** Nothing asserts the shape of the output the wrapper produces (e.g., attribute order, element nesting, whitespace). If `1.2.0` lands with a breaking output format (wrapper attribute renames, text-element wrapping changes, font-embedding reshuffles), the `<title>`/`<desc>` injection regex (already BL-02) and the viewBox regex (Q-06) both silently break — and the only signal would be DIAG-01 test output changing, which would surface as a Shiki-style palette drift.
3. **Transitive dependency weight.** Wrapper pulls in `jsdom@^24.0.0` (13 MB including dependencies), `subset-font` (ships freetype-wasm), `@excalidraw/utils@0.1.3-test32` — that version string `-test32` is notable; it's a pre-release/test tag and any stable Excalidraw release might break the wrapper.

No new finding relative to WR-01..07 on the security side (already covered). New angle: **dependency resilience planning**.

**Fix (doc):** Add a maintainer contingency note to `04-02-SUMMARY.md` or a new `04-DEPS-PINNING.md`:
> **Wrapper resilience.** `@aldinokemal2104/excalidraw-to-svg@1.1.1` is a single-maintainer npm package. If the upstream is abandoned:
> 1. Fork to `vedmichv/excalidraw-to-svg` and update `package.json` to the fork.
> 2. OR inline the ~200 LOC of wrapper logic directly into `scripts/excalidraw-to-svg.mjs` (accepts jsdom and svgo as direct deps).
> 3. Monitor <https://www.npmjs.com/package/@aldinokemal2104/excalidraw-to-svg> quarterly for staleness signals.

**Fix (test):** Add a snapshot-style assertion that catches wrapper output shape drift:
```diff
+test('Wrapper contract :: output-shape-stable — svg starts with <svg ... xmlns= and ends </svg>', () => {
+  // Pinning the OPENING tag shape: wrapper must emit single-root <svg ...xmlns="http://www.w3.org/2000/svg"...>
+  const dest = tmpDest('shape');
+  run([MINIMAL_SRC, dest]);
+  const svg = fs.readFileSync(dest, 'utf8');
+  assert.match(svg, /^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
+  assert.match(svg, /viewBox="/);
+  assert.match(svg, /<\/svg>\s*$/);
+  fs.unlinkSync(dest);
+});
```

---

### Q-12 :: Test file has no fixture for Unicode title/desc (emoji, RTL, zero-width chars) — `escapeXml` path is ASCII-only tested

**File:** `tests/fixtures/excalidraw/minimal.meta.json`, `tests/unit/excalidraw-to-svg.test.ts:93-99`

**Issue:** The minimal meta has ASCII `"Test diagram"` / `"Five-element minimal fixture..."`. `escapeXml` (line 46-50 of script) handles the 5 XML metacharacters but does nothing for:
- Emoji (4-byte UTF-8: a real blog title might be `"Kubernetes architecture 🚀"`)
- Right-to-left text (Arabic/Hebrew — not Viktor's use case but worth testing the happy path)
- Control characters (NULL 0x00, vertical tab 0x0B — invalid in XML 1.0, would poison the SVG if an author pastes an odd string)
- Combining characters (`"café"` as `"café"` vs. composed `"café"`) — round-trip should preserve bytes

The `escapeXml` implementation is correct for the 5 metacharacters; the gap is test coverage, not correctness for the Unicode-clean case. But **control characters would silently produce invalid XML** — XML 1.0 disallows most C0 control chars (0x01-0x08, 0x0B-0x0C, 0x0E-0x1F).

**Fix:**
```diff
 function escapeXml(str) {
+  const s = String(str);
+  // XML 1.0 forbids C0 control chars except \t, \n, \r — strip them to avoid producing invalid SVG
+  const clean = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
-  return String(str).replace(/[<>&"']/g, (c) => ({
+  return clean.replace(/[<>&"']/g, (c) => ({
     '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
   }[c]));
 }
```

**Missing tests:**
```diff
+test('DIAG-03 :: handles-emoji-in-title — emoji round-trips through escapeXml', ...);
+test('DIAG-03 :: strips-control-chars — NUL/VT in title are removed, not injected', ...);
```

---

### Q-13 :: Stdout format is fine for single-diagram invocation but hostile to batch workflows

**File:** `scripts/excalidraw-to-svg.mjs:158-163`

**Issue:** Current stdout:
```
✓ public/blog-assets/foo/diagrams/bar.svg (5087 B)
  intrinsic: 500x260
  title: Test diagram
  desc: Five-element minimal fixture for pipeline smoke test
```

Four lines per invocation. If a future `scripts/regenerate-all-diagrams.sh` loops over 20 diagrams, the author gets 80 lines of output — hard to spot failures, hard to diff across runs.

This extends 04-REVIEW.md IN-01 (which flagged the "no `--quiet`" issue) with a new angle: a more useful default is **one line per success** with the extra details behind a `--verbose` flag. Matches `curl`/`git` defaults.

**Fix:**
```diff
-console.log(`✓ ${path.relative(REPO_ROOT, destPath)} (${bytes} B)`);
-if (intrinsicWidth && intrinsicHeight) {
-  console.log(`  intrinsic: ${intrinsicWidth}x${intrinsicHeight}`);
-}
-console.log(`  title: ${meta.title}`);
-console.log(`  desc: ${meta.descEn}`);
+const dims = intrinsicWidth && intrinsicHeight ? ` [${intrinsicWidth}x${intrinsicHeight}]` : '';
+const short = `✓ ${path.relative(REPO_ROOT, destPath)} (${bytes} B${dims})`;
+if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
+  console.log(short);
+  console.log(`  title: ${meta.title}`);
+  console.log(`  desc:  ${meta.descEn}`);
+} else {
+  console.log(short);
+}
```

Single-line happy path:
```
✓ public/blog-assets/foo/diagrams/bar.svg (5087 B [500x260])
```

Verbose:
```
✓ public/blog-assets/foo/diagrams/bar.svg (5087 B [500x260])
  title: Test diagram
  desc:  Five-element minimal fixture for pipeline smoke test
```

The dim-info moves onto the ✓ line, title/desc become opt-in. Twenty-file batch produces 20 lines of signal, not 80.

---

### Q-14 :: Helpers live in a single file — zero reusability for a second script, zero unit-testability of internals

**File:** `scripts/excalidraw-to-svg.mjs:46-50, 56-67, 70-81`

**Issue:** `escapeXml`, `validatePath`, `validateFilesBlob` are all pure functions with clear contracts. They live as private consts inside the script, with no exports. Consequences:
- Cannot unit-test them directly — every test has to go through `spawnSync`, paying 600 ms per assertion for what could be a 1 ms in-process call.
- Cannot reuse from a future script (e.g., `scripts/excalidraw-batch.mjs` wanting the same path guard) without copy-paste.
- Cannot mock them to test error branches (e.g., what does `main()` do when `validateFilesBlob` throws with a specific message? Currently untestable without crafting a fixture.)

This is a "simplify / refactor" finding, not a bug. 177 LOC is small enough today, but the three pure helpers are the natural extraction targets.

**Fix (Phase 4 refactor or Phase 5+ follow-up):** Extract to `scripts/lib/excalidraw-helpers.mjs`:
```js
export function escapeXml(str) { ... }
export function validatePath(userPath, label, allowedRoots) { ... }
export function validateFilesBlob(diagram, budget) { ... }
```

Then `scripts/excalidraw-to-svg.mjs` imports them, and `tests/unit/excalidraw-helpers.test.ts` unit-tests them in-process:
```diff
+import { escapeXml, validatePath, validateFilesBlob } from '../../scripts/lib/excalidraw-helpers.mjs';
+test('escapeXml :: handles all 5 metacharacters', () => {
+  assert.equal(escapeXml(`<>&"'`), '&lt;&gt;&amp;&quot;&apos;');
+});
+test('escapeXml :: preserves plain ASCII', ...);
+test('escapeXml :: handles Unicode emoji', ...);
```

Drops per-test spawn overhead from 600 ms to < 1 ms for helper-only assertions, speeds full suite, and enables the Q-12 Unicode tests cheaply.

**Severity LOW because:** the current inlined structure is OK for 177 LOC. Extract becomes compelling at 300+ LOC or when the second script lands.

---

## NITPICK

### Q-15 :: `main()` is 82 LOC — past the "single screen" comprehension threshold, no sub-steps extracted

**File:** `scripts/excalidraw-to-svg.mjs:83-164`

**Issue:** `main()` linearly walks through: parse CLI args → validate paths → check src exists → check meta exists → parse meta → validate meta keys → parse source → validate files blob → wrapper → inject a11y → parse viewBox → run SVGO → check size → write → print. 14 distinct responsibilities in one function.

The flow is correct but not self-documenting. A reader grepping for "where does SVGO run" has to scan the whole thing. Natural extraction:

```diff
-async function main() { ... 82 LOC ... }
+async function main() {
+  const { srcPath, destPath } = parseArgs();
+  const { diagram, meta } = await loadAndValidate(srcPath);
+  const svg = await renderDiagram(diagram, meta);
+  const optimized = optimizeAndEnforceBudget(svg);
+  await writeOutput(destPath, optimized);
+  printResult(destPath, optimized, meta);
+}
```

Each helper is 10-15 LOC with a single job. Total LOC grows slightly (helper defs) but reader comprehension wins.

**Severity:** NITPICK, and probably premature refactor. Flag for future reference only.

---

### Q-16 :: Test labels mix `::` separators with prose — good for human readability, zero for machine parsing

**File:** `tests/unit/excalidraw-to-svg.test.ts` — all 9 test names

**Issue:** Test names are `'DIAG-01 :: exports-valid-svg — script produces well-formed SVG from minimal fixture'`. Great for grepping `DIAG-01::` and for humans. But `node --test` reporter output truncates long names in some modes; a CI filter like `node --test --test-name-pattern "DIAG-01"` works, but `--test-name-pattern "exports-valid-svg"` also works — no single canonical identifier.

Minor style consistency nudge: pick either machine-first (`DIAG-01-exports-valid-svg`) or human-first (`exports valid SVG from minimal fixture`), don't straddle.

**Severity:** NITPICK — current format is fine, flagging only because the prompt asked about test structure.

---

### Q-17 :: `CRLF` line endings in meta/source files are undocumented — no test, no normalization

**File:** `scripts/excalidraw-to-svg.mjs:108, 116`

**Issue:** If a Windows author edits `meta.json` in Notepad, `\r\n` line endings round-trip fine through `JSON.parse` (JSON.parse is CRLF-agnostic inside string values, treats CR as whitespace outside). But the `descEn` string itself, if it contains a newline (shouldn't, but could), serializes into `<desc>` with the CR literally present. This may or may not break XML parsers.

Also: the OUTPUT SVG — does SVGO normalize line endings? Empirically yes (SVGO writes LF), but nothing in the script forces this. Authors diffing SVG across platforms would see CRLF vs LF churn.

**Fix (defensive, unnecessary today):**
```diff
-await fs.writeFile(destPath, optimized, 'utf8');
+await fs.writeFile(destPath, optimized.replace(/\r\n/g, '\n'), 'utf8');
```

**Severity:** NITPICK. Mac/Linux single-author workflow, not a real issue.

---

## Summary

Non-security review surfaces 2 HIGH, 8 MEDIUM, 4 LOW, 3 NITPICK findings, all distinct from `04-REVIEW.md`'s BL/WR/IN items. Top concerns:

1. **Idempotency isn't guaranteed but is implied** — Q-01. Excalidraw's `seed` field makes outputs byte-unstable across re-exports. The script's header promises "re-runnable" in a way that sets authors up for git-diff noise.
2. **Error quality for malformed JSON** — Q-02. Current UX drops raw `SyntaxError` without naming which file failed. This is the most common author error and the worst-handled.
3. **Empty/malformed diagrams pass silently** — Q-03, Q-04. Empty `elements: []` produces a zero-size SVG with no warning; `{"title": [...]}` produces literal `[object Object]` in the output title.
4. **Test coverage is thin** — Q-08 (100 KB files-blob cap is untested), Q-12 (no Unicode/emoji/control-char fixtures), Q-07 (no concurrent/overwrite-race tests), Q-06 (no negative-viewBox fixture). The 9 shipped tests cover the happy path + 3 known error shapes; roughly ~8 more tests would close the gap.
5. **Hardcoded allow-list roots** — Q-05. `REPO_ROOT`/`TMP_ROOT` as two separate branches instead of a whitelist array; makes future evolution awkward and the error message already misleading.

Also noteworthy: the `@aldinokemal2104/excalidraw-to-svg@1.1.1` pin is the latest version from a single-maintainer npm package (Q-11) — pinning is correct but fork/vendor contingency is worth documenting. Dev ergonomics (Q-13) would benefit from a one-line-per-diagram default with `--verbose` for the current 4-line detail block.
