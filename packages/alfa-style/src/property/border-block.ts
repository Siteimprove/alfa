import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { parse } from "./border-top";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-block": Property.Shorthand<
      | "border-block-start-color"
      | "border-block-start-style"
      | "border-block-start-width"
      | "border-block-end-color"
      | "border-block-end-style"
      | "border-block-end-width"
    >;
  }
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block}
 * @internal
 */
export default Property.registerShorthand(
  "border-block",
  Property.shorthand(
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
  )
);
