import { Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Length | Percentage;

/**
 * @internal
 */
export type Computed = Length<"px"> | Percentage;

/**
 * @internal
 */
export const parse = either(Length.parse, Percentage.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-indent}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Length.of(0, "px"),
  parse,
  (textIndent, style) =>
    textIndent.map((indent) =>
      indent.type === "percentage" ? indent : Resolver.length(indent, style)
    ),
  {
    inherits: true,
  }
);
