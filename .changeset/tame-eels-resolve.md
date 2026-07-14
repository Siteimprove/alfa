---
"@siteimprove/alfa-css": major
---

**Breaking:** `Length.resolver` now requires two extra parameters, `lhBase` and `rlhBase`, used to resolve the `lh` and `rlh`. They must be provided after the existing `vhBase` parameter, so callers building a length resolver must be updated accordingly.
