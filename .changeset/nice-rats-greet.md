---
"@siteimprove/alfa-string": patch
---

**Fixed:** `String.hasSoftWrapOpportunity` is now more strict in what it accepts.

- Non-breaking spaces are not considered soft wrap opportunities anymore.
- Punctuation other than always visible hyphens (U+002D - HYPHEN-MINUS and U+2010 ‐ HYPHEN) are not considered soft wrap opportunities anymore.
