import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { parse } from "./border-top-style";

const { delimited, map, option, takeBetween } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-inline-style": Property.Shorthand<
      "border-inline-start-style" | "border-inline-end-style"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-style}
 * @internal
 */
export default Property.registerShorthand(
  "border-inline-style",
  Property.shorthand(
    ["border-inline-start-style", "border-inline-end-style"],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 2),
      ([start, end = start]) => [
        ["border-inline-start-style", start],
        ["border-inline-end-style", end],
      ]
    )
  )
);
