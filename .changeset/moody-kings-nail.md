---
"@siteimprove/alfa-selector": minor
---

**Breaking:** The various kinds of selectors are now directly exported from the package, out of the `Selector` namespace.

That is, use `Id` instead of `Selector.Id`, … (or `import * as Selector` and keep using `Selector.Id`).
