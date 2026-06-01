# vedmich-dev Slides-Deploy Autopilot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `deploy-deck.sh` — a fail-closed autopilot that publishes a `slidev-theme-vv` deck to `vedmich.dev/slides/<slug>/`, plus the `vedmich-dev` skill that wraps it — and migrate `vv-demo` as the first run.

**Architecture:** A pure-function bash library (`scripts/lib/deploy-lib.sh`) holds the testable seams (slug validation, base-path violation detection, whitelist editing). The orchestrator (`scripts/deploy-deck.sh`) sources it, runs a read-only preflight, then 6 verified steps across the 3 repos (theme → `vedmichv/slidev:gh-pages` → `vedmich.dev` submodule + CI whitelist). The skill is a thin wrapper; `slides-onboarding.md` stays the canonical prose runbook.

**Tech Stack:** bash 3.2 (macOS/BSD — no `sed -i`, no `timeout`), `pnpm` + Slidev (theme build), `gh` CLI (Pages poll), `git` submodules, Astro 5 Content Collections (MDX cards), `python3` (YAML parse check).

**Spec:** `docs/superpowers/specs/2026-06-01-vedmich-dev-skill-slides-deploy-design.md`
**Review:** `docs/superpowers/specs/2026-06-01-vedmich-dev-skill-REVIEW.md`

**Repo path constants (used by every task):**
```bash
THEME_REPO="$HOME/Documents/GitHub/vedmichv/slidev-theme-vv"     # deck sources
GHPAGES_REPO="$HOME/Documents/GitHub/vedmichv/slidev"            # artifact repo (gh-pages), push target
SITE_REPO="$HOME/Documents/GitHub/vedmich/vedmich.dev"           # Astro site (this repo); submodule at $SITE_REPO/slidev
```

---

## File Structure

```
~/Documents/GitHub/vedmich/vedmich.dev/
├── scripts/
│   ├── deploy-deck.sh            NEW — the autopilot orchestrator
│   ├── lib/
│   │   └── deploy-lib.sh         NEW — pure, sourceable, unit-tested functions
│   └── tests/
│       ├── run.sh               NEW — zero-dependency bash assertion runner
│       ├── fixtures/            NEW — sample index.html + deploy.yml fixtures
│       ├── test-slug.sh         NEW
│       ├── test-base.sh         NEW
│       └── test-whitelist.sh    NEW
├── .github/workflows/deploy.yml MODIFY — convert whitelist to a sentinel line
└── docs/slides-onboarding.md    MODIFY — reconcile step 6 (PR → direct push) + canonical note

~/.claude/skills/vedmich-dev/    NEW skill (+ vault backup)
├── SKILL.md
└── references/
    ├── slides-deploy.md
    └── architecture.md

~/.claude/skills/vv-slidev/SKILL.md  MODIFY — subtractive delegation (+ vault backup)
```

**Deferred (explicit, not built now — per review G10, YAGNI for a single-operator site):** a full `file://` bare-repo sandbox that runs the whole pipeline end-to-end against throwaway clones. The safety net here is: TDD'd pure functions + `--dry-run` (mutates nothing, computes every diff) + `bash -n`/shellcheck + the step-2 snapshot rollback + the `--cutover` collision guard. A sandbox harness is a follow-up if the script grows.

---

## Task 1: Test harness + `validate_slug`

**Files:**
- Create: `scripts/lib/deploy-lib.sh`
- Create: `scripts/tests/run.sh`
- Create: `scripts/tests/test-slug.sh`

- [ ] **Step 1: Write the zero-dependency assertion runner**

Create `scripts/tests/run.sh`:
```bash
#!/usr/bin/env bash
# Tiny assertion harness — no bats dependency. Each test-*.sh defines test_* functions.
set -uo pipefail
PASS=0 FAIL=0
assert_ok()   { if "$@"; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(ok):  $*"; fi; }
assert_fail() { if "$@"; then FAIL=$((FAIL+1)); echo "  FAIL(exp-fail): $*"; else PASS=$((PASS+1)); fi; }
assert_eq()   { if [ "$1" = "$2" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(eq): got[$1] want[$2]"; fi; }
assert_empty(){ if [ -z "$1" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(empty): got[$1]"; fi; }
assert_nonempty(){ if [ -n "$1" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(nonempty)"; fi; }
DIR="$(cd "$(dirname "$0")" && pwd)"
for f in "$DIR"/test-*.sh; do
  echo "── $(basename "$f")"
  # shellcheck disable=SC1090
  . "$f"
  for fn in $(declare -F | awk '{print $3}' | grep '^test_'); do "$fn"; unset -f "$fn"; done
done
echo "── total: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
```

- [ ] **Step 2: Write the failing slug test**

Create `scripts/tests/test-slug.sh`:
```bash
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/deploy-lib.sh"
test_slug_valid() {
  assert_ok   validate_slug vv-demo
  assert_ok   validate_slug karpenter-prod
  assert_ok   validate_slug a1
}
test_slug_invalid() {
  assert_fail validate_slug ""
  assert_fail validate_slug -lead
  assert_fail validate_slug trail-
  assert_fail validate_slug "has space"
  assert_fail validate_slug ../etc
  assert_fail validate_slug a/b
  assert_fail validate_slug .
  assert_fail validate_slug UPPER
}
```

- [ ] **Step 3: Run to verify it fails**

Run: `bash scripts/tests/run.sh`
Expected: FAIL — `deploy-lib.sh` has no `validate_slug` (sourcing errors or function-not-found).

- [ ] **Step 4: Implement `validate_slug` in the library**

Create `scripts/lib/deploy-lib.sh`:
```bash
#!/usr/bin/env bash
# deploy-lib.sh — pure, sourceable helpers for deploy-deck.sh. No side effects, no I/O
# beyond reading the file args passed in. Unit-tested by scripts/tests/.

# validate_slug <slug> → 0 if a safe deck slug, else 1. Guards every path/rm built from it.
validate_slug() {
  local slug="${1:-}"
  [ -n "$slug" ] || return 1
  case "$slug" in
    ''|.|..|/*|*/*|*' '*) return 1 ;;
  esac
  printf '%s' "$slug" | grep -qE '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' || return 1
  return 0
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `bash scripts/tests/run.sh`
Expected: PASS — `test-slug.sh` green, `0 failed`.

- [ ] **Step 6: Commit**

```bash
chmod +x scripts/tests/run.sh
git add scripts/lib/deploy-lib.sh scripts/tests/run.sh scripts/tests/test-slug.sh
git commit -m "feat(deploy): slug validation + zero-dep test harness"
```

---

## Task 2: `count_root_assets` + `base_violations`

**Files:**
- Modify: `scripts/lib/deploy-lib.sh`
- Create: `scripts/tests/fixtures/good-index.html`
- Create: `scripts/tests/fixtures/bad-index.html`
- Create: `scripts/tests/test-base.sh`

- [ ] **Step 1: Create the fixtures**

Create `scripts/tests/fixtures/good-index.html` (correct `/slides/vv-demo/` base + the two legit public dirs):
```html
<link rel="icon" href="/slides/vv-demo/theme/favicon.png">
<script src="/slides/vv-demo/assets/index-abc.js"></script>
<img src="/aws-icons/aws-lambda.svg">
<link href="/modules/foo.js">
<a href="https://external.example/x">ext</a>
```

Create `scripts/tests/fixtures/bad-index.html` (legacy `/vv-demo/` base — the collision case):
```html
<link rel="icon" href="/vv-demo/theme/favicon.png">
<script src="/vv-demo/assets/index-abc.js"></script>
<img src="/aws-icons/aws-lambda.svg">
```

- [ ] **Step 2: Write the failing base test**

Create `scripts/tests/test-base.sh`:
```bash
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/deploy-lib.sh"
FX="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fixtures"
test_good_has_no_violations() {
  assert_empty "$(base_violations "$FX/good-index.html" /slides/vv-demo/)"
}
test_good_counts_root_assets() {
  # 2 slug-based + 2 public-dir = 4 root-absolute (external https excluded by pattern)
  assert_eq "$(count_root_assets "$FX/good-index.html")" 4
}
test_bad_reports_legacy_base() {
  assert_nonempty "$(base_violations "$FX/bad-index.html" /slides/vv-demo/)"
}
```

- [ ] **Step 3: Run to verify it fails**

Run: `bash scripts/tests/run.sh`
Expected: FAIL — `count_root_assets`/`base_violations` undefined.

- [ ] **Step 4: Implement both functions**

Append to `scripts/lib/deploy-lib.sh`:
```bash
# count_root_assets <index_html> → integer count of root-absolute src/href URLs
# (protocol-relative // excluded). Used to ABORT on an empty/broken build.
count_root_assets() {
  local index="$1"
  [ -f "$index" ] || { echo 0; return 0; }
  grep -oE '(src|href)="/[^"]*"' "$index" \
    | grep -vE '="//' \
    | grep -c . | tr -d ' '
}

