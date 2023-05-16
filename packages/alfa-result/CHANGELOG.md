# @siteimprove/alfa-result

## 0.63.0

### Minor Changes

- **Breaking:** Removed `Err#get` and `Ok#getErr` and added `Result#getUnsafe` and `Result#getErrUnsafe` ([#1395](https://github.com/Siteimprove/alfa/pull/1395))

  Going forward it will only be possible to call `.get` on `Ok` instances and `.getErr` on `Err` instances. As a quick migration replace every occurrence of `foo.get()` that results in compile error with `foo.getUnsafe()` and similarly `foo.getErr()` with `foo.getErrUnsafe()`. It is intended that these two methods are only called when an external proof of correctness (out of the type system) exists, typically in tests or with some more complex interactions. It is advised to document these usage with such a proof.

### Patch Changes

- Updated dependencies [[`abc7b9744`](https://github.com/Siteimprove/alfa/commit/abc7b9744985d9935a079e82fddfa668463442c0)]:
  - @siteimprove/alfa-option@0.63.0
  - @siteimprove/alfa-applicative@0.63.0
  - @siteimprove/alfa-callback@0.63.0
  - @siteimprove/alfa-equatable@0.63.0
  - @siteimprove/alfa-foldable@0.63.0
  - @siteimprove/alfa-functor@0.63.0
  - @siteimprove/alfa-hash@0.63.0
  - @siteimprove/alfa-json@0.63.0
  - @siteimprove/alfa-mapper@0.63.0
  - @siteimprove/alfa-monad@0.63.0
  - @siteimprove/alfa-predicate@0.63.0
  - @siteimprove/alfa-reducer@0.63.0
  - @siteimprove/alfa-refinement@0.63.0
  - @siteimprove/alfa-thunk@0.63.0

## 0.62.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.62.2
  - @siteimprove/alfa-callback@0.62.2
  - @siteimprove/alfa-equatable@0.62.2
  - @siteimprove/alfa-foldable@0.62.2
  - @siteimprove/alfa-functor@0.62.2
  - @siteimprove/alfa-hash@0.62.2
  - @siteimprove/alfa-json@0.62.2
  - @siteimprove/alfa-mapper@0.62.2
  - @siteimprove/alfa-monad@0.62.2
  - @siteimprove/alfa-option@0.62.2
  - @siteimprove/alfa-predicate@0.62.2
  - @siteimprove/alfa-reducer@0.62.2
  - @siteimprove/alfa-refinement@0.62.2
  - @siteimprove/alfa-thunk@0.62.2

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.62.1
  - @siteimprove/alfa-callback@0.62.1
  - @siteimprove/alfa-equatable@0.62.1
  - @siteimprove/alfa-foldable@0.62.1
  - @siteimprove/alfa-functor@0.62.1
  - @siteimprove/alfa-hash@0.62.1
  - @siteimprove/alfa-json@0.62.1
  - @siteimprove/alfa-mapper@0.62.1
  - @siteimprove/alfa-monad@0.62.1
  - @siteimprove/alfa-option@0.62.1
  - @siteimprove/alfa-predicate@0.62.1
  - @siteimprove/alfa-reducer@0.62.1
  - @siteimprove/alfa-refinement@0.62.1
  - @siteimprove/alfa-thunk@0.62.1
