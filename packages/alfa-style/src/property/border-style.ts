import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { parse } from "./border-top-style";

const { delimited, map, option, takeBetween } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-style": Property.Shorthand<
      | "border-top-style"
      | "border-right-style"
      | "border-bottom-style"
      | "border-left-style"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-style}
 * @internal
 */
export default Property.registerShorthand(
  "border-style",
  Property.shorthand(
    [
      "border-top-style",
      "border-right-style",
      "border-bottom-style",
      "border-left-style",
    ],
    map(
      takeBetween(delimited(option(Token.parseWhitespace), parse), 1, 4),
      ([top, right = top, bottom = top, left = right]) => [
        ["border-top-style", top],
        ["border-right-style", right],
        ["border-bottom-style", bottom],
        ["border-left-style", left],
      ]
    )
  )
);
