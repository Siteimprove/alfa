import { Shape, Keyword, Rectangle } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

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
export default Property.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (value) => value
);
