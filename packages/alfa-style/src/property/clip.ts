import { Shape, Keyword, Rectangle } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Value } from "../value";

import type Position from "./position";

const { either, map } = Parser;

/**
 * @deprecated The clip property is deprecated in CSS but still used by some sites.
 * @internal
 */
export type Specified =
  | Keyword<"auto">
  | Shape<Rectangle, Keyword<"border-box">>;

/**
 * @deprecated The clip property is deprecated in CSS but still used by some sites.
 * @internal
 */
export type Computed = Specified;

/**
 * @deprecated The clip property is deprecated in CSS but still used by some sites.
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
 * @deprecated The clip property is deprecated in CSS but still used by some sites.
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (value, style) => {
    // We need the type assertion to help TS break a circular type reference:
    // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
    const position = style.computed("position").value as Longhand.Computed<
      typeof Position
    >;

    return position.equals(Keyword.of("absolute")) ||
      position.equals(Keyword.of("fixed"))
      ? value
      : Value.of(Keyword.of("auto"));
  }
);
