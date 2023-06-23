---
"@siteimprove/alfa-css": minor
---

**Breaking:** The resolvers for `Length` and `Percentage` are now wrapped in an object.

The resolver for `Length` is now a `{ length: Mapper<…> }` instead of being just a `Mapper`, similraly the resolver for `Percentage` is now a `{ basePercentage: … }`. This allows for more complex value types who require more than one resolver (e.g. length-percentage require both a length resolver and a percentage resolver).
