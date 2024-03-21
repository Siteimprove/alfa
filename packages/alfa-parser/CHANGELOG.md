# @siteimprove/alfa-parser

## 0.76.0

## 0.75.2

## 0.75.1

## 0.75.0

## 0.74.0

## 0.73.0

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

## 0.69.0

## 0.68.0

## 0.67.0

## 0.66.0

### Minor Changes

- **Added:** `Parser.separatedList` now accepts optional `lower` and ` upper` numbers of items to parse. ([#1457](https://github.com/Siteimprove/alfa/pull/1457))

  If unspecified, it will parse any number of items, otherwise it will parse at least `lower` and at most `upper` items. The parser will fail if there are less; it won't fail if there are more, but these won't be consumed.
  The parser will always accept at least one item, even if `lower` is 0.

- **Added:** `Parser.parseIf` now also accepts a `Predicate` (not just a `Refinement`). ([#1457](https://github.com/Siteimprove/alfa/pull/1457))

## 0.65.1

## 0.65.0

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