# base_violations <index_html> <expected_base> → prints each root-absolute asset URL that
# does NOT sit under <expected_base>, excluding protocol-relative and the two deck-root public
# dirs (/aws-icons/, /modules/) that legitimately live at deck root even when correctly based.
# Empty output = OK. Always exits 0 (caller inspects the output).
base_violations() {
  local index="$1" base="$2"
  [ -f "$index" ] || { echo "NO_INDEX"; return 0; }
  grep -oE '(src|href)="/[^"]*"' "$index" \
    | sed -E 's/^(src|href)="//; s/"$//' \
    | grep -vE '^//' \
    | grep -vE '^/(aws-icons|modules)/' \
    | grep -vE "^${base}" || true
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `bash scripts/tests/run.sh`
Expected: PASS — all three base tests green.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/deploy-lib.sh scripts/tests/test-base.sh scripts/tests/fixtures/
git commit -m "feat(deploy): base-path violation detector + root-asset count (load-bearing seam)"
```

---

## Task 3: `whitelist_add` + `whitelist_has` (idempotent)

**Files:**
- Modify: `scripts/lib/deploy-lib.sh`
- Create: `scripts/tests/fixtures/deploy.fixture.yml`
- Create: `scripts/tests/test-whitelist.sh`

- [ ] **Step 1: Create the whitelist fixture (sentinel form)**

Create `scripts/tests/fixtures/deploy.fixture.yml`:
```yaml
      - name: Copy Slidev decks to dist/slides
        run: |
          mkdir -p dist/slides
          SLIDES_WHITELIST=""  # DEPLOY_DECK_SENTINEL
          for slug in $SLIDES_WHITELIST; do
            cp -r "slidev/$slug" dist/slides/
          done
```

- [ ] **Step 2: Write the failing whitelist test (incl. idempotency)**

Create `scripts/tests/test-whitelist.sh`:
```bash
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/deploy-lib.sh"
FXSRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fixtures/deploy.fixture.yml"
test_whitelist_add_then_has() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  assert_fail whitelist_has "$tmp" vv-demo
  whitelist_add "$tmp" vv-demo
  assert_ok   whitelist_has "$tmp" vv-demo
  # second slug appends, preserves first
  whitelist_add "$tmp" karpenter-prod
  assert_ok   whitelist_has "$tmp" vv-demo
  assert_ok   whitelist_has "$tmp" karpenter-prod
  rm -f "$tmp"
}
test_whitelist_idempotent() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" vv-demo
  whitelist_add "$tmp" vv-demo   # repeat — must NOT duplicate
  assert_eq "$(grep -c 'DEPLOY_DECK_SENTINEL' "$tmp")" 1
  assert_eq "$(grep -oE 'vv-demo' "$tmp" | grep -c .)" 1
  rm -f "$tmp"
}
test_whitelist_yaml_still_parses() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" vv-demo
  assert_ok python3 -c "import yaml,sys; yaml.safe_load(open('$tmp'))"
  rm -f "$tmp"
}
```

- [ ] **Step 3: Run to verify it fails**

Run: `bash scripts/tests/run.sh`
Expected: FAIL — `whitelist_add`/`whitelist_has` undefined.

- [ ] **Step 4: Implement both functions**

Append to `scripts/lib/deploy-lib.sh`:
```bash
# whitelist_has <deploy_yml> <slug> → 0 if slug present in the sentinel SLIDES_WHITELIST line.
whitelist_has() {
  local file="$1" slug="$2" cur
  cur=$(grep -E '# DEPLOY_DECK_SENTINEL' "$file" \
        | sed -E 's/^[[:space:]]*SLIDES_WHITELIST="([^"]*)".*/\1/')
  case " $cur " in *" $slug "*) return 0 ;; *) return 1 ;; esac
}

# whitelist_add <deploy_yml> <slug> → idempotently append slug to the sentinel SLIDES_WHITELIST
# line, preserving leading indentation. Returns 2 if the sentinel line is missing.
whitelist_add() {
  local file="$1" slug="$2" line cur newval tmp
  line=$(grep -nE '# DEPLOY_DECK_SENTINEL' "$file" | head -1 | cut -d: -f1)
  [ -n "$line" ] || return 2
  cur=$(sed -n "${line}p" "$file" | sed -E 's/^[[:space:]]*SLIDES_WHITELIST="([^"]*)".*/\1/')
  case " $cur " in *" $slug "*) return 0 ;; esac
  if [ -z "$cur" ]; then newval="$slug"; else newval="$cur $slug"; fi
  tmp=$(mktemp)
  awk -v ln="$line" -v val="$newval" '
    NR==ln { match($0,/^[[:space:]]*/);
             printf "%sSLIDES_WHITELIST=\"%s\"  # DEPLOY_DECK_SENTINEL\n", substr($0,1,RLENGTH), val; next }
    { print }' "$file" > "$tmp"
  mv -- "$tmp" "$file"
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `bash scripts/tests/run.sh`
Expected: PASS — add/has/idempotent/yaml-parse all green.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/deploy-lib.sh scripts/tests/test-whitelist.sh scripts/tests/fixtures/deploy.fixture.yml
git commit -m "feat(deploy): idempotent sentinel-whitelist editor + YAML-parse guard"
```

---

## Task 4: Convert `deploy.yml` whitelist to the sentinel form

**Files:**
- Modify: `.github/workflows/deploy.yml:38-47`

- [ ] **Step 1: Replace the commented-loop block with the sentinel block**

In `.github/workflows/deploy.yml`, replace the `Copy Slidev decks to dist/slides` step body (the `mkdir` + commented `for slug` loop) with:
```yaml
      - name: Copy Slidev decks to dist/slides
        run: |
          mkdir -p dist/slides
          # Active whitelist managed by scripts/deploy-deck.sh — it edits the sentinel line below.
          # Each slug must be pre-built in vedmichv/slidev:gh-pages with --base /slides/<slug>/.
          # See docs/slides-onboarding.md for the full flow.
          SLIDES_WHITELIST=""  # DEPLOY_DECK_SENTINEL
          for slug in $SLIDES_WHITELIST; do
            cp -r "slidev/$slug" dist/slides/
          done
