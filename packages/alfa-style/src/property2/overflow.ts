import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import * as X from "./overflow-x";
import * as Y from "./overflow-y";

const { map, option, pair, delimited } = Parser;

declare module "../property" {
  interface Shorthands {
    overflow: Property.Shorthand<"overflow-x" | "overflow-y">;
  }
}

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
export default Property.registerShorthand(
  "overflow",
  Property.shorthand(
    ["overflow-x", "overflow-y"],
    map(parse, (result) => {
      const [x, y] = result;

      return [
        ["overflow-x", x],
        ["overflow-y", y.getOr(x)],
      ];
    })
);
