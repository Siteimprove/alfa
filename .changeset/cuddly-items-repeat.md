---
"@siteimprove/alfa-css": minor
---

**Breaking:** `Position.Component` cannot be raw `LengthPercentage` anymore.

Instead, they must always be a full `Position.Side` (or the "center" keyword) i.e. include an explicit side to count from. This side is automatically added when parsing raw `LengthPercentage`.