```

- [ ] **Step 2: Verify YAML parses and the run-script is valid bash**

Run:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('yaml ok')"
python3 - <<'PY'
import yaml
d=yaml.safe_load(open('.github/workflows/deploy.yml'))
step=[s for s in d['jobs']['build']['steps'] if s.get('name','').startswith('Copy Slidev')][0]
open('/tmp/wl.sh','w').write(step['run'])
print('extracted run block')
PY
bash -n /tmp/wl.sh && echo "bash ok"
```
Expected: `yaml ok`, `extracted run block`, `bash ok`.

- [ ] **Step 3: Verify the library agrees with the real file (empty → add → has)**

Run:
```bash
cp .github/workflows/deploy.yml /tmp/deploy.copy.yml
bash -c '. scripts/lib/deploy-lib.sh; whitelist_has /tmp/deploy.copy.yml vv-demo && echo HAS || echo ABSENT'
bash -c '. scripts/lib/deploy-lib.sh; whitelist_add /tmp/deploy.copy.yml vv-demo; whitelist_has /tmp/deploy.copy.yml vv-demo && echo HAS'
```
Expected: `ABSENT` then `HAS`. (Operates on the copy — real file stays empty.)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci(slides): convert whitelist to script-managed sentinel line (empty, no behavior change)"
```

---

## Task 5: Reconcile `slides-onboarding.md` (canonical doc + step 6)

**Files:**
- Modify: `docs/slides-onboarding.md`

- [ ] **Step 1: Add a canonical-source banner near the top**

After the intro paragraph in `docs/slides-onboarding.md`, insert:
```markdown
> **Canonical sources (D-10):** the executable HOW is `scripts/deploy-deck.sh` (its seams ARE
> the process); this file is the canonical prose WHY + manual fallback. A process change edits
> **`deploy-deck.sh` + this file only** — the `vedmich-dev` skill, `vv-slidev/references/deployment.md`,
> and `publish-to-vedmich-dev.md` are thin pointers and must not restate the 6 steps.
```

- [ ] **Step 2: Reconcile Step 6 from feature-branch+PR to direct-push + local gate**

Replace the "Push + deploy" subsection of Step 6 (the `git push origin <feature-branch>` / "Open PR, merge after CI green" lines) with:
```markdown
Push + deploy (autopilot policy D-6 — direct to `main`, gated by a local CI-equivalent build):

```bash
# CI-equivalent gate BEFORE pushing (the Astro build alone is blind to the slides pipeline):
npm run build
mkdir -p dist/slides && cp -R slidev/<slug>/. dist/slides/<slug>/
test -f dist/slides/<slug>/index.html && test -f dist/slides/<slug>/404.html
grep -oE '(src|href)="/[^"]*"' dist/slides/<slug>/index.html | grep -vE '^(src|href)="//|/(aws-icons|modules)/' | grep -vqE '"/slides/<slug>/' || echo "base OK"

git push origin main   # auto-deploys; main is unprotected
```

`deploy-deck.sh` performs exactly this gate automatically. The manual PR route is retained only
as a fallback when `main` is later branch-protected (the script aborts and says so).
```

- [ ] **Step 3: Verify no contradictory "Open PR" wording remains in Step 6**

Run: `grep -n "Open PR\|feature-branch\|merge after CI" docs/slides-onboarding.md`
Expected: no matches inside the Step 6 push block (a Gotcha-section mention is fine if it points back to this policy).

- [ ] **Step 4: Commit**

```bash
git add docs/slides-onboarding.md
git commit -m "docs(slides): designate canonical sources + reconcile step 6 to direct-push (D-6/D-10)"
```

---

## Task 6: `deploy-deck.sh` skeleton (contract, args, run(), dry-run)

**Files:**
- Create: `scripts/deploy-deck.sh`

- [ ] **Step 1: Write the skeleton**

Create `scripts/deploy-deck.sh`:
```bash
#!/usr/bin/env bash
# deploy-deck.sh — fail-closed autopilot: publish a slidev-theme-vv deck to vedmich.dev/slides/<slug>/.
# macOS/BSD/bash-3.2 safe: no `sed -i`, no `timeout`, no bash-4 features. See
# docs/superpowers/specs/2026-06-01-vedmich-dev-skill-slides-deploy-design.md and docs/slides-onboarding.md.
set -euo pipefail
IFS=$'\n\t'

THEME_REPO="$HOME/Documents/GitHub/vedmichv/slidev-theme-vv"
GHPAGES_REPO="$HOME/Documents/GitHub/vedmichv/slidev"
SITE_REPO="$HOME/Documents/GitHub/vedmich/vedmich.dev"
SUBMODULE="$SITE_REPO/slidev"
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HERE/lib/deploy-lib.sh"

SLUG="" ; THEME="" ; DRYRUN=0 ; NO_UNDRAFT=0 ; CUTOVER=0
ROLLBACK_NOTES=""

log()  { printf '\033[1;36m▶ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*" >&2; }
note_rollback() { ROLLBACK_NOTES="${ROLLBACK_NOTES}$1"$'\n'; }
print_rollback() {
  [ -n "$ROLLBACK_NOTES" ] || return 0
  printf '\033[1;33m── rollback ──\n%s\033[0m\n' "$ROLLBACK_NOTES" >&2
}
die() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; print_rollback; exit 1; }
trap 'die "aborted (unexpected error at line $LINENO)"' ERR

# run <description> -- <cmd...>  : in --dry-run, print and skip; else execute.
run() {
  local desc="$1"; shift
  [ "$1" = "--" ] && shift
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] %s\n     $ %s\n' "$desc" "$*"; return 0; fi
  log "$desc"; "$@"
}

usage() { cat >&2 <<EOF
Usage: deploy-deck.sh --slug <slug> --theme slidev-theme-vv [--no-undraft] [--cutover] [--dry-run]
  --slug        deck slug (presentations/<slug>/ in the theme repo)
  --theme       slidev-theme-vv (only supported theme for now — D-8)
  --no-undraft  do NOT touch the homepage MDX card (theme demos, e.g. vv-demo — D-7)
  --cutover     allow overwriting a slug already deployed at a DIFFERENT base; also removes
                its card from the gh-pages root index.html (legacy s.vedmich.dev cutover — D-9)
  --dry-run     preflight + build + compute/show every diff; mutate & push nothing
EOF
exit 2; }

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --slug)       SLUG="${2:?--slug needs a value}"; shift 2 ;;
      --theme)      THEME="${2:?--theme needs a value}"; shift 2 ;;
      --no-undraft) NO_UNDRAFT=1; shift ;;
      --cutover)    CUTOVER=1; shift ;;
      --dry-run)    DRYRUN=1; shift ;;
      -h|--help)    usage ;;
      *)            warn "unknown arg: $1"; usage ;;
    esac
  done
  validate_slug "$SLUG" || die "invalid --slug '${SLUG:-}' (must match ^[a-z0-9]([a-z0-9-]*[a-z0-9])?\$)"
  [ "$THEME" = "slidev-theme-vv" ] || die "--theme must be slidev-theme-vv (slurm deferred — D-8)"
}

