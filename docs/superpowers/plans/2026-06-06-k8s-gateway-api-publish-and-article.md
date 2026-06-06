# k8s-gateway-api: Publish Deck + Companion Article — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or
> executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Publish the `k8s-gateway-api` Slidev deck to `vedmich.dev/slides/k8s-gateway-api/`, then
ship a bilingual companion blog article that reuses the deck (live iframe embeds for animation/diagram
slides, Shiki code blocks for code slides).

**Architecture:** Deck publish uses the existing hardened autopilot `scripts/deploy-deck.sh` (3-repo
submodule pipeline). Article is `.mdx` in the blog content collection, with a new thin `SlideEmbed.astro`
component that iframes a deployed slide by URL (no Slidev deps pulled into Astro).

**Tech Stack:** Astro 5.x, Tailwind 4, Slidev (slidev-theme-vv), MDX, Shiki, GitHub Pages.

**Design:** `docs/superpowers/specs/2026-06-06-k8s-gateway-api-publish-and-article-design.md`

---

## PHASE 1 — Publish the deck

### Task 1.1: Commit deck source in slidev-theme-vv

**Files:**
- Repo: `~/Documents/GitHub/vedmichv/slidev-theme-vv/`
- Add: `presentations/k8s-gateway-api/` (slides.md + POLISH.md), `layouts/cover.vue` (long-uncommitted)

- [ ] **Step 1: Inspect what's uncommitted**

Run: `cd ~/Documents/GitHub/vedmichv/slidev-theme-vv && git status --short presentations/k8s-gateway-api/ layouts/cover.vue`
Expected: `?? presentations/k8s-gateway-api/` and ` M layouts/cover.vue`.

- [ ] **Step 2: Commit deck + cover housekeeping**

Only stage these paths (the repo has other unrelated untracked dirs — do NOT `git add -A`).
```bash
cd ~/Documents/GitHub/vedmichv/slidev-theme-vv
git add presentations/k8s-gateway-api/ layouts/cover.vue
git commit -m "feat(deck): k8s-gateway-api 40-slide deck + cover centering fix"
```
Expected: one commit, ~2 files + deck dir.

- [ ] **Step 3: Confirm clean for the deck path**

Run: `git status --short presentations/k8s-gateway-api/`
Expected: empty output.

### Task 1.2: Pre-create both presentation cards (draft:true)

**Files:**
- Create: `~/Documents/GitHub/vedmich/vedmich.dev/src/content/presentations/en/k8s-gateway-api.md`
- Create: `~/Documents/GitHub/vedmich/vedmich.dev/src/content/presentations/ru/k8s-gateway-api.md`

- [ ] **Step 1: Write EN card** (schema: title, event, city, date, description, tags, draft)

```markdown
---
title: "Kubernetes Gateway API: from zero to hero"
event: "Concept deck · Technical deep-dive"
city: null
date: 2026-06-06
description: "The vendor-neutral successor to Ingress, end to end: the four resources, the platform-vs-app split, traffic splitting, TLS, multi-team, and the service mesh — built up on one running shop."
tags: ["Kubernetes", "Gateway API", "Networking"]
draft: true
---
```

- [ ] **Step 2: Write RU card** (independent good Russian, not a literal translation)

```markdown
---
title: "Kubernetes Gateway API: от нуля до героя"
event: "Концепт-разбор · Технический deep-dive"
city: null
date: 2026-06-06
description: "Vendor-neutral преемник Ingress целиком: четыре ресурса, разделение platform / app, traffic splitting, TLS, мульти-тим и сервис-меш — собрано на одном живом магазине."
tags: ["Kubernetes", "Gateway API", "Networking"]
draft: true
---
```

- [ ] **Step 3: Verify schema parity**

Run: `cd ~/Documents/GitHub/vedmich/vedmich.dev && head -9 src/content/presentations/en/k8s-gateway-api.md src/content/presentations/ru/k8s-gateway-api.md`
Expected: both `draft: true`, same keys. (The autopilot aborts on mixed/asymmetric draft state.)

