import { Shape, Keyword, Rectangle } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";
import { Value } from "../value";

const { either, map } = Parser;

/**
 * @deprecated
 * @internal
 */
export type Specified =
  | Keyword<"auto">
  | Shape<Rectangle, Keyword<"border-box">>;

/**
 * @deprecated
 * @internal
 */
export type Computed = Specified;

/**
 * @deprecated
 * @internal
 */
export const parse = either(
  Keyword.parse("auto"),
  map(Rectangle.parse, (rectangle) =>
    Shape.of(rectangle, Keyword.of("border-box"))
  )
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/clip}
 * @deprecated
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (value, style) =>
    style.computed("position").value.equals(Keyword.of("absolute")) ||
    style.computed("position").value.equals(Keyword.of("fixed"))
      ? value
      : Value.of(Keyword.of("auto"))
);