main() {
  parse_args "$@"
  log "deploy-deck: slug=$SLUG theme=$THEME dry-run=$DRYRUN no-undraft=$NO_UNDRAFT cutover=$CUTOVER"
  # preflight + steps wired in later tasks
}
main "$@"
```

- [ ] **Step 2: Parse-check and arg-validation behavior**

Run:
```bash
chmod +x scripts/deploy-deck.sh
bash -n scripts/deploy-deck.sh && echo "parse ok"
scripts/deploy-deck.sh --slug "bad slug" --theme slidev-theme-vv; echo "exit=$?"
scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-slurm; echo "exit=$?"
scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --dry-run; echo "exit=$?"
```
Expected: `parse ok`; first two `exit=1` with a clear `✗` message; the third prints the `deploy-deck: slug=vv-demo …` line and `exit=0`.

- [ ] **Step 3: shellcheck (if available) — non-fatal**

Run: `command -v shellcheck >/dev/null && shellcheck scripts/deploy-deck.sh scripts/lib/deploy-lib.sh || echo "shellcheck not installed — skipping"`
Expected: clean, or the skip message. Fix any error-level findings.

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy-deck.sh
git commit -m "feat(deploy): autopilot skeleton — contract, arg parser, run()/die/trap, dry-run plumbing"
```

---

## Task 7: Preflight envelope (read-only, incl. base-collision guard)

**Files:**
- Modify: `scripts/deploy-deck.sh`

- [ ] **Step 1: Add the `preflight` function and call it from `main`**

In `scripts/deploy-deck.sh`, add before `main()`:
```bash
# Captured in preflight for later steps / drag-detection.
OLDPIN=""

preflight() {
  log "preflight (read-only)…"
  # 1. repos exist
  for d in "$THEME_REPO" "$GHPAGES_REPO" "$SITE_REPO" "$SUBMODULE"; do
    [ -d "$d/.git" ] || [ -f "$d/.git" ] || die "missing git repo: $d"
  done
  # 2. theme deck exists
  [ -f "$THEME_REPO/presentations/$SLUG/slides.md" ] || die "deck not found: presentations/$SLUG/slides.md"
  # 3. scoped cleanliness — theme: only the deck source (repo has untracked scratch)
  [ -z "$(git -C "$THEME_REPO" status --porcelain "presentations/$SLUG/")" ] \
    || die "theme working tree dirty under presentations/$SLUG/ — commit/stash first"
  #    site: clean ignoring submodule pointer; submodule checked separately
  [ -z "$(git -C "$SITE_REPO" status --porcelain --ignore-submodules=dirty)" ] \
    || die "site working tree dirty — commit/stash first"
  [ -z "$(git -C "$SUBMODULE" status --porcelain)" ] \
    || die "submodule working tree dirty"
  # 4. submodule wiring
  [ "$(git -C "$SITE_REPO" config -f .gitmodules --get submodule.slidev.branch)" = "gh-pages" ] \
    || die ".gitmodules submodule.slidev.branch must be gh-pages"
  git -C "$SUBMODULE" ls-remote --exit-code origin gh-pages >/dev/null 2>&1 \
    || die "submodule remote gh-pages unreachable"
  case "$(git -C "$SITE_REPO" submodule status slidev | cut -c1)" in
    '-'|'+'|'U') die "submodule not cleanly initialized (run: git submodule update --init)";;
  esac
  OLDPIN="$(git -C "$SITE_REPO" rev-parse :slidev)"
  # 5. gh-pages repo really on gh-pages
  [ "$(git -C "$GHPAGES_REPO" symbolic-ref --short HEAD)" = "gh-pages" ] \
    || die "$GHPAGES_REPO is not on the gh-pages branch"
  # 6. base-collision guard (B1): slug already on gh-pages at a different base?
  local existing="$GHPAGES_REPO/$SLUG/index.html"
  if [ -f "$existing" ]; then
    if [ -n "$(base_violations "$existing" "/slides/$SLUG/")" ]; then
      [ "$CUTOVER" -eq 1 ] || die "gh-pages /$SLUG/ is built for a DIFFERENT base (legacy s.vedmich.dev). Re-run with --cutover to migrate it to /slides/$SLUG/ (this overwrites the legacy surface)."
      warn "--cutover: will overwrite legacy /$SLUG/ surface and remove its root-index card"
    fi
  fi
  log "preflight OK (oldpin=${OLDPIN:0:9})"
}
```
And change `main()` to call it:
```bash
main() {
  parse_args "$@"
  log "deploy-deck: slug=$SLUG theme=$THEME dry-run=$DRYRUN no-undraft=$NO_UNDRAFT cutover=$CUTOVER"
  preflight
}
```

- [ ] **Step 2: Verify preflight passes clean on the real repos**

Run: `bash -n scripts/deploy-deck.sh && scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --dry-run; echo "exit=$?"`
Expected: preflight runs; because `vv-demo` exists on gh-pages at base `/vv-demo/`, it ABORTS with the `--cutover` message and `exit=1`. (This is the B1 guard firing correctly.)

- [ ] **Step 3: Verify `--cutover` clears the collision**

Run: `scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover --dry-run; echo "exit=$?"`
Expected: `preflight OK (oldpin=…)`, `exit=0`, with the `--cutover` warning.

- [ ] **Step 4: Verify a dirty deck source is caught**

Run:
```bash
echo "x" >> "$THEME_REPO/presentations/vv-demo/slides.md"
scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --cutover --dry-run; echo "exit=$?"
git -C "$THEME_REPO" checkout -- presentations/vv-demo/slides.md   # undo
```
Expected: aborts `theme working tree dirty…`, `exit=1`; then the deck source is restored.

- [ ] **Step 5: Commit**

```bash
git add scripts/deploy-deck.sh
git commit -m "feat(deploy): read-only preflight envelope + base-collision guard (B1)"
```

---

## Task 8: Step 1 — build + base gate

**Files:**
- Modify: `scripts/deploy-deck.sh`

- [ ] **Step 1: Add `step_build` and call it after preflight**

Add to `scripts/deploy-deck.sh`:
```bash
DIST=""   # set by step_build

assert_base() {
  local index="$1"
  [ -f "$index" ] || die "no index.html at $index (build failed?)"
  [ "$(count_root_assets "$index")" -ge 1 ] || die "no root-absolute assets in $index (broken build?)"
  local v; v="$(base_violations "$index" "/slides/$SLUG/")"
  [ -z "$v" ] || die "base check FAILED — assets not under /slides/$SLUG/:"$'\n'"$v"
}

step_build() {
  DIST="$THEME_REPO/presentations/$SLUG/dist"
  # The build ALWAYS runs — even in --dry-run — because the base check is the cheapest catch of
  # the most expensive mistake, and dist/ is gitignored (verified .gitignore:2) so it can't poison
  # the next run's cleanliness preflight. This is the one intentional exception to run()'s skip.
  rm -rf -- "$DIST"
  log "build deck (base /slides/$SLUG/)"
  ( cd "$THEME_REPO" && pnpm exec slidev build "presentations/$SLUG/slides.md" --base "/slides/$SLUG/" ) \
    || die "slidev build failed"
  assert_base "$DIST/index.html"
  [ -f "$DIST/404.html" ] && assert_base "$DIST/404.html" || warn "no 404.html in dist (deep-link fallback)"
  log "build + base gate OK"
}
```
Call it in `main()` after `preflight`:
```bash
  preflight
  step_build
```

- [ ] **Step 2: Verify the build + base gate on vv-demo**

