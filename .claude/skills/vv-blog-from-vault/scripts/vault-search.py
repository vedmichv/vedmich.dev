#!/usr/bin/env python3
"""Vault search wrapper for vv-blog-from-vault skill.

Uses QMD MCP (via CLI fallback) for hybrid lex+vec search, then post-filters
results to exclude confidential paths per CLAUDE.md and Phase 9 D-05.

Usage:
    vault-search.py <topic> [--limit N] [--collection vault|sessions]
    vault-search.py --check PATH         # policy check: is PATH allowed?
    vault-search.py --list-excluded       # print the confidential prefix list

Examples:
    vault-search.py "karpenter right sizing"
    vault-search.py "mcp protocol chalk talk" --collection vault --limit 10
    vault-search.py --check "10-AWS/11-Active-Clients/acme/foo.md"  # prints "DENIED"
    vault-search.py --check "40-Content/44-Speaking/foo.md"           # prints "ALLOWED"

Confidential exclusion policy (CLAUDE.md + Phase 9 D-05):
    - 10-AWS/11-Active-Clients/
    - 10-AWS/14-Tips-AWS-Internal/
    - 10-AWS/16-Amazon-Employer/
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

CONFIDENTIAL_PREFIXES = (
    "10-AWS/11-Active-Clients/",
    "10-AWS/14-Tips-AWS-Internal/",
    "10-AWS/16-Amazon-Employer/",
)

VAULT_ROOT = Path.home() / "Documents" / "ViktorVedmich"


def allowed(path: str) -> bool:
    """Return True if path is not inside any confidential prefix.

    Checks both bare prefix and '/<prefix>' substring to catch absolute paths.
    """
    return not any(path.startswith(p) or f"/{p}" in path for p in CONFIDENTIAL_PREFIXES)


def qmd_query(topic: str, limit: int = 10, collection: str = "vault") -> list[dict]:
    """Invoke qmd CLI with hybrid lex+vec query. Returns list of result dicts.

    Prefers the CLI because MCP tool invocation from a Python subprocess requires
    specific MCP host wiring. Workflow-layer (new-post.md) can also call
    `mcp__qmd__query` directly from the Claude agent.
    """
    try:
        result = subprocess.run(
            ["qmd", "query", topic, "--limit", str(limit), "--json"],
            capture_output=True,
            text=True,
            check=False,
            timeout=30,
        )
        if result.returncode != 0:
            print(f"qmd CLI failed: {result.stderr}", file=sys.stderr)
            return []
        return json.loads(result.stdout or "[]")
    except FileNotFoundError:
        print("qmd CLI not found on PATH. Install via `npm i -g qmd` or invoke mcp__qmd__query directly.", file=sys.stderr)
        return []
    except json.JSONDecodeError:
        print("qmd CLI returned non-JSON output.", file=sys.stderr)
        return []
    except subprocess.TimeoutExpired:
        print("qmd CLI timed out after 30s.", file=sys.stderr)
        return []


def filter_confidential(results: list[dict]) -> list[dict]:
    """Drop any result whose `path` field is inside a confidential prefix."""
    return [r for r in results if allowed(r.get("path", ""))]


def main() -> int:
    ap = argparse.ArgumentParser(description="Vault search with confidential-path post-filter")
    ap.add_argument("topic", nargs="?", help="search topic")
    ap.add_argument("--limit", type=int, default=10, help="max results before filtering")
    ap.add_argument("--collection", default="vault", choices=("vault", "sessions"), help="QMD collection")
    ap.add_argument("--check", metavar="PATH", help="policy check: is PATH allowed?")
    ap.add_argument("--list-excluded", action="store_true", help="print confidential prefixes")
    args = ap.parse_args()

    if args.list_excluded:
        for p in CONFIDENTIAL_PREFIXES:
            print(p)
        return 0

    if args.check is not None:
        verdict = "ALLOWED" if allowed(args.check) else "DENIED"
        print(verdict)
        return 0 if verdict == "ALLOWED" else 1

    if not args.topic:
        ap.error("topic is required unless --check or --list-excluded is used")

    raw = qmd_query(args.topic, limit=args.limit, collection=args.collection)
    filtered = filter_confidential(raw)
    # Emit as JSON lines so workflow can pipe to jq / other tools
    for r in filtered:
        print(json.dumps(r, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
