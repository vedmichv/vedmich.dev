# STATE.md

**Current milestone:** v0.4 — Reference Design Audit
**Current phase:** 1 (Header)
**Status:** Ready for `/gsd-plan-phase 1`
**Last updated:** 2026-04-19

## Active context

- Hero phase already shipped ahead of GSD setup (commit `ac3a8fd`). Do NOT include Hero in current milestone — it's done.
- Reference artifact: `/Users/viktor/Downloads/vedmich.html` (1.2MB). Extracted text: `ref-content.json`. Visual: `reference-1440-full.png`.
- Working tree has uncommitted changes in `.design-handoff/`, `public/favicon.svg`, `.mcp.json` — these will be touched naturally by Phase 7 (logo refresh). Leave alone for now.

## Pending todos

- [ ] Phase 1: Header rewrite
- [ ] Phase 2: Blog × 3 posts
- [ ] Phase 3: Speaking → arrows
- [ ] Phase 4: Podcasts monogram badges
- [ ] Phase 5: Book PACKT + emboss
- [ ] Phase 6: Contact letter badges
- [ ] Phase 7: Logo + favicon refresh
- [ ] Phase 8: About cleanup

## Blockers

None.

## Notes

- User prefers sequential execution with visual verification on live after each phase.
- Playwright-cli skill is active. `playwright-cli attach --extension` requires Playwright MCP Bridge extension installed in Chrome (not done yet). For now use `playwright-cli open https://vedmich.dev/...` for fresh headed Chrome.
- `gh run list --branch main --limit 3` shows deploy status; typical deploy ~60-90s after push.
