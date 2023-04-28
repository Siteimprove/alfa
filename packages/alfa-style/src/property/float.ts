import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Value } from "../value";

import type { Computed as Position } from "./position";

type keywords = Keyword<"none"> | Keyword<"left"> | Keyword<"right">;

/**
 * @internal
 */
export type Specified = keywords;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("none", "left", "right");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/float}
 * @internal
 */

export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (value, style) => {
    // We need the type assertion to help TS break a circular type reference:
    // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
    const position = style.computed("position").value as Position;

    return position.equals(Keyword.of("absolute")) ||
      position.equals(Keyword.of("fixed"))
      ? Value.of(Keyword.of("none"))
      : value;
  }
);
