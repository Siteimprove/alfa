---
"@siteimprove/alfa-cascade": minor
---

**Added:** Cascade now handle importance of declarations, and `style` attribute.

This should have no impact on regular usage of `Style.from()` but may affect code trying to use the cascade directly.
Most notably, the internal rule tree `Block` can now come either from a rule or an element. Therefore, `Block.rule` and `Block.selector` may now be `null`.
