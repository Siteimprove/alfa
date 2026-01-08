---
"@siteimprove/alfa-parser": minor
---

**Added:** A new `Parser.exclusive` combinator is available.

It works similarly to `Parser.either`, but with an associated peeker or predicate to each parser. If the peeker/predicate matches, the associated parser is used even in case of failure.

This allows quick escape hatch for long `either` chain when there is a short differeciating prefix, thus avoiding needlessly trying many parsers that are guaranteed to fail because the first prefix was already parsed successfully.
