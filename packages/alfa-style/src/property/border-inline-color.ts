import { Color, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { delimited, map, option, takeBetween } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-inline-color": Property.Shorthand<
      "border-inline-start-color" | "border-inline-end-color"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-color}
 * @internal
 */
export default Property.registerShorthand(
  "border-inline-color",
  Property.shorthand(
    ["border-inline-start-color", "border-inline-end-color"],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), Color.parse), 1, 2),
      ([start, end = start]) => [
        ["border-inline-start-color", start],
        ["border-inline-end-color", end],
      ]
    )
  )
);
