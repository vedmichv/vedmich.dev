#!/usr/bin/env python3
"""Session recall wrapper for vv-blog-from-vault skill.

For a topic, aggregates experience grounding from three sources (best to worst):
  1. `recall` skill (topic mode) — delegated at workflow layer (not called here)
  2. `mcp__plugin_episodic-memory_episodic-memory__search` — called at workflow layer
  3. Diary grep over ~/Documents/ViktorVedmich/20-Calendar/25-diary/25.70-Claude-Summaries/*.md

This script is the Tier-3 fallback. Workflows should prefer `recall` and the MCP
episodic-memory tool first; this script guarantees we always have SOMETHING.

Usage:
    session-recall.py <topic> [--since YYYY-MM-DD] [--limit N]

Examples:
    session-recall.py "kubernetes manifests"
    session-recall.py "mcp server" --since 2026-04-01 --limit 20
"""

import argparse
import re
import sys
from pathlib import Path

DIARY_DIR = Path.home() / "Documents" / "ViktorVedmich" / "20-Calendar" / "25-diary" / "25.70-Claude-Summaries"


def grep_diary(topic: str, since: str | None = None, limit: int = 10) -> list[tuple[str, str]]:
    """Return a list of (diary_path, matching_line) tuples for topic matches.

    Case-insensitive substring match. Honors `--since` YYYY-MM-DD floor based on filename.
    """
    if not DIARY_DIR.is_dir():
        print(f"Diary dir not found: {DIARY_DIR}", file=sys.stderr)
        return []

    needle = topic.lower()
    hits: list[tuple[str, str]] = []
    since_str = since or ""

    for md in sorted(DIARY_DIR.glob("*.md")):
        if since_str and md.stem < since_str:
            continue
        try:
            for line in md.read_text(encoding="utf-8", errors="ignore").splitlines():
                if needle in line.lower():
                    hits.append((str(md), line.strip()))
                    if len(hits) >= limit:
                        return hits
        except OSError:
            continue
    return hits


def main() -> int:
    ap = argparse.ArgumentParser(description="Session recall fallback — diary grep")
    ap.add_argument("topic", help="search topic")
    ap.add_argument("--since", help="YYYY-MM-DD floor (inclusive)")
    ap.add_argument("--limit", type=int, default=10)
    args = ap.parse_args()

    hits = grep_diary(args.topic, since=args.since, limit=args.limit)
    if not hits:
        print(f"No diary matches for: {args.topic}", file=sys.stderr)
        return 1

    for path, line in hits:
        print(f"{path}: {line}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
