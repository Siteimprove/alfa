---
"@siteimprove/alfa-rules": minor
---

**Added:** User agent controlled expectation to R111.

The rule should pass targets that are user agent controlled like `input type="checkbox"` where the size has not been modified. As a first approximation we let it pass all `input` elements, but this is subject to change.
