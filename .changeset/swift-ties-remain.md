---
"@siteimprove/alfa-css": minor
---

**Breaking:** CSS `rotate` and `skew` now convert their angle into degrees at build time.

This means that no matter which angles are provided, only angles in degrees is stored. Serialisation will thus also return values in degrees.
