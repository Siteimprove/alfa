import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand";

import * as X from "./overflow-x";

/**
 * overflow-x and overflow-y are exactly the same.
 * We mimic it here to make the main parser less confusing.
 */
namespace Y {
  export const parse = X.parse;
}

const { map, option, pair, delimited } = Parser;

/**
 * @internal
 */
export const parse = pair(
  X.parse,
  option(delimited(option(Token.parseWhitespace), Y.parse))
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overflow}
 * @internal
 */
export default Shorthand.of(
  ["overflow-x", "overflow-y"],
  map(parse, (result) => {
    const [x, y] = result;

    return [
      ["overflow-x", x],
      ["overflow-y", y.getOr(x)],
    ];
  })
);
