---
"@siteimprove/alfa-dom": minor
---

**Added:** `Element` serialised with high verbosity now include the serialisation ID of their assigned slot, if any.

This help de-serialise the shadow trees for tools that do not want to re-compute slot assignement.
