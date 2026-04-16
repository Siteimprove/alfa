import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand.ts";

import { parse } from "./border-top.ts";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start}
 * @internal
 */
export default Shorthand.of(
  [
    "border-block-start-color",
    "border-block-start-style",
    "border-block-start-width",
  ],
  map(parse, ([color, style, width]) => [
    ["border-block-start-color", color],
    ["border-block-start-style", style],
    ["border-block-start-width", width],
  ]),
);
