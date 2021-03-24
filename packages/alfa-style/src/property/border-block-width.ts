import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { parse } from "./border-top-width";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-width}
 * @internal
 */
export default Property.shorthand(
  ["border-block-start-width", "border-block-end-width"],
  map(
    takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 2),
    ([start, end = start]) => [
      ["border-block-start-width", start],
      ["border-block-end-width", end],
    ]
  )
);
