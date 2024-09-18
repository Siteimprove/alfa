---
"@siteimprove/alfa-dom": minor
---

**Breaking:** `Elemenet.hasDisplaySize()` now builds a `Predicate<Element<"select">>` instead of a `Predicate<Element>`.

That is, it can only be applied to elements that have been typed as `<select>` elements, where it makes sense. If the type of element cannot be narrowed in TypeScript (e.g. because it is the result of a direct test on `Element#name`), a type assertion is needed; in general, using the `Element.hasName` refinement is recommended over testing `Element#name`.
