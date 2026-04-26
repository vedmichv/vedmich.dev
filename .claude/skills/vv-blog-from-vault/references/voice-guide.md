# Voice Guide — locked

**Do not deviate.** Voice is **tech-expert from first person** (CONTEXT.md D-31). Audience is senior engineers (Kubernetes, AWS, AI-for-DevOps). Never neutral tutorial; never punchy-opinionated-for-its-own-sake.

## Stance

- "I've seen this fail in production" over "Some teams find…"
- Ground every claim in either the vault (QMD source) or session history (`recall` / episodic-memory). Never write from general knowledge.
- Acknowledge when you'd use the opposite approach (e.g. manifests post: "I'd reach for Helm on a 100-service platform anyway").
- When a carousel, talk, or podcast episode exists on the topic, link to it in a "Related" section at the end — never in the intro (D-09).

## Rules

1. No Unicode bold/italic. Markdown `**bold**` and `*italic*` only.
2. Em dashes (`—`) are permitted but sparingly — plain periods, commas, and colons are the default.
3. Ban AI vocabulary: **delve, landscape, tapestry, harness, leverage, utilize, pivotal, seamless, groundbreaking, realm, navigate the complexities, at the forefront**. Plain English.
4. Open with a concrete detail only Viktor would know: a number, a client reaction, a date, a line of CLI output.
5. Use contractions: `I've`, `don't`, `it's`, `here's`, `we'd`.
6. Vary sentence length. Short punches. Then a longer, winding sentence that earns the reader's attention by setting up the next short punch.
7. End the lede with either a question or a promise of what comes next ("Here's what Salesforce actually did.").
8. Code blocks use fenced markdown with explicit language (```yaml, ```bash, ```typescript). No indented 4-space code blocks — they break GitHub and Shiki highlighting.
9. Headings: sentence case, not title case. `## Why this trips teams up` not `## Why This Trips Teams Up`.
10. Links: descriptive anchor text, never "click here" or bare URLs. `[the Karpenter consolidation docs](...)` not `[here](...)`.

## Per-post register notes (D-06)

- **Karpenter (~1500-2500 words)**: deep-dive. Stats lede → 3 trap sections → 4-step rollout → close with a heuristic. Numbers everywhere.
- **MCP (~800-1200 words)**: "plainly explained" register. One-sentence definitions. Simple diagram. 3-4 concrete examples. No "behold the glory of stdio transport."
- **Manifests-by-hand (~700-1000 words)**: opinion. Punchy lede. 3-4 reasons with nuance. One concession to the opposite view. One practical heuristic.

All posts: reader is a senior engineer — skip 101 background, assume they've shipped things, dive straight into nuance.
