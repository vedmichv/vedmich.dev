# Translation Rules (EN → RU) — locked

**Source:** CONTEXT.md D-30. Follow `src/content/blog/{en,ru}/hello-world.md` precedent — tech terms stay English, prose translates to natural Russian.

## Rules

| # | Rule | Example |
|---|------|---------|
| 1 | Tech terms stay in English | `Karpenter`, `NodePool`, `MCP server`, `YAML`, `Cluster Autoscaler`, `kubectl`, flag names, product names |
| 2 | Concepts translate if natural | "cluster" → "кластер" in natural RU phrasing; compound "Karpenter cluster" stays as-is |
| 3 | Code blocks identical | Never translate variable names, CLI commands, or fenced code contents (byte-for-byte equal between EN and RU file) |
| 4 | Upstream quotes preserved | If the source (carousel, talk) is English, keep the quote in English. Mark with `*(original English)*` note when the RU reader needs orientation. |
| 5 | Both locales in same commit | CLAUDE.md bilingual constraint. EN + RU markdown + any `public/blog-assets/{slug}/` files = single git commit. |
| 6 | Frontmatter fields translate selectively | `title`, `description` translate. `date`, `tags`, `slug` do NOT. `reading_time` and `cover_image` stay identical if present. `author` — see note below. |
| 7 | Common idiomatic mappings | "in production" → "в продакшне"; "at scale" → "в масштабе" (when emphasizing state — e.g. Karpenter post title "в масштабе 1000 кластеров") OR "на масштабе" (when emphasizing action — e.g. "отрабатывает на масштабе"); "right sizing" stays EN if term of art; "drift" → "дрейф"; "churn" stays EN |
| 8 | Pronoun voice preserved | "I've seen" → "На своей практике я видел" or "Я видел". First person stays first person. |
| 9 | Anglicisms for engineering slang | "workload" → "workload" (anglicism in RU engineering prose); "pipeline" → "pipeline". Don't force translations that sound awkward. |
| 10 | Headings translate | Section headings render in Russian: `## Why this trips teams up` → `## Почему тут путаются команды` |

## Author frontmatter note (important — BLOCKER-1 Wave 1 tie-in)

Do NOT add `author: "Виктор Ведмич"` to RU post frontmatter. The RU slug page (`src/pages/ru/blog/[...slug].astro`, Wave 1 Task 3) translates the schema-default Latin `"Viktor Vedmich"` to Cyrillic `"Виктор Ведмич"` at render time via a locale-aware `authorDisplay` constant. Leaving `author:` out of RU frontmatter (just like EN) is the correct pattern — the byline renders `Виктор Ведмич · N мин чтения` automatically.

This means:
- EN frontmatter: omit `author:` (inherits Latin default)
- RU frontmatter: omit `author:` (inherits Latin default, render-layer translates to Cyrillic)
- Guest-author posts: set `author: "Full Name"` in BOTH EN and RU frontmatter — the locale-aware render only translates when `author === 'Viktor Vedmich'`, everything else passes through unchanged

See `references/frontmatter-schema.md` for the authoritative schema.

## Anti-patterns

- Never machine-translate `Karpenter` → `Карпентер` (the brand name stays Latin).
- Never leave an English paragraph in the RU file with a note like "TODO: translate" — D-29 requires full translation before commit.
- Never translate YAML keys, CLI flags, or environment variable names.
- Never insert literal Cyrillic transliterations of acronyms: `MCP` stays `MCP`, not `МСП`.
- Never add `author: "Виктор Ведмич"` to RU frontmatter — it's handled at the render layer (Wave 1 Task 3).

## Validation before commit

- RU file contains zero `<!-- TODO: translate -->` markers.
- Code blocks between EN and RU files produce identical output from `diff` (ignoring line numbers).
- RU reader (self-read or spot-check) finds the prose natural, not machine-translated.
- RU frontmatter does NOT contain `author:` (unless guest author — same value as EN in that case).
