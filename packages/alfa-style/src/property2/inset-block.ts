import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";
import * as Top from "./top";

const { takeBetween, map, delimited, option } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block}
 * @internal
 */
export default Shorthand.of(
  ["inset-block-start", "inset-block-end"],
  map(
    takeBetween(delimited(option(Token.parseWhitespace), Top.parse), 1, 2),
    ([start, end = start]) => [
      ["inset-block-start", start],
      ["inset-block-end", end],
    ]
  )
);
