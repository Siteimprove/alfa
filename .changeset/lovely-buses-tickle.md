---
"@siteimprove/alfa-style": minor
---

**Breaking:** The `white-space` property is now handled as a shorthand.

Declarations should still be backward compatible. However, querying the value must now be done through the longhands `white-space-collapse`, `text-wrap-mode` or `white-space-trim`.
