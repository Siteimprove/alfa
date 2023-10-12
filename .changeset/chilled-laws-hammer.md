---
"@siteimprove/alfa-dom": minor
---

**Breaking:** `Element#of` now requires the device used when scraping a page in order to store a box.

This ensures that the boxes of the elements will be stored with and only be accessible for the same device instance. If no device is provided, no box is stored with the element.
