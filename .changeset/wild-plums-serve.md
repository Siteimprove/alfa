---
"@siteimprove/alfa-css-feature": minor
"@siteimprove/alfa-cascade": minor
---

**Added:** Simple feature query (`@supports` rules) are now supported.

Only the property testing is implemented (`@supports (foo: bar)`), not the function notations. Properties are considered supported if they do not start with `"-"` (i.e. they do not have a vendor prefix).

Support feature testing is grouped int he `Feature.Supports` namespace.
