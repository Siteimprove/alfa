import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand.js";
import { parse } from "./border-top.js";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline}
 * @internal
 */
export default Shorthand.of(
  [
    "border-inline-start-color",
    "border-inline-start-style",
    "border-inline-start-width",
    "border-inline-end-color",
    "border-inline-end-style",
    "border-inline-end-width",
  ],
  map(parse, ([color, style, width]) => [
    ["border-inline-start-color", color],
    ["border-inline-start-style", style],
    ["border-inline-start-width", width],
    ["border-inline-end-color", color],
    ["border-inline-end-style", style],
    ["border-inline-end-width", width],
  ]),
);
