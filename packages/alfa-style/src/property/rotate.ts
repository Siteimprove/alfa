import { Angle, Keyword, Number, Rotate, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";

const { either, left, map, mapResult, option, pair, separatedList } = Parser;

declare module "../property" {
  interface Longhands {
    rotate: Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"none"> | Rotate;

/**
 * @internal
 */
export type Computed = Keyword<"none"> | Rotate<Angle<"deg">>;

function takeThree<T>(array: Array<T>): Result<[T, T, T], string> {
  return array.length === 3
    ? Ok.of([...array] as [T, T, T])
    : Err.of("Wrong number of coordinates in rotate axis");
}

// We cannot reuse Rotate.parse which includes the rotation function.
// We'll probably need to refactor these a bit, together with adding translate
// and scale properties.
const parseAxis = either<
  Slice<Token>,
  Keyword<"x"> | Keyword<"y"> | Keyword<"z"> | [Number, Number, Number],
  string
>(
  Keyword.parse("x"),
  Keyword.parse("y"),
  Keyword.parse("z"),
  // We need to not consume the last whitespace which is expected by parseRotate,
  // so we can hardly use Parser.take.
  mapResult(separatedList(Number.parse, Token.parseWhitespace), takeThree)
);

/**
 * {@link https://en.wikipedia.org/wiki/Kronecker_delta}
 */
function delta(keyword: Keyword, data: string): 0 | 1 {
  return keyword.value === data ? 1 : 0;
}

const parseRotate = map(
  pair(option(left(parseAxis, Token.parseWhitespace)), Angle.parse),
  ([axis, angle]) => {
    for (const value of axis) {
      if (Keyword.isKeyword(value)) {
        return Rotate.of(
          Number.of(delta(value, "x")),
          Number.of(delta(value, "y")),
          Number.of(delta(value, "z")),
          angle
        );
      }
      return Rotate.of(value[0], value[1], value[2], angle);
    }

    // No axis was provided, default is to rotate around z axis.
    return Rotate.of(Number.of(0), Number.of(0), Number.of(1), angle);
  }
);

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), parseRotate);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/rotate}
 * @internal
 */
export default Property.register(
  "rotate",
  Property.of<Specified, Computed>(Keyword.of("none"), parse, (rotate) =>
    rotate.map((rotate) =>
      Keyword.isKeyword(rotate)
        ? rotate
        : Rotate.of(rotate.x, rotate.y, rotate.z, rotate.angle.withUnit("deg"))
    )
  )
);
