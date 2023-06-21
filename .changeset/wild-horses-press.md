---
"@siteimprove/alfa-style": minor
"@siteimprove/alfa-css": minor
---

**Added:** `List` and `Tuple` CSS values are now exported from `@siteimprove/alfa-css`.

These values were previously internal to the `@siteimprove/alfa-style` package and are now grouped with the other CSS values.

**Added:** A `List.parseCommaSeparated` helper is now provided, taking a value parser as input and returning a parser for list of values separated by commas.

**Added:** `List` now implement the `Functor` interface.
