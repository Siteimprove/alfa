import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";
import { parse } from "./border-top-color";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-color}
 * @internal
 */
export default Shorthand.of(
  ["border-inline-start-color", "border-inline-end-color"],
  map(
    takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 2),
    ([start, end = start]) => [
      ["border-inline-start-color", start],
      ["border-inline-end-color", end],
    ]
  )
);
