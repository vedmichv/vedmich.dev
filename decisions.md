# Site review decisions

- Preserve Astro static output, bilingual routes, Deep Signal tokens, and the prebuilt Slidev boundary.
- Add no dependencies or framework migrations in this review.
- Preserve the intentional public-but-unlisted blog draft model; drafts are not confidential.
- Make AGENTS.md the canonical concise project instructions; keep detailed runbooks in docs.
- Keep repository artifacts in English and user-facing conversation in Russian.
- Separate source/build/browser evidence from production acceptance. Do not push or deploy as part of this review.
- Keep Node 22 aligned with existing CI. Defer the Astro/MDX major migration and
  dependency-advisory remediation to a focused compatibility change.
- Use Paseo's repository-level schema and lifecycle scripts. Leave provider,
  credentials, and desktop state machine-local. No teardown hook is necessary.
- Worktree setup installs existing lockfile dependencies, Astro types, and the
  matching Chromium. Deck artifacts remain an explicit pinned-submodule task.
- Refresh screenshot baselines only after reproducing historical failures on the
  original commit and inspecting images; remove header overlays from prose captures.
