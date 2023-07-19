---
"@siteimprove/alfa-css": minor
---

**Breaking:** The `Transform.parse` parser is now considered `@internal`.

It should not be used externally since individual transform functions are normally only used in contexts where the actual transformation is known in advance, in which case thes pecific parser (`Matrix.parse`, Rotate.parste`, …) can be used instead.
