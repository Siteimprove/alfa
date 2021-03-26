import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { parse } from "./border-top-width";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-width}
 * @internal
 */
export default Property.shorthand(
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
