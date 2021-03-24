import { Color, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-color}
 * @internal
 */
export default Property.shorthand(
  ["border-inline-start-color", "border-inline-end-color"],
  map(
    takeBetween(delimited(option(Token.parseWhitespace), Color.parse), 1, 2),
    ([start, end = start]) => [
      ["border-inline-start-color", start],
      ["border-inline-end-color", end],
    ]
  )
);
