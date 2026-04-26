---
name: vv-blog-from-vault
description: |
  Generate and publish Viktor Vedmich's Deep Signal brand blog posts at vedmich.dev — grounded in the Obsidian vault (QMD) and Claude Code session history (recall + episodic-memory). Produces EN + RU markdown files in src/content/blog/{en,ru}/ with Zod-valid frontmatter (title, description, date, tags, optional author/reading_time/cover_image), optional inline visuals (reuses vault carousel PNGs first per D-39; delegates to mermaid-pro / excalidraw / art / viktor-vedmich-design), companion-link suggestions (talks in 44-Speaking, carousels in 45.20-Brand-Kit, podcast episodes in 32-DKT + 15.10-AWS-RU-Podcast), and a verify+push pipeline (npm run build + git commit "Post: <title>" plain with NO Co-Authored-By per CLAUDE.md + git push origin main + gh run list). After the skill finishes, the user verifies the live post manually (browser visit) on vedmich.dev — same as site-wide convention. Hard-excludes 10-AWS/11-Active-Clients/, 10-AWS/14-Tips-AWS-Internal/, 10-AWS/16-Amazon-Employer/ from every vault scan. Use when user says: "write a blog post", "new post about X", "новый пост", "новая статья", "статья из vault", "пост из доклада", "publish post", "deploy post", "blog from vault". NOT for: LinkedIn carousels (use vv-carousel), Slidev presentations (use separate slidev repos), confidential AWS client content.
---

# VV Blog From Vault

Generate and publish Viktor Vedmich's Deep Signal brand blog posts — grounded in vault + session history.

## Context

- **Viktor**: Senior AWS Solutions Architect in Germany. Audience for vedmich.dev blog: other senior engineers working on Kubernetes, AWS, AI-for-DevOps.
- **Voice**: tech-expert from first person. "I've seen this fail in production" over "Some teams find…". Never neutral tutorial, never punchy-opinionated-for-its-own-sake. See `references/voice-guide.md`.
- **Publishing**: git push to main. GH Actions auto-deploys in ~2 min. CLAUDE.md §"Adding a new blog post" is authoritative. Commit template is `Post: <title>` with NO Co-Authored-By trailer (content commits differ from code commits).
- **Post-deploy verification**: manual — user visits the live URL on vedmich.dev (or runs separate visual checks) after the skill finishes. The skill itself does NOT automate post-deploy verification. This matches CLAUDE.md "Deployment monitoring" pattern (Actions log + manual live check).
- **Bilingual**: every post ships EN + RU in the same commit. RU is a full body translation per D-29, not frontmatter-only. Tech terms stay English per D-30. See `references/translation-rules.md`.
- **Confidential vault exclusion**: vault search MUST hard-exclude `10-AWS/11-Active-Clients/`, `10-AWS/14-Tips-AWS-Internal/`, `10-AWS/16-Amazon-Employer/`. Enforced in `scripts/vault-search.py`.
- **Zero JS**: blog posts must not import client-side JS libs. CSS/SVG animations only, and only if a section genuinely needs one. See `references/visuals-routing.md`.

## Where everything lives

Blog markdown + assets live in the SITE repo (`~/Documents/GitHub/vedmich/vedmich.dev/`):

```
src/content/blog/{en,ru}/YYYY-MM-DD-slug.md     ← posts (both locales, same commit)
public/blog-assets/YYYY-MM-DD-slug/*.png        ← inline images (root-absolute paths in markdown)
src/content.config.ts                           ← Zod schema (authoritative)
src/i18n/{en,ru}.json                           ← UI strings (blog.title, blog.min_read, etc.)
```

Source material lives in the VAULT (`~/Documents/ViktorVedmich/`):

```
40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/*/out/*.png  ← reusable 1080×1350 PNG slides
40-Content/44-Speaking/44.20-Talk-Materials/*.md                             ← talk notes (stats, technical claims)
40-Content/44-Speaking/44.10-CFPs/15.31-Talks-Materials/*.md                 ← CFP + chalk-talk notes
20-Calendar/25-diary/25.70-Claude-Summaries/YYYY-MM-DD.md                    ← session summaries (opinion posts)
30-Projects/33-Book-Kubernetes/                                              ← book chapters (K8s topics)
30-Projects/37-AI-DevOps-course/                                             ← AI/MCP/Claude Code material
70-PKM/73-KB-Tech/                                                           ← curated tech KB
70-PKM/77-Connections/YYYY/                                                  ← topical notes
```

**Never read** (confidential — enforced in `scripts/vault-search.py` post-filter):
- `10-AWS/11-Active-Clients/`
- `10-AWS/14-Tips-AWS-Internal/`
- `10-AWS/16-Amazon-Employer/`

## Workflow

See `workflows/new-post.md` for the 9-step pipeline: clarify topic → vault search → session recall → companion check → draft EN → translate RU → visuals audit → related section → verify+push.

