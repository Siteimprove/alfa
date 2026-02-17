---
"@siteimprove/alfa-css": patch
---

**Fixed:** `Token.parseWhitespace` now accepts 0 whitespace.

This fixes a problem with `var()` function with no whitespace with surrounding tokens, that are accepted by CSS grammar.
