---
"@siteimprove/alfa-css": minor
---

**Breaking:** The various `Value.parseBase` functions are no more available.

These where temporary helpers during migration to calculated values.

Use `filter(Value.parse, value => !value.hasCalculation(), () => "Calculation not allowed")` instead.
