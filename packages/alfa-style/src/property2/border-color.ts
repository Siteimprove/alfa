import { Color, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-color}
 * @internal
 */
export default Shorthand.of(
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
);
