---
"@siteimprove/alfa-style": patch
---

**Fixed:** `<img>` elements are now considered as respecting their specified dimensions

`<img>` elements whose `width` or `height` is specified are now considered to respect it when computing their concrete dimensions (i.e., they rescale rather than overflow, independantly from the `overflow` property).

This is especially meaningful for tracking pixels with specified dimensions of 0 that are now correcly considered as invisible.