Run: `scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover --dry-run; echo "exit=$?"`
Expected: builds vv-demo, prints `build + base gate OK`, `exit=0`. (Takes ~10-15s for the build.)

- [ ] **Step 3: Verify the dist landed with the right base**

Run: `grep -oE '(src|href)="/slides/vv-demo/[^"]*"' "$THEME_REPO/presentations/vv-demo/dist/index.html" | head -3`
Expected: 1-3 lines all under `/slides/vv-demo/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy-deck.sh
git commit -m "feat(deploy): step 1 build + base-path gate (correct dist path, G5)"
```

---

## Task 9: Step 2 — publish to gh-pages (snapshot + cutover card removal)

**Files:**
- Modify: `scripts/deploy-deck.sh`

- [ ] **Step 1: Add `step_publish_ghpages`**

Add to `scripts/deploy-deck.sh`:
```bash
PUSHED=""   # gh-pages SHA after step 2

step_publish_ghpages() {
  local dest="$GHPAGES_REPO/$SLUG" snap=""
  # snapshot the existing slot for rollback (B1)
  if [ -d "$dest" ]; then
    snap="$(mktemp -d)/snap.tgz"
    run "snapshot existing /$SLUG for rollback" -- \
      sh -c "tar -czf '$snap' -C '$GHPAGES_REPO' '$SLUG'"
    note_rollback "restore gh-pages slot: rm -rf '$dest' && tar -xzf '$snap' -C '$GHPAGES_REPO' && (cd '$GHPAGES_REPO' && git add '$SLUG' && git commit -m 'rollback $SLUG')"
  fi
  # contents-form copy (NEVER nests dist/) — G2
  run "swap dist into /$SLUG slot" -- sh -c "rm -rf -- '$dest'; mkdir -p '$dest'; cp -R '$DIST/.' '$dest/'"
  if [ "$DRYRUN" -eq 0 ]; then
    [ -f "$dest/index.html" ] && [ ! -d "$dest/dist" ] || die "cp shape wrong (nested dist?) at $dest"
  fi
  # cutover: drop the legacy card from the gh-pages root index.html (D-9)
  if [ "$CUTOVER" -eq 1 ] && grep -q "\"\\./$SLUG/\"" "$GHPAGES_REPO/index.html" 2>/dev/null; then
    run "remove legacy /$SLUG card from gh-pages root index.html" -- \
      sh -c "awk 'BEGIN{skip=0} /<a class=\"card\" href=\"\\.\\/$SLUG\\/\">/{skip=1} skip&&/<\\/a>/{skip=0;next} !skip{print}' '$GHPAGES_REPO/index.html' > '$GHPAGES_REPO/index.html.tmp' && mv -- '$GHPAGES_REPO/index.html.tmp' '$GHPAGES_REPO/index.html'"
  fi
  # commit + push (path-specific: slug, plus index.html only when cutover)
  run "stage gh-pages changes" -- sh -c "cd '$GHPAGES_REPO' && git add '$SLUG' $( [ "$CUTOVER" -eq 1 ] && echo index.html )"
  run "commit gh-pages" -- sh -c "cd '$GHPAGES_REPO' && (git diff --cached --quiet || git commit -m 'deploy: $SLUG --base /slides/$SLUG/')"
  run "push gh-pages" -- sh -c "cd '$GHPAGES_REPO' && git push origin gh-pages"
  if [ "$DRYRUN" -eq 0 ]; then
    PUSHED="$(git -C "$GHPAGES_REPO" rev-parse HEAD)"
    note_rollback "revert gh-pages: (cd '$GHPAGES_REPO' && git revert --no-edit $PUSHED && git push origin gh-pages)"
    log "gh-pages published @ ${PUSHED:0:9}"
  fi
}
```
Call in `main()` after `step_build`:
```bash
  step_build
  step_publish_ghpages
```

- [ ] **Step 2: Verify dry-run prints the intended gh-pages mutations without pushing**

Run: `scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover --dry-run; echo "exit=$?"`
Expected: `[dry-run]` lines for snapshot, swap, card removal, stage, commit, push — `exit=0`. Confirm `git -C "$GHPAGES_REPO" status` is still clean afterward (nothing pushed).

- [ ] **Step 3: Verify the awk card-removal on a copy (no real mutation)**

Run:
```bash
cp "$GHPAGES_REPO/index.html" /tmp/idx.html
awk 'BEGIN{skip=0} /<a class="card" href="\.\/vv-demo\/">/{skip=1} skip&&/<\/a>/{skip=0;next} !skip{print}' /tmp/idx.html > /tmp/idx.out
grep -c "vv-demo" /tmp/idx.out; echo "should be 0"
grep -c "slurm-ai-demo" /tmp/idx.out; echo "should be >=1 (other cards intact)"
```
Expected: `0` vv-demo refs, other cards preserved.

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy-deck.sh
git commit -m "feat(deploy): step 2 gh-pages publish — snapshot rollback, cp-nest guard, cutover card removal"
```

---

## Task 10: Step 3 + 4 — submodule bump (drag gate) + whitelist add

**Files:**
- Modify: `scripts/deploy-deck.sh`

- [ ] **Step 1: Add `step_bump_submodule` and `step_whitelist`**

Add to `scripts/deploy-deck.sh`:
```bash
step_bump_submodule() {
  [ "$DRYRUN" -eq 1 ] && { printf '  [dry-run] submodule: fetch + checkout %s + drag-gate\n' "${PUSHED:-<pushed>}"; return 0; }
  run "fetch gh-pages in submodule" -- git -C "$SUBMODULE" fetch origin gh-pages
  run "checkout pushed SHA in submodule" -- git -C "$SUBMODULE" checkout --quiet "$PUSHED"
  # drag-detection GATE — only our slug (+ allowed root files) may differ vs OLDPIN
  if git -C "$SUBMODULE" cat-file -e "$OLDPIN" 2>/dev/null; then
    local drag
    drag="$(git -C "$SUBMODULE" diff --name-only "$OLDPIN" "$PUSHED" | grep -vE "^$SLUG/|^(CNAME|404.html|index.html)\$" || true)"
    [ -z "$drag" ] || die "submodule bump would drag co-tenant changes:"$'\n'"$drag"
  else
    warn "oldpin $OLDPIN not in submodule history (force-push?) — skipping drag check"
  fi
  run "stage submodule pointer" -- git -C "$SITE_REPO" add slidev
  local staged; staged="$(git -C "$SITE_REPO" rev-parse :slidev)"
  [ "$staged" = "$PUSHED" ] || die "staged gitlink ($staged) != pushed gh-pages ($PUSHED)"
  note_rollback "reset submodule pointer: (cd '$SITE_REPO' && git restore --staged slidev && git -C slidev checkout $OLDPIN)"
  log "submodule bumped → ${PUSHED:0:9}"
}

step_whitelist() {
  local yml="$SITE_REPO/.github/workflows/deploy.yml"
  if whitelist_has "$yml" "$SLUG"; then log "whitelist already has $SLUG (idempotent)"; return 0; fi
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] whitelist: add %s to %s\n' "$SLUG" "$yml"; return 0; fi
  run "add $SLUG to CI whitelist" -- sh -c ". '$HERE/lib/deploy-lib.sh'; whitelist_add '$yml' '$SLUG'"
  whitelist_has "$yml" "$SLUG" || die "whitelist_add did not take"
  python3 -c "import yaml; yaml.safe_load(open('$yml'))" || die "deploy.yml no longer parses after whitelist edit"
  log "whitelist updated"
}
```
Call in `main()`:
```bash
  step_publish_ghpages
  step_bump_submodule
  step_whitelist
