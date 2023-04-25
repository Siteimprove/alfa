import { Keyword } from "@siteimprove/alfa-css";
import { Longhand } from "../longhand";
import { Value } from "../value";

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
  (value, style) =>
    style.computed("position").value.equals(Keyword.of("absolute")) ||
    style.computed("position").value.equals(Keyword.of("fixed"))
      ? Value.of(Keyword.of("none"))
      : value
);
