---
"@siteimprove/alfa-parser": minor
---

**Breaking:** `Parser.parseIf` has been removed in favor of `Parser.filter`.

Both functions w%ere doing the same thing.
Migration: replace `Parser.parseIf(refinement, parser, ifError)` with `Parser.filter(parser, refinement, ifError)`.
