---
"@siteimprove/alfa-css": minor
---

**Breaking:** CSS `rotate` now convert their angle into degrees at build time.

This means that no matter which angle is provided, only an angle in degrees is stored. Serialisation will thus also returrn a value in degrees.
