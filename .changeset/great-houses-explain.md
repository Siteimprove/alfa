---
"@siteimprove/alfa-css-feature": minor
"@siteimprove/alfa-media": minor
---

**Breaking:** `@siteimprove/alfa-media` has been deprecated and replaced by `@siteimprove/alfa-css-feature`.

In the newer package, the exported namespace is called `Fetaure`, with a `Feature.Media` sub-namespace. This reverses the previous `Media.Feature` naming and corresponds better to the CSS naming. Similarly, other kind of features or helpful constructs must now be accessed as `Feature.Type`, `Feature.Condition`, …

Additionally, `Media.parse` has been renamed `Featrue.parseMediaQuery`.
