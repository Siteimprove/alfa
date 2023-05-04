---
"@siteimprove/alfa-css": minor
---

**Breaking:** `Linear.parse` and `Radial.parse` now require an item parser.

Both gradient parsing functions where using `Gradient.parseItemList`, which created a circular dependencies between the files. The circle has been broken by injecting the item list parser in the individual parser. To migrate, simply call `Linear.parse(Gradient.parseItemList)` instead of `Linear.parse` (same with `Radial`).