```

- [ ] **Step 2: Parse-check + dry-run**

Run: `bash -n scripts/deploy-deck.sh && scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover --dry-run; echo "exit=$?"`
Expected: dry-run prints submodule + whitelist intentions, `exit=0`, repos untouched.

- [ ] **Step 3: Commit**

```bash
git add scripts/deploy-deck.sh
git commit -m "feat(deploy): step 3 submodule fetch+checkout+drag-gate (no --merge) + step 4 whitelist add"
```

---

## Task 11: Step 5 — un-draft MDX (skip for `--no-undraft`)

**Files:**
- Modify: `scripts/deploy-deck.sh`

- [ ] **Step 1: Add `step_undraft`**

Add to `scripts/deploy-deck.sh`:
```bash
step_undraft() {
  if [ "$NO_UNDRAFT" -eq 1 ]; then log "step 5 skipped (--no-undraft): no homepage card for $SLUG"; return 0; fi
  local en="$SITE_REPO/src/content/presentations/en/$SLUG.md"
  local ru="$SITE_REPO/src/content/presentations/ru/$SLUG.md"
  # bilingual parity PRECONDITION: both must exist and both be draft:true (CREATE path is out of
  # autopilot scope — author the cards manually first, then re-run; see slides-onboarding.md Step 5)
  { [ -f "$en" ] && [ -f "$ru" ]; } || die "missing MDX card(s) for $SLUG (en/ru). Create both (draft:true) first, or pass --no-undraft."
  grep -q '^draft: true' "$en" && grep -q '^draft: true' "$ru" \
    || { log "both cards already published (idempotent)"; return 0; }
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] un-draft + strip slides: in en/ru %s.md\n' "$SLUG"; return 0; fi
  local t
  for f in "$en" "$ru"; do
    t="$(mktemp)"
    sed -E '/^draft: true$/s/true/false/; /^slides:[[:space:]]*"https:\/\/s\.vedmich\.dev\//d' "$f" > "$t"
    grep -q '^draft: false' "$t" || die "un-draft failed for $f"
    mv -- "$t" "$f"
  done
  note_rollback "re-draft cards: git -C '$SITE_REPO' checkout -- src/content/presentations/{en,ru}/$SLUG.md"
  log "un-drafted en/ru $SLUG (slides: override stripped)"
}
```
Call in `main()` after `step_whitelist`:
```bash
  step_whitelist
  step_undraft
```

- [ ] **Step 2: Verify skip path (vv-demo uses --no-undraft)**

Run: `scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover --dry-run; echo "exit=$?"`
Expected: `step 5 skipped (--no-undraft)…`, `exit=0`.

- [ ] **Step 3: Verify the parity precondition fires for a card-less slug WITHOUT --no-undraft**

Run: `scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --cutover --dry-run; echo "exit=$?"`
Expected: aborts `missing MDX card(s) for vv-demo…`, `exit=1` (vv-demo has no card — correct guard).

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy-deck.sh
git commit -m "feat(deploy): step 5 un-draft with --no-undraft skip + bilingual-parity precondition (B2)"
```

---

## Task 12: Step 6 — CI-equivalent gate, main push, poll, verify, executable rollback

**Files:**
- Modify: `scripts/deploy-deck.sh`

- [ ] **Step 1: Add `step_finalize`**

Add to `scripts/deploy-deck.sh`:
```bash
ci_equiv_gate() {
  log "CI-equivalent gate (Astro build + replicate whitelist cp + base grep)…"
  ( cd "$SITE_REPO" && npm run build ) || die "astro build failed — NOT pushing"
  local sd="$SITE_REPO/dist/slides/$SLUG"
  rm -rf -- "$sd"; mkdir -p "$sd"; cp -R "$SUBMODULE/$SLUG/." "$sd/"
  [ -f "$sd/index.html" ] && [ -f "$sd/404.html" ] || die "submodule copy missing index/404 for $SLUG"
  assert_base "$sd/index.html"
  # the uncommented whitelist for-loop must still be valid bash
  python3 - "$SITE_REPO/.github/workflows/deploy.yml" <<'PY' > /tmp/wl.check.sh || die "cannot extract whitelist run block"
import yaml,sys
d=yaml.safe_load(open(sys.argv[1]))
s=[x for x in d['jobs']['build']['steps'] if x.get('name','').startswith('Copy Slidev')][0]
sys.stdout.write(s['run'])
PY
  bash -n /tmp/wl.check.sh || die "whitelist run-block is not valid bash"
  log "CI-equivalent gate OK"
}

step_finalize() {
  ci_equiv_gate
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] commit+push main, poll Pages, curl /slides/%s/\n' "$SLUG"; return 0; fi
  run "commit site (submodule bump + whitelist)" -- \
    sh -c "cd '$SITE_REPO' && git add slidev .github/workflows/deploy.yml && (git diff --cached --quiet || git commit -m 'deploy(slides): $SLUG → /slides/$SLUG/')"
  local sha; sha="$(git -C "$SITE_REPO" rev-parse HEAD)"
  run "push main" -- git -C "$SITE_REPO" push origin main
  note_rollback "revert site commit: (cd '$SITE_REPO' && git revert --no-edit $sha && git push origin main)"
  # poll Pages keyed on THIS sha (no `timeout`; bounded loop)
  log "waiting for Pages build of $sha…"
  local i=0 st=""
  while [ "$i" -lt 60 ]; do
    st="$(gh run list --repo vedmichv/vedmich.dev --commit "$sha" --json status --jq '.[0].status' 2>/dev/null || echo '')"
    [ "$st" = "completed" ] && break
    i=$((i+1)); sleep 10
  done
  [ "$st" = "completed" ] || warn "Pages run not 'completed' after ~10min (status='$st') — verifying live anyway"
  # live verification — root + a discovered hashed asset (deck 404.html proves deep-link base)
  local code; code="$(curl -s -o /dev/null -w '%{http_code}' "https://vedmich.dev/slides/$SLUG/")"
  if [ "$code" != "200" ]; then
    warn "live root returned $code — auto-reverting"
    git -C "$SITE_REPO" revert --no-edit "$sha" && git -C "$SITE_REPO" push origin main
    die "deploy verification failed (root $code); reverted $sha"
  fi
  local asset; asset="$(curl -s "https://vedmich.dev/slides/$SLUG/" | grep -oE '/slides/'"$SLUG"'/assets/[^"]+\.(js|css)' | head -1)"
  [ -n "$asset" ] && [ "$(curl -s -o /dev/null -w '%{http_code}' "https://vedmich.dev$asset")" = "200" ] \
    || warn "could not confirm a hashed asset 200 (asset='$asset')"
  curl -s "https://vedmich.dev/slides/$SLUG/404.html" | grep -q "/slides/$SLUG/" \
    || warn "deck 404.html base not confirmed (deep-link fallback)"
  log "LIVE OK → https://vedmich.dev/slides/$SLUG/"
}
```
Call in `main()` last:
```bash
  step_undraft
  step_finalize
  log "done."
```

- [ ] **Step 2: Full dry-run rehearsal (end-to-end, mutates nothing)**

Run: `scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover --dry-run; echo "exit=$?"`
Expected: every step prints its intent through `step_finalize`'s `[dry-run]` line, `exit=0`. Confirm all 3 repos clean afterward: `for r in "$THEME_REPO" "$GHPAGES_REPO" "$SITE_REPO"; do git -C "$r" status --porcelain --ignore-submodules=dirty | head -1; done` (theme may show ignored dist only — none in porcelain).

