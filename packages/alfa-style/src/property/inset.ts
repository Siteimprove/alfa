import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand";

import * as Top from "./top";

const { map, option, delimited, takeBetween } = Parser;

const parse = takeBetween(
  delimited(option(Token.parseWhitespace), Top.parse),
  1,
  4
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/inset}
 * @internal
 */
export default Shorthand.of<"top" | "right" | "bottom" | "left">(
  ["top", "right", "bottom", "left"],
  map(parse, ([top, right = top, bottom = top, left = right]) => [
    ["top", top],
    ["right", right],
    ["bottom", bottom],
    ["left", left],
  ])
);
