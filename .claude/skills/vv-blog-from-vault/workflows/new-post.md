# Workflow — new post

9 sequential steps. Pause between steps to confirm with the user unless they've said "just ship it."

## Step 1 — Clarify topic + slug + companions

Ask the user (in Russian if they started in Russian):

1. Topic (e.g. "karpenter right-sizing")
2. Slug — must be kebab-case and date-prefixed: `YYYY-MM-DD-topic`. Example: `2026-03-20-karpenter-right-sizing`.
3. Word-count target — propose from `references/voice-guide.md` per-post register notes (D-06), let the user tweak.
4. Any specific sources to prioritize? (vault paths, talk IDs, diary date ranges)

## Step 2 — Vault search (QMD + confidential filter)

Use `mcp__qmd__query` with a 2-query pattern (lex + vec). Prioritize these source dirs in order:

1. `40-Content/44-Speaking/44.20-Talk-Materials/` — talk notes, stats, technical claims
2. `40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/<slug>/` — carousels (companion sources)
3. `30-Projects/33-Book-Kubernetes/` — book chapters (if K8s topic)
4. `70-PKM/73-KB-Tech/` — curated tech KB
5. `20-Calendar/25-diary/25.70-Claude-Summaries/*.md` — session summaries (opinion posts)
6. `30-Projects/37-AI-DevOps-course/` — AI/MCP/Claude Code material

Wrap with `scripts/vault-search.py "<topic>"` which applies the confidential post-filter automatically. Alternatively call `mcp__qmd__query` directly and then filter results via `scripts/vault-search.py --check PATH` per result path.

Present top 5 survivors. Operator selects 2-3 to read fully via `mcp__qmd__get` or `qmd get <path>`.

If nothing credible surfaces, STOP and either ask the user or suggest reframing. Do NOT fabricate.

## Step 3 — Session history (recall)

Delegate to the `recall` skill in topic mode. Natural-language invocation: "recall <topic>".

For the manifests-by-hand post specifically — primary grounding is `recall` (no vault note exists per D-04). If `recall` yields fewer than 3 distinct grounded experiences, fall back to `scripts/session-recall.py "<topic>"` (diary grep) OR halt with AskUserQuestion for manual input.

Extract: quotes, decisions, concrete client reactions (strip identifying detail before quoting).

## Step 4 — Companion link check

Per `references/companion-sources.md`, scan for:

- Carousel at `45.20-Brand-Kit/carousel-templates/<topic-match>/`
- Talk at `44-Speaking/44.20-Talk-Materials/` or `44-Speaking/44.10-CFPs/15.31-Talks-Materials/`
- Podcast episode via `qmd search "<topic>" --collection vault` filtered to DKT / AWS-RU dirs

If a companion exists, plan to include it in a "Related" section at the END of the post (D-09).

## Step 5 — Draft generation (EN)

Apply `references/voice-guide.md` (voice D-31) + `references/frontmatter-schema.md` (frontmatter — crucially: omit `author:` field, see schema note) + D-06 word counts.

- Karpenter: ~1500-2500 words, stats lede ("Salesforce runs Karpenter on 1,000+ clusters. 70% cluster-cost cut.") + 3 traps (speed / race / churn from carousel slides c03/c04/c05) + 4-step rollout (slide c06) + heuristic close
- MCP: ~800-1200 words, one-sentence definitions + client↔server explanation + 3-4 concrete examples (AWS Knowledge MCP vs AWS Documentation MCP)
- Manifests: ~700-1000 words, punchy lede + 3-4 reasons with nuance + one concession + practical heuristic

Write to `src/content/blog/en/{slug}.md` with valid frontmatter (validates against the tightened schema). Do NOT set `author:` — the Latin default is correct for EN.

## Step 6 — Translate (RU)

Apply `references/translation-rules.md` — tech terms English, prose natural Russian, code blocks identical. CRUCIALLY: do NOT set `author: "Виктор Ведмич"` in RU frontmatter — the RU slug page's locale-aware `authorDisplay` render (Wave 1 Task 3) translates the schema-default Latin "Viktor Vedmich" to Cyrillic at render time automatically.

Write to `src/content/blog/ru/{slug}.md`. Validation: `diff <(grep -n '^```' en.md) <(grep -n '^```' ru.md)` — code fence positions should be identical (same number of code blocks at same relative positions).

## Step 7 — Visuals audit + routing

Per `references/visuals-routing.md`:

- **Priority 0 — Reuse first**: check carousel PNGs at `45.20-Brand-Kit/carousel-templates/<slug>/out/`. If a slide fits, copy to `public/blog-assets/{slug}/<descriptive-kebab-name>.png` (rename from raw `c0X-...png`).
- **Priority 1 — Delegate**: only if Priority 0 yielded nothing. Route per the decision table (mermaid-pro / excalidraw / art / viktor-vedmich-design).

Every inline image reference in markdown MUST use root-absolute path `/blog-assets/{slug}/file.png`.

## Step 8 — Related section

Only if a companion exists (from Step 4). Append at end-of-post per D-09. See `references/companion-sources.md` § "Placement rule" for the exact format.

## Step 9 — Verify + push

Run `scripts/deploy-post.sh <slug> "<title>"`:

1. Both locale files exist check
2. Relative-image-path grep gate
3. `npm run build` (Zod validates frontmatter; remark computes reading_time; routes compile)
4. `git add` EN + RU + `public/blog-assets/{slug}/` (if present)
5. `git commit -m "Post: <title>"` — NO Co-Authored-By trailer (D-43)
6. `git push origin main`
7. `gh run list --branch main --limit 3` to confirm GH Actions started

Report live URLs: `https://vedmich.dev/en/blog/{slug}`, `https://vedmich.dev/ru/blog/{slug}`.

Deploy latency: ~60-90 seconds typically.

**Manual post-deploy verification (user performs, not the skill):** after GH Actions finishes, the user visits the live URL in a browser to verify the post rendered correctly. This matches CLAUDE.md "Deployment monitoring" convention — deploy-post.sh itself does NOT automate post-deploy checks, keeping the script simple.
