---
"@siteimprove/alfa-style": minor
---

**Breaking:** The way style properties are defined and registred has been changed, including some changes in names.

The `alfa-style` package doesn't export a `Property` class and namespace anymore. These functionalities are now split in the `Longhands` and `Shorthands` exports. Most `Property.foo` are now available as `Longhands.foo` (notably, `Longhands.Name` and `Longhands.get`); most `Property.Shorthand.foo` are now available as `Shorthands.foo`.
