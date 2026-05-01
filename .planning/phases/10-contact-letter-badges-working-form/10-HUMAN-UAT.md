---
status: partial
phase: 10-contact-letter-badges-working-form
source: [10-VERIFICATION.md]
started: 2026-05-01T17:00:00Z
updated: 2026-05-01T17:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. MX pre-flight for viktor@vedmich.dev (D-03)
expected: Sending a test mail from an external account to viktor@vedmich.dev arrives in Viktor's inbox. D-03 / PLAN user_setup block explicitly flags this as out-of-Claude's-scope. If MX isn't live, the mailto handoff looks correct but messages bounce silently.
result: [pending]

### 2. Live visual verification on https://vedmich.dev/en/#contact and /ru/#contact
expected: At 1440px: 5 letter badges render in one row (L, G, Y, 𝕏, T) with teal letter + platform name and card-glow on hover; "Write me a message" CTA visible; clicking it swaps section to form with focus on Name input; typing valid values + Send launches OS mail client with pre-filled subject/body; success panel shows ✓ + "Check your email client" + fallback mailto link + Close button; ESC / Cancel / Close all return to CTA-only state and restore focus to the CTA button. At 375px: grid collapses to 2 columns + form Card fits without horizontal scroll. RU copy: "Напишите мне", "Имя / Email / Сообщение", "Отправить / Отмена", "Проверьте почтовый клиент". JS-off (DevTools → Disable JavaScript → reload): CTA renders as a plain `<a href="mailto:viktor@vedmich.dev">` anchor that opens the mail client when clicked; letter grid still works as plain anchors.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
