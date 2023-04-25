import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand";
import * as Top from "./margin-top";

const { map, option, delimited, takeBetween } = Parser;

/**
 * @internal
 */
export const parse = takeBetween(
  delimited(option(Token.parseWhitespace), Top.parse),
  1,
  4
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin}
 * @internal
 */
export default Shorthand.of(
  ["margin-top", "margin-right", "margin-bottom", "margin-left"],
  map(parse, ([top, right = top, bottom = top, left = right]) => [
    ["margin-top", top],
    ["margin-right", right],
    ["margin-bottom", bottom],
    ["margin-left", left],
  ])
);
