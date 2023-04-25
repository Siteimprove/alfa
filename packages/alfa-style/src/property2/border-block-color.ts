import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";
import { parse } from "./border-top-color";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-color}
 * @internal
 */
export default Shorthand.of(
  ["border-block-start-color", "border-block-end-color"],
  map(
    takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 2),
    ([start, end = start]) => [
      ["border-block-start-color", start],
      ["border-block-end-color", end],
    ]
  )
);
