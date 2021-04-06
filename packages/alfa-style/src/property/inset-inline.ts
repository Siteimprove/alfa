import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import * as Top from "./top";

const { takeBetween, map, delimited, option } = Parser;

declare module "../property" {
  interface Shorthands {
    "inset-inline": Property.Shorthand<
      "inset-inline-start" | "inset-inline-end"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline}
 * @internal
 */
export default Property.registerShorthand(
  "inset-inline",
  Property.shorthand(
    ["inset-inline-start", "inset-inline-end"],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), Top.parse), 1, 2),
      ([start, end = start]) => [
        ["inset-inline-start", start],
        ["inset-inline-end", end],
      ]
    )
  )
);
