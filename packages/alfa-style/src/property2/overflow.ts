import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";

import * as X from "./overflow-x";
import * as Y from "./overflow-y";

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
