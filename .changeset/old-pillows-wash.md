---
"@siteimprove/alfa-aria": patch
---

**Fixed:** Images with an empty alt but an accessible name are now correctly exposed with a role of `img`.

This does mostly follow Chrome behaviour for the corner cases (empty or whitespace `aria-label` or `title`); browsers do differ on how they treat them.

Thanks to [Jeff Witt](https://github.com/wittjeff) for investigating browsers behaviour.
