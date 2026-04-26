# Companion Sources — vault map

**Source:** CONTEXT.md D-08 / D-09 / D-10. When a draft is ready, scan the vault for related carousels, talks, and podcast episodes — suggest an end-of-post "Related" section (NOT in the intro per D-09).

## Carousel companions (LinkedIn)

Source dir: `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/`

| Slug | Topic match signal |
|------|--------------------|
| `karpenter-1000-clusters/` | karpenter, cluster autoscaling, right-sizing, cost cut |
| `k8s-interview/` | kubernetes interview, CKA / CKS prep |
| `s3-security-8point/` | S3, AWS security, MFA Delete |
| `kubectl-apply-path/` | kubectl, declarative config, API server |

Scan method: `ls ~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/` plus `qmd search "<topic>" --collection vault`.

## Talk companions (conferences)

Source dirs:
- `~/Documents/ViktorVedmich/40-Content/44-Speaking/44.20-Talk-Materials/` — past talk notes
- `~/Documents/ViktorVedmich/40-Content/44-Speaking/44.10-CFPs/15.31-Talks-Materials/` — CFP + chalk-talk notes

| Note / Talk ID | Topic match signal |
|----------------|--------------------|
| `DOP202-Warsaw-Summit-Speaker-Notes.md` | karpenter, cost optimization, AWS Summit |
| `2026-05-06-Warsaw-Summit-MCP-Chalk-Talk.md` | MCP, Claude Code, AI DevOps, chalk talk |

Scan method: `qmd search "<topic>" --collection vault` filtered by the two dirs above.

## Podcast companions

Source dirs:
- `~/Documents/ViktorVedmich/30-Projects/32-DKT/` — DevOps Kitchen Talks episodes (91+)
- `~/Documents/ViktorVedmich/10-AWS/15-Content-YT-Podcat-Talks/15.10-AWS-RU-Podcast/` — AWS на русском (65+, safe — not confidential)

Scan method: `qmd search "<topic> episode" --collection vault`.

## Lesson / course companions

Source dir: `~/Documents/ViktorVedmich/30-Projects/37-AI-DevOps-course/`

| Area | Topic match signal |
|------|--------------------|
| `37.14-Claude-Code/Lesson-*` | Claude Code, MCP, agents |
| `37.1X-*` | Prompt engineering, n8n, agentic patterns |

## Placement rule (D-09)

"Related" section goes at end-of-post, never in intro or lede. Example closing:

```markdown
## Related

- LinkedIn carousel: *Karpenter at 1000 clusters — 3 traps you hit before you cut cost* (https://linkedin.com/in/vedmich/...)
- AWS Summit Warsaw 2026 chalk talk: *MCP Servers, Plainly Explained* — May 6, session DOP202
- DKT episode: *... (if applicable)*
```

## Anti-patterns

- Never include confidential client anecdotes in companion links — only cite public-facing artifacts (LinkedIn posts, published talks, open podcast episodes).
- Never cite a talk that hasn't happened yet without flagging it: "*upcoming at AWS Summit Warsaw 2026-05-06*".
- Never cite an internal AWS talk from `10-AWS/14-Tips-AWS-Internal/` (confidential exclusion).
