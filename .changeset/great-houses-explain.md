---
"@siteimprove/alfa-css-feature": minor
"@siteimprove/alfa-media": minor
---

**Breaking:** `@siteimprove/alfa-media` has been deprecated and replaced by `@siteimprove/alfa-css-feature`.

In the newer package, the exported namespace is called `Feature` (instead of `Media`), with a `Feature.Media` sub-namespace. This reverses the previous `Media.Feature` naming and corresponds better to the CSS naming. Similarly, `Query`, `List`, `Type`, and `Modifier` are now under the `Feature.Media` namespace. `Condition` is under the `Feature` namespace as it can apply to other kind of features. The media features per se, previously under `Media.Feature` are thus now under `Feature.Media.Feature`.

Additionally, `Media.parse` (now `Feature.Media.parse`) is directly available as `Feature.parseMediaQuery`.
