import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand";
import { parse } from "./border-top";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block}
 * @internal
 */
export default Shorthand.of(
  [
    "border-block-start-color",
    "border-block-start-style",
    "border-block-start-width",
    "border-block-end-color",
    "border-block-end-style",
    "border-block-end-width",
  ],
  map(parse, ([color, style, width]) => [
    ["border-block-start-color", color],
    ["border-block-start-style", style],
    ["border-block-start-width", width],
    ["border-block-end-color", color],
    ["border-block-end-style", style],
    ["border-block-end-width", width],
  ])
);
