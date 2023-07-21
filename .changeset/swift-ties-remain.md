---
"@siteimprove/alfa-css": minor
---

**Breaking:** CSS `rotate` and `skew` now convert their angles into degrees at build time.

This means that no matter which angles are provided, only angles in degrees are stored. Serialisation will thus also return values in degrees.
