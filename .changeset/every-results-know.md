---
"@siteimprove/alfa-css": minor
---

**Breaking:** The `Rectangle` shape is no longer deprecated; `Rectangle.parse` now rejects comma-separated rectangles, a new `Rectangle.parseLegacy` parses comma- or space- separated rectangles as used in the deprecated `clip` property. `Shape.parse` now parses space-separated rectangles.
