# @siteimprove/alfa-result

## 0.70.0

## 0.69.0

## 0.68.0

## 0.67.0

## 0.66.0

## 0.65.1

## 0.65.0

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** Removed `Err#get` and `Ok#getErr` and added `Result#getUnsafe` and `Result#getErrUnsafe` ([#1395](https://github.com/Siteimprove/alfa/pull/1395))

  Going forward it will only be possible to call `.get` on `Ok` instances and `.getErr` on `Err` instances. As a quick migration replace every occurrence of `foo.get()` that results in compile error with `foo.getUnsafe()` and similarly `foo.getErr()` with `foo.getErrUnsafe()`. It is intended that these two methods are only called when an external proof of correctness (out of the type system) exists, typically in tests or with some more complex interactions. It is advised to document these usage with such a proof.

## 0.62.2

## 0.62.1