- [ ] **Step 3: shellcheck the finished script**

Run: `command -v shellcheck >/dev/null && shellcheck scripts/deploy-deck.sh scripts/lib/deploy-lib.sh || echo "skip"`
Expected: no error-level findings (fix any), or skip message.

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy-deck.sh
git commit -m "feat(deploy): step 6 CI-equivalent gate + main push + SHA-keyed Pages poll + live verify + auto-revert"
```

---

## Task 13: The `vedmich-dev` skill (+ vault backup)

**Files:**
- Create: `~/.claude/skills/vedmich-dev/SKILL.md`
- Create: `~/.claude/skills/vedmich-dev/references/slides-deploy.md`
- Create: `~/.claude/skills/vedmich-dev/references/architecture.md`

- [ ] **Step 1: Write `SKILL.md` (narrow description, standalone triggers, NOT-FOR lines)**

Create `~/.claude/skills/vedmich-dev/SKILL.md`:
```markdown
---
name: vedmich-dev
description: Publish and manage content on Viktor Vedmich's personal site vedmich.dev — currently deploying slidev-theme-vv decks to vedmich.dev/slides/<slug>/ via the fail-closed autopilot scripts/deploy-deck.sh. Use when the user says "deploy this deck to vedmich.dev", "опубликуй презу на сайт", "publish to /slides", "deploy-deck", or "/vedmich-dev". NOT for authoring decks (use vv-slidev / slurm-slidev), brand mocks (viktor-vedmich-design), or LinkedIn carousels (vv-carousel).
---

# vedmich-dev — personal site content + deploy

Owns publishing to **vedmich.dev**. Today the only implemented capability is **slides deploy**
(brand routing: `slidev-theme-vv` → `vedmich.dev/slides/<slug>/`). Blog posts and speaking events
are documented in the site repo `CLAUDE.md` (`~/Documents/GitHub/vedmich/vedmich.dev/CLAUDE.md`) —
not duplicated here.

## Deploy a deck

Canonical HOW = the script; canonical WHY = `docs/slides-onboarding.md` in the site repo. This skill
does NOT restate the 6 steps (D-10). To publish a `slidev-theme-vv` deck:

```bash
~/Documents/GitHub/vedmich/vedmich.dev/scripts/deploy-deck.sh \
  --slug <slug> --theme slidev-theme-vv [--no-undraft] [--cutover] [--dry-run]
```

Always rehearse with `--dry-run` first (mutates nothing, prints every diff). See
`references/slides-deploy.md` for flags + when to use each, `references/architecture.md` for the
3-repo model and why it's split.

## Routing (single source of truth)

| Theme | Surface | Base | Status |
|-------|---------|------|--------|
| slidev-theme-vv | vedmich.dev/slides/<slug>/ | /slides/<slug>/ | autopilot (this skill) |
| slidev-theme-slurm | s.vedmich.dev (its own Phase 8) | /slidev/<slug>/ | NOT yet wired here (D-8) |
| DKT | dkt-ai.github.io | — | own org, untouched |

## Sync surface

A routing/process change touches: this SKILL.md + references (live + vault backup
`85.20-Claude-Code/skills/vedmich-dev/`); `scripts/deploy-deck.sh` + `docs/slides-onboarding.md`
(site repo only — NOT synced to the skill); the subtractive delegation line in `vv-slidev/SKILL.md`.

## Known issue (out of scope)

`PresentationCard.astro` `displayUrl` is hardcoded `vedmich.dev/slides/${slug}` even for slurm cards
whose deck lives on s.vedmich.dev — flagged, not fixed by the vv-only autopilot.
```

- [ ] **Step 2: Write `references/slides-deploy.md` (flags + pointer, NOT the 6 steps)**

Create `~/.claude/skills/vedmich-dev/references/slides-deploy.md`:
```markdown
# slides-deploy — invoking the autopilot

`scripts/deploy-deck.sh` (in the site repo) publishes a `slidev-theme-vv` deck to
`vedmich.dev/slides/<slug>/`. It is fail-closed: a read-only preflight, then 6 verified steps with
rollback. The full step-by-step lives in the site repo `docs/slides-onboarding.md` (canonical) — do
not duplicate it here.

## Flags

| Flag | When |
|------|------|
| `--slug <slug>` | required — deck dir `presentations/<slug>/` in slidev-theme-vv |
| `--theme slidev-theme-vv` | required — only supported theme (slurm deferred, D-8) |
| `--dry-run` | rehearsal: preflight + build + show every diff; pushes nothing. ALWAYS run first. |
| `--no-undraft` | theme demos (e.g. vv-demo) — reachable by URL, no homepage card (D-7) |
| `--cutover` | the slug is already live at a DIFFERENT base (legacy s.vedmich.dev); overwrite it and drop its gh-pages root card (D-9) |

## Real talk-deck vs theme demo

- **Theme demo (vv-demo):** `--no-undraft`. No MDX card. Lives at `/slides/vv-demo/` by URL only.
- **Real talk (e.g. karpenter-prod):** pre-create both `src/content/presentations/{en,ru}/<slug>.md`
  (draft:true, honest event/city/date) FIRST, then run without `--no-undraft`. The autopilot will
  un-draft both and strip the legacy `slides:` override. It will NOT machine-invent talk metadata.

## Always

1. `--dry-run` first. 2. Read the printed rollback if it aborts. 3. After a real run, click through
`https://vedmich.dev/slides/<slug>/` incl. a deep-link (`/10`) and presenter (`/presenter/`).
```

- [ ] **Step 3: Write `references/architecture.md` (3-repo model + deep-link-safe note)**

Create `~/.claude/skills/vedmich-dev/references/architecture.md`:
```markdown
# Architecture — the 3-repo slides pipeline

```
slidev-theme-vv (sources)  --pnpm build --base /slides/<slug>/-->  vedmichv/slidev:gh-pages (artifacts)
                                                                          |  git submodule (pinned SHA)
                                                                          v
                                                  vedmich/vedmich.dev (Astro; CI cp slidev/<slug> → dist/slides/)
                                                                          v
                                                            vedmich.dev/slides/<slug>/
```

- **Toolchain isolation:** the Astro site never runs `slidev build`. Invariant: `vedmich.dev/package.json`
  must NOT depend on `@slidev/cli` / `vue` / `slidev-theme-*`.
- **Pinned-SHA submodule:** `slidev/` → `vedmichv/slidev:gh-pages`; deck updates are an explicit `git
  add slidev` pointer bump.
- **Whitelist-per-deck:** `deploy.yml` copies only slugs in the `SLIDES_WHITELIST` sentinel line.
- **Two gh-pages checkouts:** the standalone `~/Documents/GitHub/vedmichv/slidev` (push target) and the
  site's `slidev/` submodule (separate `.git/modules/slidev`). The script pushes the first, then
  `fetch`+`checkout <pushed>` in the second.

## Why 3-segment deep-links (/slides/<slug>/N) are SAFE — do not "fix"

