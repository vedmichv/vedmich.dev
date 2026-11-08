# Site review plan

1. [x] Inspect current source, content, deployment, instructions, and test coverage.
2. [x] Establish build and test baselines; inspect desktop/mobile and localized routes.
3. [x] Fix verified defects with focused regression coverage, without adding dependencies.
4. [x] Configure Paseo project scripts and automatic worktree setup; verify in a fresh worktree.
5. [x] Add repository-specific AGENTS.md and align developer documentation.
6. [x] Run final checks, record findings and limitations, and commit logical changes locally.

Scope: local review and implementation. Production publishing requires a separate request.

# Content proofreading plan (2026-11-08)

Proofread all site content with the updated writing skills from `vedmichv/skills`
(`en-work-writing` for English, `ru-tech-writing` for Russian), installed globally
as symlinks into `~/.claude/skills` and `~/.agents/skills`.

1. [x] Fast-forward `main` to `origin/main`; install both skills from the skills repo.
2. [x] Proofread blog posts (EN EDIT L1, RU edit) pair by pair, including formatting:
       frontmatter text, heading levels, alt text, iframe titles, EN/RU parity.
3. [x] Proofread talk pages, deck cards, and UI strings in `src/i18n/`.
4. [x] Review every diff, run both skill scanners, build, and smoke-test.
5. [x] Commit one logical change per post pair or content group; record a report in
       `docs/reviews/`. Facts are not changed; factual doubts go to Viktor.

Scope: local commits only. Pushing `main` deploys and needs separate authorization.
