---
"@siteimprove/alfa-selector": minor
---

**Breaking:** The key selector of compound selector is now the last id/class/type in it instead of the first.

This improves cascade build time, where they are bucketed according to the key selectors, since the components in a compound are usually ordered from most generic to most precise, so this results in smaller buckets on average.
