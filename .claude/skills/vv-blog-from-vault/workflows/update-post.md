# Workflow — update post

5 sequential steps. Use for edits, typo fixes, additional sections, or visual additions to an EXISTING post.

## Step 1 — Identify post

Ask (or parse from user input): "which post to update". Accept slug (`2026-03-20-karpenter-right-sizing`) or title (partial match works — grep `src/content/blog/en/*.md` for the frontmatter title).

## Step 2 — Load EN + RU

Read both locale files:
- `src/content/blog/en/{slug}.md`
- `src/content/blog/ru/{slug}.md`

Display a short diff-intent summary to the user: what's changing.

## Step 3 — Apply edits

| Edit kind | Action |
|-----------|--------|
| Typo / small fix | Edit in both locales, one commit |
| New section | Draft in EN, then translate to RU via `references/translation-rules.md` |
| New visual | Run Step 7 from `new-post.md` (reuse-first, then delegate) |
| Frontmatter tweak (e.g. new tag) | Edit both locales; tags must match between EN and RU |
| Retract / mark draft | Set `draft: true` in both files. Do NOT delete — preserve URL history; set draft and push |

Never update one locale without the other — bilingual constraint.

## Step 4 — Verify build

`npm run build` must exit 0.

If the edit touched images, also verify `scripts/deploy-post.sh`'s relative-path grep gate:

```bash
grep -rnE '\]\(blog-assets/' src/content/blog/
```

Must return nothing.

## Step 5 — Push

```bash
git add src/content/blog/en/{slug}.md src/content/blog/ru/{slug}.md
git commit -m "Post: Update <title> — <reason>"
git push origin main
```

NO Co-Authored-By trailer (content commit, per CLAUDE.md / D-43).

**Manual post-deploy verification (user performs):** after GH Actions finishes (~60-90s), the user visits the live URL to verify the update rendered correctly. This workflow does NOT automate post-deploy checks — matches CLAUDE.md "Deployment monitoring" convention.

Examples of the `<reason>` suffix:
- `Post: Update Karpenter post — fix trap-2 race-condition explanation`
- `Post: Update MCP post — add AWS Documentation MCP example`
- `Post: Update manifests post — add concession for large platforms`
