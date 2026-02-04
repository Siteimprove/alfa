---
"@siteimprove/alfa-parser": patch
---

**Changed:** `Parser.left` now accepts any number of parsers (at least one), will run them sequentially and return the result of the first, with the remainder input of running them all.
