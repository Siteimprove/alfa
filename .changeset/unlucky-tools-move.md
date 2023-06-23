---
"@siteimprove/alfa-css": minor
---

**Added:** `Value` can now resolve to a different `type` than the current one.

For example, a `Value<"length-percentage">` will fully resolve as a `Value<"length">`, not as a `Value<"length-percentage">`.
