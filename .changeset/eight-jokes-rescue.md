---
"@siteimprove/alfa-dom": minor
---

**Added:** DOM node builders like `Element.of` etc. now optionally accept `serializationId` which will be used when serializing depending on the verbosity chosen.

If one is not supplied it will be randomly generated as an UUID.
