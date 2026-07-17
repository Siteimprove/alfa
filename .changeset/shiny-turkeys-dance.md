---
"@siteimprove/alfa-aria": minor
---

**Changed:** `<img>` elements with no `src` attribute now map to `img` role again.

This effectively reverts #1273 which was based on a discussion that didn't make it to the specs yet, and thus Alfa follows current major browsers implementation. Moreover, the HTML specification mandates the presence of a `src` (or `srcset`) attribute on `<img>` elements, making the case rather hypothetical.

Thanks to [Jeff Witt](https://github.com/wittjeff) for reporting the issue.
