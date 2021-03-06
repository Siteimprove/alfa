import { Color, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { delimited, map, option, takeBetween } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-color": Property.Shorthand<
      | "border-top-color"
      | "border-right-color"
      | "border-bottom-color"
      | "border-left-color"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-color}
 * @internal
 */
export default Property.registerShorthand(
  "border-color",
  Property.shorthand(
    [
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
    ],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), Color.parse), 1, 4),
      ([top, right = top, bottom = top, left = right]) => [
        ["border-top-color", top],
        ["border-right-color", right],
        ["border-bottom-color", bottom],
        ["border-left-color", left],
      ]
    )
  )
);
