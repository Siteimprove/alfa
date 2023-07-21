---
"@siteimprove/alfa-css": minor
---

**Breaking:** The `Transform.parse` parser is now considered `@internal`.

It should not be used externally since individual transform functions are normally only used in contexts where the actual transformation is known in advance, in which case the specific parser (`Matrix.parse`, `Rotate.parse`, …) can be used instead. `Transform.parseList` is still available externally.
