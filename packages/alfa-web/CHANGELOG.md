# @siteimprove/alfa-web

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

### Patch Changes

- **Fixed:** Added missing dependencies ([#1418](https://github.com/Siteimprove/alfa/pull/1418))

  Some internal dependencies were missing, causing build failure in projects that use PnP strategies.

## 0.63.0

### Minor Changes

- **Breaking:** Changed `Request#from`, `Response#from` and `Page#from` to return `Result<...>` ([#1395](https://github.com/Siteimprove/alfa/pull/1395))

  This reflects the fact that the function might fail on invalid input. As a quick migration add a `.getUnsafe()` call to the returned result which will retain the original behavior where an exception might be thrown.

## 0.62.2

## 0.62.1

