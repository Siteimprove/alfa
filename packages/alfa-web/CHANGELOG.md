# @siteimprove/alfa-web

## 0.63.3

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-device@0.63.3
  - @siteimprove/alfa-dom@0.63.3
  - @siteimprove/alfa-earl@0.63.3
  - @siteimprove/alfa-encoding@0.63.3
  - @siteimprove/alfa-graph@0.63.3
  - @siteimprove/alfa-http@0.63.3
  - @siteimprove/alfa-json@0.63.3
  - @siteimprove/alfa-refinement@0.63.3
  - @siteimprove/alfa-result@0.63.3
  - @siteimprove/alfa-sarif@0.63.3

## 0.63.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-device@0.63.2
  - @siteimprove/alfa-dom@0.63.2
  - @siteimprove/alfa-earl@0.63.2
  - @siteimprove/alfa-encoding@0.63.2
  - @siteimprove/alfa-graph@0.63.2
  - @siteimprove/alfa-http@0.63.2
  - @siteimprove/alfa-json@0.63.2
  - @siteimprove/alfa-refinement@0.63.2
  - @siteimprove/alfa-result@0.63.2
  - @siteimprove/alfa-sarif@0.63.2

## 0.63.1

### Patch Changes

- **Fixed:** Added missing dependencies ([#1418](https://github.com/Siteimprove/alfa/pull/1418))

  Some internal dependencies were missimg, causing build failure in projects that use PnP strategies.

- Updated dependencies [[`3e8c3379f`](https://github.com/Siteimprove/alfa/commit/3e8c3379f47b0520dbe9a4f8938c4b5752feda6d)]:
  - @siteimprove/alfa-http@0.63.1
  - @siteimprove/alfa-device@0.63.1
  - @siteimprove/alfa-dom@0.63.1
  - @siteimprove/alfa-earl@0.63.1
  - @siteimprove/alfa-encoding@0.63.1
  - @siteimprove/alfa-graph@0.63.1
  - @siteimprove/alfa-json@0.63.1
  - @siteimprove/alfa-refinement@0.63.1
  - @siteimprove/alfa-result@0.63.1
  - @siteimprove/alfa-sarif@0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** Changed `Request#from`, `Response#from` and `Page#from` to return `Result<...>` ([#1395](https://github.com/Siteimprove/alfa/pull/1395))

  This reflects the fact that the function might fail on invalid input. As a quick migration add a `.getUnsafe()` call to the returned result which will retain the original behavior where an exception might be thrown.

### Patch Changes

- Updated dependencies [[`17d79da6b`](https://github.com/Siteimprove/alfa/commit/17d79da6b2e6d7fd789344ba62cb6fe5744c02a4), [`6b5f7be59`](https://github.com/Siteimprove/alfa/commit/6b5f7be5918bbf04ac07bcbf422c3c75304ce4de)]:
  - @siteimprove/alfa-dom@0.63.0
  - @siteimprove/alfa-earl@0.63.0
  - @siteimprove/alfa-http@0.63.0
  - @siteimprove/alfa-sarif@0.63.0
  - @siteimprove/alfa-device@0.63.0
  - @siteimprove/alfa-encoding@0.63.0
  - @siteimprove/alfa-graph@0.63.0
  - @siteimprove/alfa-json@0.63.0
  - @siteimprove/alfa-refinement@0.63.0

## 0.62.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-device@0.62.2
  - @siteimprove/alfa-dom@0.62.2
  - @siteimprove/alfa-earl@0.62.2
  - @siteimprove/alfa-encoding@0.62.2
  - @siteimprove/alfa-graph@0.62.2
  - @siteimprove/alfa-http@0.62.2
  - @siteimprove/alfa-json@0.62.2
  - @siteimprove/alfa-refinement@0.62.2
  - @siteimprove/alfa-sarif@0.62.2

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-device@0.62.1
  - @siteimprove/alfa-dom@0.62.1
  - @siteimprove/alfa-earl@0.62.1
  - @siteimprove/alfa-encoding@0.62.1
  - @siteimprove/alfa-graph@0.62.1
  - @siteimprove/alfa-http@0.62.1
  - @siteimprove/alfa-json@0.62.1
  - @siteimprove/alfa-refinement@0.62.1
  - @siteimprove/alfa-sarif@0.62.1
