import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";
import { parse } from "./border-top";

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
  ])
);
