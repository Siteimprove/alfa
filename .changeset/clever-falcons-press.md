---
"@siteimprove/alfa-css": minor
---

**Added:** `Position` now accept calculations in any of their components.

To fully resolve a `Position`, the reslover needs both a length resolver, and two percentage bases, one for ebach dimension.
To partially resolve a `Position`, only a length resolver is needed.
