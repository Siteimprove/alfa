# @siteimprove/alfa-option

## 0.66.0

## 0.65.1

## 0.65.0

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** Moved `Maybe` type out of `Option` namespace ([#1402](https://github.com/Siteimprove/alfa/pull/1402))

  The type was moved while adding the function `Maybe.toOption`. The type is an internal convenience type that is only used when it's not possible or practical to use `Option`. To migrate, import `Maybe` from the `alfa-option` package and replace `Option.Maybe` with `Maybe`.

## 0.62.2

## 0.62.1
