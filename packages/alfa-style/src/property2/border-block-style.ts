import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { parse } from "./border-top-style";

const { delimited, map, option, takeBetween } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-style}
 * @internal
 */
export default Property.shorthand(
    ["border-block-start-style", "border-block-end-style"],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 2),
      ([start, end = start]) => [
        ["border-block-start-style", start],
        ["border-block-end-style", end],
      ]
    )
);
