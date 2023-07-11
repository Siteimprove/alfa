---
"@siteimprove/alfa-css": minor
---

**Removed:** The `Gradient.parseItem` helper has been removed as it wasn't used.

If need be, use `Parser.either(Gradient.parseHint, Gradient.parseStop)` instead.
