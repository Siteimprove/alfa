import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";
import { parse } from "./border-top";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end}
 * @internal
 */
export default Shorthand.of(
  [
    "border-inline-end-color",
    "border-inline-end-style",
    "border-inline-end-width",
  ],
  map(parse, ([color, style, width]) => [
    ["border-inline-end-color", color],
    ["border-inline-end-style", style],
    ["border-inline-end-width", width],
  ])
);
