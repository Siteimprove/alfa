---
"@siteimprove/alfa-parser": minor
---

**Added:** `Parser.separatedList` now accepts optional `lower` and ` upper` numbers of items to parse.

If unspecified, it will parse any number of items, otherwise it will parse at least `lower` and at most `upper` items. The parser will fail if there are less; it won't fail if there are more, but these won't be consumed.
The parser will always accept at least one item, even if `lower` is 0.
