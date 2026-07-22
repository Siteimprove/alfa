---
"@siteimprove/alfa-css": minor
---

**Added:** The `abs()` and `sign()` CSS math functions are now supported in calculations.

`abs(A)` resolves to the absolute value of its argument, keeping its type. `sign(A)` resolves to `-1`, `0`, or `1` as a `<number>`, regardless of the type of its argument. As with the other math functions, arguments that are percentages or relative lengths are only resolved once a resolver is provided. See [CSS Values and Units 4, § Sign-Related Functions](https://drafts.csswg.org/css-values-4/#sign-funcs).
