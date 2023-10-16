---
"@siteimprove/alfa-css": minor
---

**Changed:** The `Position` type requires more type parameters.

Instead of just accepting the horizontal and vertical components, the type now also requires the horizontal and vertical keywords list (as first and second parameter). The components parameter default to `Position.Component<H>` (reps. `V`) for keywords `H` (resp. `V`).

The type also accepts a `CALC` parameter indicating whether it may have calculations.
