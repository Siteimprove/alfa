import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand.ts";
import { parse } from "./border-top.ts";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-left}
 * @internal
 */
export default Shorthand.of(
  ["border-left-color", "border-left-style", "border-left-width"],
  map(parse, ([color, style, width]) => [
    ["border-left-color", color],
    ["border-left-style", style],
    ["border-left-width", width],
  ]),
);
