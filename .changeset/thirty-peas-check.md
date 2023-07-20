---
"@siteimprove/alfa-css": minor
---

**Added:** `List.parseCommaSeparated` and `List.parseSpaceSeparated` now acceptan optional `lower` and ` upper` numbers of items to parse.

If unspecified, they will parse any number of items, otherwise they will parse at least `lower` and at most `upper` items. The parsers will fail if there are less; they won't fail if there are more, but these won't be consumed.
The parsers will always accepts at least one item, even if `lower` is 0.
