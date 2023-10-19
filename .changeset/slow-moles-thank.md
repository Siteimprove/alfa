---
"@siteimprove/alfa-dom": minor
---

**Added:** `Document#toJSON` now optionally accepts serialization options containing device.

The options will be passed down to all children of the document and used by `Element` to serialize the box corresponding to the device.
