import { Color, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { delimited, map, option, takeBetween } = Parser;

const parse = takeBetween(
  delimited(option(Token.parseWhitespace), Color.parse),
  1,
  2
);
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-color}
 * @internal
 */
export default Property.shorthand(
  ["border-block-start-color", "border-block-end-color"],
  map(parse, ([start, end = start]) => [
    ["border-block-start-color", start],
    ["border-block-end-color", end],
  ])
);
