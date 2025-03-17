---
"@siteimprove/alfa-dom": minor
---

**Added:** `Text.of` now accepts `Option<Rectangle>` and `Option<Device>`. A rectangle can also be passed through the `box` JSON property when using `Text.fromText`.

The rectangle represents the layout of the text node. If a rectangle is passed in, a device must be be supplied, otherwise the rectangle won't be set.
