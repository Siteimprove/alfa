import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import * as Top from "./top";

const { takeBetween, map, delimited, option } = Parser;

declare module "../property" {
  interface Shorthands {
    "inset-block": Property.Shorthand<"inset-block-start" | "inset-block-end">;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block}
 * @internal
 */
export default Property.registerShorthand(
  "inset-block",
  Property.shorthand(
    ["inset-block-start", "inset-block-end"],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), Top.parse), 1, 2),
      ([start, end = start]) => [
        ["inset-block-start", start],
        ["inset-block-end", end],
      ]
    )
);
