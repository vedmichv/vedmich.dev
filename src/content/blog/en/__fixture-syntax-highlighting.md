---
title: "Syntax Highlighting Fixture"
description: "Internal fixture for Phase 2 transformer validation — not for publication."
date: 2026-05-03
tags: ["fixture"]
draft: true
---

This file exists to validate `@shikijs/transformers` coverage on bash, yaml, typescript, and dockerfile fences. It is excluded from BlogPreview and sitemap.

## Bash (highlight only, `#` comment)

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "starting build" # [!code highlight]
npm run build
echo "done"
```

## YAML (diff add + remove, `#` comment)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  debug: "false" # [!code --]
  debug: "true" # [!code ++]
  log_level: "info"
```

## TypeScript (highlight + diff mixed, `//` comment)

```typescript
export function greet(name: string): string {
  const prefix = "Hello"; // [!code highlight]
  return `${prefix}, ${name}!`;
}

const deprecated = 1; // [!code --]
const replacement = 2; // [!code ++]
```

## Dockerfile (all three, own-line `# [!code X]`)

Shiki's `dockerfile` grammar does not tokenize trailing `# ...` as a comment (it stays
in the preceding command's text token), so inline annotations silently skip. Put
`# [!code X]` on its own comment line — the transformer consumes the comment line and
applies the class to the NEXT source line.

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
# [!code highlight]
RUN npm ci

COPY . .
# [!code highlight]
RUN npm run build
# [!code --]
CMD ["node", "dist/server.js"]
# [!code ++]
CMD ["node", "dist/index.js"]
```

End of fixture.