### Task 1.3: Dry-run the autopilot — CHECKPOINT A

- [ ] **Step 1: Rehearse**

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev
scripts/deploy-deck.sh --slug k8s-gateway-api --theme slidev-theme-vv --dry-run
```
Expected: read-only preflight passes; prints the build, the gh-pages diff, the submodule bump SHA,
the whitelist sentinel edit, the un-draft diff. Mutates nothing.

- [ ] **Step 2: Inspect the printed diffs**

Confirm: base path is `/slides/k8s-gateway-api/`; whitelist becomes `"vv-demo k8s-gateway-api"`;
both cards flip draft true→false; no co-tenant deck (vv-demo) is dragged. STOP and report to user.

### Task 1.4: Real deploy

- [ ] **Step 1: Run for real** (only after Checkpoint A approved)

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev
scripts/deploy-deck.sh --slug k8s-gateway-api --theme slidev-theme-vv
```
Expected: builds, pushes gh-pages, pins submodule SHA, edits whitelist, un-drafts cards, ONE atomic
`main` commit, polls Pages run, curl-gates live root. On any failure it auto-reverts and prints rollback.

- [ ] **Step 2: Verify live**

```bash
curl -I https://vedmich.dev/slides/k8s-gateway-api/        # expect HTTP/2 200
curl -s https://vedmich.dev/slides/k8s-gateway-api/ | grep -q '<script' && echo "SPA OK"
```
Then browser-check `/slides/k8s-gateway-api/`, a direct deep-link `/slides/k8s-gateway-api/10`, and
`/slides/k8s-gateway-api/presenter/`. Report live URL to user.

---

## PHASE 2 — Companion article

### Task 2.0: Build + verify SlideEmbed.astro on the LIVE vv-demo deck — CHECKPOINT B

De-risks the net-new embed mechanism against an already-live deck before any prose is written.

**Files:**
- Create: `~/Documents/GitHub/vedmich/vedmich.dev/src/components/SlideEmbed.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  slug?: string;
  slide: number;
  title: string;
  caption?: string;
}
const { slug = 'k8s-gateway-api', slide, title, caption } = Astro.props;
const src = `/slides/${slug}/${slide}`;
---
<figure class="my-8">
  <div class="slide-embed">
    <iframe src={src} title={title} loading="lazy" allowfullscreen
            referrerpolicy="no-referrer"></iframe>
  </div>
  {caption && <figcaption class="text-sm text-text-muted mt-2 text-center">{caption}</figcaption>}
</figure>
<style>
  .slide-embed {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 1px solid rgb(255 255 255 / 0.08);
    background: #0F172A;
  }
  .slide-embed iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
```

- [ ] **Step 2: Smoke-test the component against vv-demo (which IS live) in a throwaway post**

Create `src/content/blog/en/__embed-smoke.mdx`:
```mdx
---
title: "embed smoke"
description: "throwaway"
date: 2026-06-06
tags: ["test"]
draft: true
---
import SlideEmbed from '../../../components/SlideEmbed.astro';
<SlideEmbed slug="vv-demo" slide={1} title="vv-demo slide 1" caption="smoke test" />
```

