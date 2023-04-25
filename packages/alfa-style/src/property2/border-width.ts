import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";
import { parse } from "./border-top-width";

const { delimited, map, option, takeBetween } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-width": Property.Shorthand<
      | "border-top-width"
      | "border-right-width"
      | "border-bottom-width"
      | "border-left-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-width}
 * @internal
 */
export default Property.registerShorthand(
  "border-width",
  Property.shorthand(
    [
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width",
    ],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 4),
      ([top, right = top, bottom = top, left = right]) => [
        ["border-top-width", top],
        ["border-right-width", right],
        ["border-bottom-width", bottom],
        ["border-left-width", left],
      ]
    )
);
