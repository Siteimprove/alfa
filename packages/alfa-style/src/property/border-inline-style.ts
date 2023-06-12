import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand";
import Top from "./border-top-style";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-style}
 * @internal
 */
export default Shorthand.of(
  ["border-inline-start-style", "border-inline-end-style"],
  map(
    takeBetween(delimited(option(Token.parseWhitespace), Top.parseBase), 1, 2),
    ([start, end = start]) => [
      ["border-inline-start-style", start],
      ["border-inline-end-style", end],
    ]
  )
);
