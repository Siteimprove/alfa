import { Angle, Keyword, Number, Rotate, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";

const { either, left, map, option, pair } = Parser;

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

// We cannot reuse Rotate.parse which includes the rotation function.
// We'll probably need to refactor these a bit, together with adding translate
// and scale properties.
const parseAxis = either<
  Slice<Token>,
  Keyword<"x"> | Keyword<"y"> | Keyword<"z">,
  string
>(Keyword.parse("x"), Keyword.parse("y"), Keyword.parse("z"));

const parseRotate = map(
  pair(option(left(parseAxis, Token.parseWhitespace)), Angle.parse),
  ([axis, angle]) => Rotate.of(Number.of(0), Number.of(0), Number.of(1), angle)
);

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), parseRotate);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/transform}
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
