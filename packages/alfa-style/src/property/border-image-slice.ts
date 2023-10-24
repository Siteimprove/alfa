import {
  Keyword,
  Number,
  Percentage,
  Token,
  Tuple,
  Value,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";

const { either, filter } = Parser;

type NoFill<T extends Value> = Tuple<[top: T, right: T, bottom: T, left: T]>;
type WithFill<T extends Value> = Tuple<
  [top: T, right: T, bottom: T, left: T, fill: Keyword<"fill">]
>;
type ImageSlice<T extends Value> = NoFill<T> | WithFill<T>;

/**
 * @internal
 */
export type Specified = ImageSlice<Number | Percentage<"percentage">>;

type Computed = ImageSlice<Number.Canonical | Percentage.Canonical>;

const parseItem = filter(
  either(Number.parse, Percentage.parse),
  (size) => size.hasCalculation() || size.value >= 0,
  () => `Negative sizes are not allowed`,
);

const parseFill = Keyword.parse("fill");

/**
 * @internal
 */
export const parse: Parser<Slice<Token>, Specified, string> = (input) => {
  let top: Number | Percentage | undefined;
  let right: Number | Percentage | undefined;
  let bottom: Number | Percentage | undefined;
  let left: Number | Percentage | undefined;
  let fill: Keyword<"fill"> | undefined;

  while (true) {
    for ([input] of Token.parseWhitespace(input)) {
    }

    const result = parseItem(input);

    if (result.isOk()) {
      if (top === undefined) {
        [input, top] = result.get();
        continue;
      }

      if (right === undefined) {
        [input, right] = result.get();
        continue;
      }

      if (bottom === undefined) {
        [input, bottom] = result.get();
        continue;
      }

      if (left === undefined) {
        [input, left] = result.get();
        continue;
      }
    } else if (fill === undefined) {
      const result = parseFill(input);

      if (result.isOk()) {
        [input, fill] = result.get();
        continue;
      }
    }

    break;
  }

  if (top === undefined) {
    return Err.of(`Expected an image slice`);
  }

  right = right ?? top;
  bottom = bottom ?? top;
  left = left ?? right;

  return Result.of([
    input,
    fill
      ? Tuple.of(top, right, bottom, left, fill)
      : Tuple.of(top, right, bottom, left),
  ]);
};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-slice}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Tuple.of(
    Percentage.of(1),
    Percentage.of(1),
    Percentage.of(1),
    Percentage.of(1),
  ),
  parse,
  (value) => value.map((tuple) => tuple.resolve()),
);
