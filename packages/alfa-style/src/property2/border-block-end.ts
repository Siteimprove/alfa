import { Parser } from "@siteimprove/alfa-parser";

import { parse } from "./border-top";

const { map } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end}
 * @internal
 */
export default Property.shorthand(
    [
      "border-block-end-color",
      "border-block-end-style",
      "border-block-end-width",
    ],
    map(parse, ([color, style, width]) => [
      ["border-block-end-color", color],
      ["border-block-end-style", style],
      ["border-block-end-width", width],
    ])
);
