import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand.js";
import { parse } from "./border-top.js";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-right}
 * @internal
 */
export default Shorthand.of(
  ["border-right-color", "border-right-style", "border-right-width"],
  map(parse, ([color, style, width]) => [
    ["border-right-color", color],
    ["border-right-style", style],
    ["border-right-width", width],
  ]),
);