The gh-pages **root** `404.html` (2-segment `/seg1/seg2/` redirect) lives ONLY in the gh-pages root and
serves the legacy `s.vedmich.dev` surface. The whitelist copies ONLY `slidev/<slug>` into
`dist/slides/`, so that root 404 is NEVER present on vedmich.dev. GitHub Pages serves the deck's own
per-directory `dist/slides/<slug>/404.html` (Slidev bakes it with the deck base) for deep-link misses,
and the SPA router resolves the slide. **Never copy the gh-pages root 404.html into dist/slides/** —
that would actually break deep-links.
```

- [ ] **Step 4: Mirror to vault + verify in sync**

Run:
```bash
VAULT="$HOME/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills"
mkdir -p "$VAULT/vedmich-dev/references"
cp ~/.claude/skills/vedmich-dev/SKILL.md "$VAULT/vedmich-dev/SKILL.md"
cp ~/.claude/skills/vedmich-dev/references/slides-deploy.md "$VAULT/vedmich-dev/references/slides-deploy.md"
cp ~/.claude/skills/vedmich-dev/references/architecture.md "$VAULT/vedmich-dev/references/architecture.md"
diff -rq ~/.claude/skills/vedmich-dev "$VAULT/vedmich-dev" && echo "in sync"
```
Expected: `in sync`.

- [ ] **Step 5: Commit the vault backup**

```bash
cd "$HOME/Documents/ViktorVedmich"
git add 80-Resources/85-Scripts/85.20-Claude-Code/skills/vedmich-dev/
git commit -m "vault backup: new skill vedmich-dev (slides deploy autopilot wrapper)"
```

---

## Task 14: Subtractive delegation in `vv-slidev` (+ vault backup)

**Files:**
- Modify: `~/.claude/skills/vv-slidev/SKILL.md:76,78` (Tree-1 Build/Deploy lines)

- [ ] **Step 1: Replace the hardcoded build base + deploy pointer with delegation**

In `~/.claude/skills/vv-slidev/SKILL.md`, Tree-1, replace:
```
├─ Build: pnpm exec slidev build presentations/<slug>/slides.md --base /<slug>/   (s.vedmich.dev surface; output → presentations/<slug>/dist/)
├─ Pre-push: pnpm ci:local (see references/authoring-rules.md §Pre-push rule)
└─ Deploy (only if user asks): see references/deployment.md
```
with:
```
├─ Pre-push: pnpm ci:local (see references/authoring-rules.md §Pre-push rule)
└─ Deploy (only if user asks): DELEGATE to skill `vedmich-dev` — it owns base + target.
   Do NOT hardcode --base here. Default surface for vv decks = vedmich.dev/slides/<slug>/
   (skill runs scripts/deploy-deck.sh). Legacy s.vedmich.dev path: references/deployment.md.
```

- [ ] **Step 2: Verify no stale `--base /<slug>/` build instruction remains in Tree-1**

Run: `grep -n "base /<slug>/\|base /slides/<slug>/" ~/.claude/skills/vv-slidev/SKILL.md`
Expected: no Tree-1 build line hardcoding a base (deploy is delegated). Mentions inside the deploy-pointer line are fine.

- [ ] **Step 3: Mirror to vault + commit**

Run:
```bash
VAULT="$HOME/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills"
cp ~/.claude/skills/vv-slidev/SKILL.md "$VAULT/vv-slidev/SKILL.md"
diff -q ~/.claude/skills/vv-slidev/SKILL.md "$VAULT/vv-slidev/SKILL.md" && echo "in sync"
cd "$HOME/Documents/ViktorVedmich"
git add 80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/SKILL.md
git commit -m "vault backup: vv-slidev — delegate deploy to vedmich-dev (subtractive, D-10/B3)"
```
Expected: `in sync` + commit.

---

## Task 15: Acceptance — migrate vv-demo for real

**Files:** none (operational run + the commits the script makes)

- [ ] **Step 1: Final dry-run immediately before the real run**

Run: `cd "$SITE_REPO" && scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover --dry-run; echo "exit=$?"`
Expected: clean end-to-end dry-run, `exit=0`.

- [ ] **Step 2: Real run**

Run: `cd "$SITE_REPO" && scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover`
Expected: builds, pushes gh-pages, bumps submodule, adds whitelist, pushes main, Pages `completed`, `LIVE OK → https://vedmich.dev/slides/vv-demo/`.

- [ ] **Step 3: Assert the 5 acceptance criteria**

Run:
```bash
echo "1) root:"; curl -s -o /dev/null -w '%{http_code}\n' https://vedmich.dev/slides/vv-demo/
echo "2) asset:"; A=$(curl -s https://vedmich.dev/slides/vv-demo/ | grep -oE '/slides/vv-demo/assets/[^"]+\.js' | head -1); curl -s -o /dev/null -w '%{http_code}\n' "https://vedmich.dev$A"
echo "4) not in grid (draft):"; ls "$SITE_REPO/src/content/presentations/en/vv-demo.md" 2>/dev/null && echo "CARD EXISTS (unexpected)" || echo "no card — correct"
echo "5) legacy card gone:"; curl -s https://s.vedmich.dev/ | grep -c 'vv-demo' 
```
Expected: `200`; `200`; `no card — correct`; `0` (legacy landing no longer links vv-demo).

- [ ] **Step 4: Deep-link render check (Playwright, the one browser assertion — criterion 3)**

Run from the site repo:
```bash
cd "$SITE_REPO" && cat > /tmp/deeplink.mjs <<'EOF'
import { chromium } from 'playwright-chromium';
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
await p.goto('https://vedmich.dev/slides/vv-demo/10', { waitUntil: 'networkidle' });
await p.waitForSelector('#slide-content', { timeout: 20000 });
console.log('deep-link slide 10 rendered:', await p.title());
await b.close();
EOF
( cd "$THEME_REPO" && node /tmp/deeplink.mjs )   # run where playwright-chromium is installed
```
Expected: `deep-link slide 10 rendered: …` (no timeout).

- [ ] **Step 5: Update the deployment memory + commit the spec/plan status**

Update the MEMORY.md vedmich.dev entry to note vv-demo now lives at `vedmich.dev/slides/vv-demo/` (autopilot `deploy-deck.sh`), and mark the spec/plan done.
```bash
cd "$SITE_REPO" && git add docs/superpowers/ && git commit -m "docs: mark slides-deploy plan executed (vv-demo live at /slides/vv-demo/)" || echo "nothing to commit"
```

---

## Self-review notes

- **Spec coverage:** B1→preflight#6+snapshot+cutover (T7/T9); B2→step_undraft parity precondition + `--no-undraft` (T11); B3→`--theme` vv-only guard (T6) + subtractive delegation (T14); B4→canonical note + step-6 reconcile (T5). G1 shell contract (T6). G2 cp/rm safety (T6 validate_slug, T9 contents-form+shape). G3 submodule fetch+checkout+drag-gate (T10). G4 CI-equiv gate (T12). G5 base path corrected to `presentations/<slug>/dist/` (T8). G6 scoped cleanliness (T7). G7 sentinel whitelist (T3/T4/T10). G8 ordering + executable rollback (T9/T12). G9 deep-link-safe note (T13 architecture.md). G10 dry-run trustworthy + tests (T1-3, full dry-run T12); full sandbox explicitly deferred. G11 SKILL.md frontmatter + no stub modules (T13).
- **Acceptance:** the 5 assertions + Playwright deep-link map 1:1 to the spec's revised acceptance section.
- **Type/name consistency:** `validate_slug`, `count_root_assets`, `base_violations`, `whitelist_add`, `whitelist_has` are defined in T1-3 and used by the same names in T6-12. `OLDPIN`/`PUSHED`/`DIST` set before use.