- [ ] **Step 3: Build and confirm it compiles + emits the iframe**

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev
npm run build
grep -rq 'iframe' dist/en/blog/__embed-smoke/index.html && echo "EMBED OK" || echo "EMBED FAIL"
```
Expected: build clean, `EMBED OK`. Then `open dist/en/blog/__embed-smoke/index.html` and confirm the
vv-demo slide loads in the iframe (vv-demo is live, so this proves the mechanism end to end).

- [ ] **Step 4: Delete the smoke post**

Run: `rm src/content/blog/en/__embed-smoke.mdx`
Report to user: embed verified, ready to write. STOP for Checkpoint B.

### Task 2.1: Draft the EN article

**Files:**
- Create: `~/Documents/GitHub/vedmich/vedmich.dev/src/content/blog/en/2026-06-06-kubernetes-gateway-api-zero-to-hero.mdx`

- [ ] **Step 1: Frontmatter + imports**

```mdx
---
title: "Kubernetes Gateway API: from zero to hero"
description: "Ingress is done. Here is its vendor-neutral successor end to end — the four resources, the platform-vs-app split, traffic splitting, TLS, multi-team, and the mesh, built on one running shop."
date: 2026-06-06
tags: ["kubernetes", "gateway-api", "networking"]
---
import SlideEmbed from '../../../components/SlideEmbed.astro';
```

- [ ] **Step 2: Write the 10 sections** per the spec's section map. Rules: expanded prose (not slide
captions); embeds at slides 6, 14, 15, 25, 30, 33, 34 via `<SlideEmbed slide={N} title=… caption=… />`;
Shiki code blocks for install/gateway/route/verify/TLS/filters reusing the deck's `#` comments; no em
dashes; contractions + first-person SA voice; CTA to the full deck at the end. Target depth comparable
to the karpenter post (`src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx`).

- [ ] **Step 3: Build-check EN**

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev && npm run build
grep -c 'iframe' dist/en/blog/2026-06-06-kubernetes-gateway-api-zero-to-hero/index.html
```
Expected: build clean; iframe count == 7.

- [ ] **Step 4: Em-dash + buzzword scan**

Run: `grep -n '—' src/content/blog/en/2026-06-06-kubernetes-gateway-api-zero-to-hero.mdx || echo "no em dashes"`
Expected: `no em dashes`.

### Task 2.2: Draft the RU article

**Files:**
- Create: `~/Documents/GitHub/vedmich/vedmich.dev/src/content/blog/ru/2026-06-06-kubernetes-gateway-api-zero-to-hero.mdx`

- [ ] **Step 1: Mirror structure, independent Russian prose** (same frontmatter keys, RU title/description;
same import; same 7 embeds + same code blocks; natural Russian, not a literal translation). Technical
terms stay English (Gateway, HTTPRoute, namespace, etc.).

- [ ] **Step 2: Build-check RU**

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev && npm run build
grep -c 'iframe' dist/ru/blog/2026-06-06-kubernetes-gateway-api-zero-to-hero/index.html
```
Expected: build clean; iframe count == 7.

- [ ] **Step 3: Em-dash scan RU**

Run: `grep -n '—' src/content/blog/ru/2026-06-06-kubernetes-gateway-api-zero-to-hero.mdx || echo "no em dashes"`
Expected: `no em dashes`.

### Task 2.3: Final verification + ship

- [ ] **Step 1: Full clean build (CI-equivalent)**

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev
rm -rf dist .astro && npm run build
```
Expected: clean.

- [ ] **Step 2: Visual check both locales**

`open dist/en/blog/2026-06-06-kubernetes-gateway-api-zero-to-hero/index.html` and the ru path. Confirm:
7 embeds load the live deck slides, code blocks highlight, captions present, layout intact, post shows
in homepage BlogPreview (top 3).

- [ ] **Step 3: Commit + push** (small content change → straight to main per site CLAUDE.md)

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev
git add src/components/SlideEmbed.astro src/content/blog/en/2026-06-06-kubernetes-gateway-api-zero-to-hero.mdx src/content/blog/ru/2026-06-06-kubernetes-gateway-api-zero-to-hero.mdx
git commit -m "blog: Kubernetes Gateway API zero-to-hero companion article (EN+RU) + SlideEmbed"
git push origin main
```

- [ ] **Step 4: Verify live after Pages deploy (~2 min)**

```bash
curl -sI https://vedmich.dev/en/blog/2026-06-06-kubernetes-gateway-api-zero-to-hero/ | head -1
curl -sI https://vedmich.dev/ru/blog/2026-06-06-kubernetes-gateway-api-zero-to-hero/ | head -1
```
Expected: both HTTP/2 200. Report both URLs to user.
