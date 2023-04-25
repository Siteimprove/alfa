import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import * as Top from "./top";

const { map, option, delimited, takeBetween } = Parser;

declare module "../property" {
  interface Shorthands {
    inset: Property.Shorthand<"top" | "right" | "bottom" | "left">;
  }
}

/**
 * @internal
 */
export const parse = takeBetween(
  delimited(option(Token.parseWhitespace), Top.parse),
  1,
  4
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset}
 * @internal
 */
export default Property.registerShorthand(
  "inset",
  Property.shorthand(
    ["top", "right", "bottom", "left"],
    map(parse, ([top, right = top, bottom = top, left = right]) => [
      ["top", top],
      ["right", right],
      ["bottom", bottom],
      ["left", left],
    ])
);