See `workflows/update-post.md` for the 5-step edit flow: identify post → load EN+RU → apply edits → verify build → push.

## Hard rules

| Rule | Why |
|------|-----|
| Never fabricate stats/claims | Must come from vault (QMD) or session-history (recall + episodic-memory). Blog = Viktor's credibility. |
| Exclude confidential vault paths | `10-AWS/11-Active-Clients/*`, `10-AWS/14-Tips-AWS-Internal/*`, `10-AWS/16-Amazon-Employer/*` — CLAUDE.md + D-05. Enforced in `scripts/vault-search.py`. |
| Voice: tech-expert, first person | "I've seen this fail" / "На клиентах я видел" — D-31. See `references/voice-guide.md`. |
| Tech terms stay English in RU | `Karpenter`, `NodePool`, `MCP server`, `Cluster Autoscaler`, `YAML`, `kubectl`, flag names — D-30. See `references/translation-rules.md`. |
| RU body is a full translation, not frontmatter-only | Blog prose is meant to be read — D-29. |
| Reuse vault visuals FIRST | Check `45.20-Brand-Kit/carousel-templates/*/out/*.png` before generating new — D-39. See `references/visuals-routing.md`. |
| Zero JS in posts | Only CSS/SVG animations if any (deferred per D-40) — CLAUDE.md. |
| Commit: `Post: <title>`, NO Co-Authored-By | Content commits differ from code — CLAUDE.md + D-43. Enforced in `scripts/deploy-post.sh`. |
| Image paths root-absolute `/blog-assets/...` | Relative paths break at `/ru/blog/...` — Pitfall 5. Grep gate in `deploy-post.sh`. |
| Both locales in same commit | Bilingual constraint — CLAUDE.md. |
| Frontmatter tags required | Schema tightened in Wave 1 — at least 1 tag per post. See `references/frontmatter-schema.md`. |
| RU posts do NOT need `author:` override | Wave 1 Task 3 RU slug page translates schema-default "Viktor Vedmich" to "Виктор Ведмич" at render time — leave `author:` out of RU frontmatter. See `references/frontmatter-schema.md`. |

## Delegation targets

This skill delegates rather than duplicating. Reference targets by name in workflow steps — description-trigger match activates them:

- **`mermaid-pro`** — flowcharts, sequence diagrams, architecture (use for Karpenter consolidation loop, MCP client↔server diagram)
- **`excalidraw`** — hand-sketched whiteboard style
- **`art`** — AI image generation with optimized prompt (NanoBanana / GPTImage)
- **`viktor-vedmich-design`** — brand-consistent visuals using the Deep Signal UI kit
- **`recall`** — session temporal/topic/graph modes (most-used: topic mode for manifests-by-hand post)
- **`sync-claude-sessions`** — not invoked live; read as the source of `20-Calendar/25-diary/25.70-Claude-Summaries/*.md` session exports

MCP tools invoked directly (not via another skill):
- `mcp__qmd__query`, `mcp__qmd__search`, `mcp__qmd__vsearch`, `mcp__qmd__get`, `mcp__qmd__multi-get`
- `mcp__plugin_episodic-memory_episodic-memory__search`

**Not delegated:** screenshot verification. After the skill finishes (push to main) and GH Actions deploys (~60-90s), the user manually verifies the deployed post at vedmich.dev. This matches the CLAUDE.md "Deployment monitoring" convention and keeps deploy-post.sh simple.

Do NOT use `Skill()` syntax — that is agent orchestration, not user workflow.

## References

Read these as needed — do not load all five by default:

- **`references/voice-guide.md`** — voice rules (D-31) + ban list (anti-AI vocabulary)
- **`references/translation-rules.md`** — EN→RU rules (D-30) with examples
- **`references/frontmatter-schema.md`** — full Zod schema from `src/content.config.ts` (post-Wave 1) + RU author-field guidance (no override needed) + examples per D-06 post type
- **`references/visuals-routing.md`** — Priority 0 (reuse carousel PNGs) / Priority 1 (route to mermaid-pro / excalidraw / art / viktor-vedmich-design) decision tree
- **`references/companion-sources.md`** — vault map: carousels at 45.20, talks at 44.20, podcast at 32-DKT + 15.10

Scripts at `scripts/`:
- **`scripts/vault-search.py`** — QMD wrapper with confidential-path post-filter
- **`scripts/session-recall.py`** — recall delegation + episodic-memory MCP + diary-grep fallback
- **`scripts/deploy-post.sh`** — verify + commit + push with CLAUDE.md Post: template (no automated post-deploy verification — user manually checks live site per site-wide convention)

Workflows at `workflows/`:
- **`workflows/new-post.md`** — 9-step new-post orchestration
- **`workflows/update-post.md`** — 5-step edit flow
