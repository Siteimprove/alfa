import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";
import { parse } from "./border-top";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom}
 * @internal
 */
export default Shorthand.of(
  ["border-bottom-color", "border-bottom-style", "border-bottom-width"],
  map(parse, ([color, style, width]) => [
    ["border-bottom-color", color],
    ["border-bottom-style", style],
    ["border-bottom-width", width],
  ])
);
