import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand";
import * as Top from "./top";

const { takeBetween, map, delimited, option } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline}
 * @internal
 */
export default Shorthand.of(
  ["inset-inline-start", "inset-inline-end"],
  map(
    takeBetween(delimited(option(Token.parseWhitespace), Top.parse), 1, 2),
    ([start, end = start]) => [
      ["inset-inline-start", start],
      ["inset-inline-end", end],
    ]
  )
);
