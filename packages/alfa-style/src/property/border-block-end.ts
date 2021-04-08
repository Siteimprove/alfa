import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-block-end": Property.Shorthand<
      | "border-block-end-color"
      | "border-block-end-style"
      | "border-block-end-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end}
 * @internal
 */
export default Property.registerShorthand(
  "border-block-end",
  Property.shorthand(
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
  )
);
