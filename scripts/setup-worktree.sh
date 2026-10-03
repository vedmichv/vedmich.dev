#!/usr/bin/env bash
# Prepare only this checkout. Never copy dependencies, credentials, or .env files.
set -euo pipefail

cd "$(dirname "$0")/.."

command -v node >/dev/null || { echo "Node.js 22.6+ is required (CI uses Node 22)." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm is required." >&2; exit 1; }
node --input-type=module -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 6)) {
    console.error("Node.js 22.6+ is required; CI uses Node 22.");
    process.exit(1);
  }
'

# npm ci uses the committed lockfile and fails on a manifest mismatch.
npm ci --no-audit --no-fund
npm run astro -- sync
if [ "${SKIP_BROWSER_INSTALL:-0}" != 1 ]; then
  npx --no-install playwright install chromium
fi

printf '%s\n' 'Worktree ready. Run npm run dev, npm run test:unit, or npm run build.'
printf '%s\n' 'For deck previews: git submodule update --init --checkout slidev'
printf '%s\n' 'Browser download can be skipped with SKIP_BROWSER_INSTALL=1.'
