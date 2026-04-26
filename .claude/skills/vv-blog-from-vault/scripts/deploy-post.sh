#!/usr/bin/env bash
# deploy-post.sh — verify + commit + push a new blog post.
# CLAUDE.md publishing workflow (§ "Adding a new blog post") is authoritative.
# Commit message template is "Post: <title>" — NO Co-Authored-By trailer for content.
#
# This script does NOT automate post-deploy verification. After the script pushes
# to main and GH Actions finishes (~60-90s), the user manually verifies the deployed
# post by visiting the live vedmich.dev URL in a browser. This matches the CLAUDE.md
# "Deployment monitoring" convention (Actions log + manual live check) and keeps this
# script simple with no external tool dependencies.
#
# Usage:
#   deploy-post.sh <slug> "<title>"
#
# Example:
#   deploy-post.sh 2026-03-20-karpenter-right-sizing "Karpenter in production: right-sizing at scale"
#
# Preconditions:
#   - src/content/blog/en/<slug>.md exists
#   - src/content/blog/ru/<slug>.md exists
#   - Optional: public/blog-assets/<slug>/ exists if the post has inline images
#   - Working tree is otherwise clean (no unrelated staged changes)

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <slug> \"<title>\"" >&2
  exit 2
fi

SLUG="$1"
TITLE="$2"

EN_FILE="src/content/blog/en/${SLUG}.md"
RU_FILE="src/content/blog/ru/${SLUG}.md"
ASSETS_DIR="public/blog-assets/${SLUG}"

# 1. Both locale files must exist (bilingual constraint — CLAUDE.md)
if [ ! -f "$EN_FILE" ]; then
  echo "ERROR: EN file missing: $EN_FILE" >&2
  exit 1
fi
if [ ! -f "$RU_FILE" ]; then
  echo "ERROR: RU file missing: $RU_FILE" >&2
  exit 1
fi

# 2. Grep gate: no relative blog-assets/ paths in any blog markdown
#    (Pitfall 5 — relative paths break at /ru/blog/<slug>)
if grep -rnE '\]\(blog-assets/' src/content/blog/ 2>/dev/null; then
  echo "ERROR: relative blog-assets path(s) found. Use /blog-assets/... (root-absolute)." >&2
  exit 1
fi

# 3. Astro build must succeed (Zod schema + route compile + markdown pipeline)
echo "Running npm run build..."
npm run build

# 4. Stage content files (+ assets if present)
git add "$EN_FILE" "$RU_FILE"
if [ -d "$ASSETS_DIR" ]; then
  git add "$ASSETS_DIR"
fi

# 5. Commit with CLAUDE.md template — NO Co-Authored-By trailer for content
git commit -m "Post: ${TITLE}"

# 6. Push to main (auto-deploys via GH Actions in ~60-90s)
git push origin main

# 7. Report deploy status
echo ""
echo "Commit pushed. GH Actions deploy status:"
gh run list --branch main --limit 3 || echo "(gh CLI unavailable — check https://github.com/vedmichv/vedmich.dev/actions manually)"

echo ""
echo "Live URLs (verify manually in browser after deploy finishes ~60-90s):"
echo "  EN: https://vedmich.dev/en/blog/${SLUG}"
echo "  RU: https://vedmich.dev/ru/blog/${SLUG}"
echo ""
echo "(Manual verification: visit live URLs in browser after GH Actions completes.)"
