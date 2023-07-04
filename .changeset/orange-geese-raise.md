---
"@siteimprove/alfa-css": minor
---

**Added:** `Tuple` and `Value` can now be built of calculated values.

Both calculated and non-calculated values can be mixed. The collection will have its `hasCalculation` flag set to true if at least one of the member has.
The collections also come with a `resolve` method that take a `Resolver` able to resolve all members and apply it to the members.
