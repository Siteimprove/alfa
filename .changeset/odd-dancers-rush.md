---
"@siteimprove/alfa-selective": minor
---

**Added:** `Selective.if()` now accepts any refinement and will refine to the intersection of its result and the value in the associated right side.

This allows use cases like `Selective.of<A | B>(foo).if(isBOrC, bar => …)` to correctly refine `bar` to a `B` instead of defaulting to the `Predicate` overload that wouldn't refine anything.
