---
"@siteimprove/alfa-css": minor
---

**Added:** `Value` can now resolve to a different `type` than the current one.

For example, a `Value<"length-percentage">` will fully resolve as a `Value<"length">`, not as a `Value<"length-percentage">`.

The `Value` type accepts a third type parameter (defaulting to the first one), which is (the representation of) the type into which the value will resolve. The `Value#resolve` method now returns this type of `Value`.
