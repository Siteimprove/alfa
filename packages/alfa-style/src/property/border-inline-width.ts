import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { parse } from "./border-top-width";

const { delimited, map, option, takeBetween } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-inline-width": Property.Shorthand<
      "border-inline-start-width" | "border-inline-end-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-width}
 * @internal
 */
export default Property.registerShorthand(
  "border-inline-width",
  Property.shorthand(
    ["border-inline-start-width", "border-inline-end-width"],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 2),
      ([start, end = start]) => [
        ["border-inline-start-width", start],
        ["border-inline-end-width", end],
      ]
    )
  )
);
